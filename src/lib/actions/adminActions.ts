'use server'

import { OrderService } from '@/services/OrderService'
import { BookingService } from '@/services/BookingService'
import { createCalendarEvent } from '@/lib/googleCalendar'
import { sendStatusUpdateEmail } from './sendMail'

export async function processOrderStatusChange(orderId: string, newStatus: string) {
    try {
        // 1. Fetch Order details using Service
        const order = await OrderService.getById(orderId)
        if (!order) throw new Error('Pedido no encontrado')

        // 2. Update Order Status in DB via Service

        await OrderService.updateStatus(
            orderId,
            newStatus,
            newStatus.toLowerCase() === 'paid' ? 'paid' : undefined
        )

        // 3. Side effects for "paid" status
        if (newStatus.toLowerCase() === 'paid') {
            const items = await OrderService.getItems(orderId)

            for (const item of items) {
                if (item.service_id) {
                    try {
                        let booking = await BookingService.findByOrderNote(orderId, item.service_id)

                        if (!booking && item.booking_id) {
                            // Fallback to fetch by ID if note search fails but item has booking_id
                            const supabase = (await import('@/lib/supabase/server')).createClient() // Special case for direct check if needed, but better use service
                            const { data: b } = await (await supabase).from('bookings').select('*').eq('id', item.booking_id).single()
                            booking = b
                        }

                        if (booking && booking.status === 'pending') {
                            // Update Booking to confirmed via Service
                            await BookingService.updateStatus(booking.id, 'confirmed')

                            // Create Google Calendar Event
                            const customerEmail = order.customer_email || order.profiles?.email
                            const customerName = order.customer_name || order.profiles?.full_name || 'Cliente'

                            const duration = item.duration_minutes || 60
                            const endTime = new Date(new Date(booking.start_time).getTime() + duration * 60000)



                            const nameLower = item.product_name?.toLowerCase() || ''
                            const isRitual = nameLower.includes('ritual') || nameLower.includes('limpieza') || nameLower.includes('velación') || nameLower.includes('endulzamiento');

                            const event = await createCalendarEvent(
                                `${item.product_name} - ${customerName}`,
                                `Pedido #${orderId.slice(-6)}\nServicio: ${item.product_name}\nCliente: ${customerName}\nEmail: ${customerEmail}`,
                                booking.start_time,
                                endTime.toISOString(),
                                customerEmail ? [{ email: customerEmail }] : [],
                                isRitual ? 'transparent' : 'opaque'
                            )

                            // Update booking with event ID via Service
                            if (event?.id) {
                                await BookingService.updateGoogleCalendarId(booking.id, event.id)
                            }
                        }
                    } catch (e) {
                        console.error('Error processing booking for item:', item.id, e)
                    }
                }
            }
        }

        // 4. Send Email Notification
        const customerEmail = order.customer_email || order.profiles?.email
        const customerName = order.customer_name || order.profiles?.full_name || 'Cliente Mágico'

        if (customerEmail) {
            await sendStatusUpdateEmail(
                customerEmail,
                customerName,
                orderId,
                newStatus,
                false
            )
        }

        return { success: true }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        console.error('Error in processOrderStatusChange:', error)
        return { success: false, error: message }
    }
}
