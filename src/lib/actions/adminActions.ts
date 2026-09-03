'use server'

import { OrderService } from '@/services/OrderService'
import { BookingService } from '@/services/BookingService'
import { createCalendarEvent } from '@/lib/googleCalendar'
import { EmailService } from '@/services/EmailService'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { createAdminClient } from '@/lib/supabase/server'

export async function getAdminOrders() {
    try {
        return await OrderService.getAdminList()
    } catch (error) {
        console.error('Error fetching admin orders in action:', error)
        return []
    }
}

export async function deleteOrderAction(orderId: string) {
    try {
        const supabase = createAdminClient()

        // 1. Fetch order items to find associated bookings
        const { data: items } = await supabase
            .from('order_items')
            .select('booking_id')
            .eq('order_id', orderId)

        const bookingIds = (items || []).map(item => item.booking_id).filter(Boolean) as string[]

        // 2. Delete associated bookings if any
        if (bookingIds.length > 0) {
            await supabase
                .from('bookings')
                .delete()
                .in('id', bookingIds)
        }

        // 3. Delete order items
        await supabase
            .from('order_items')
            .delete()
            .eq('order_id', orderId)

        // 4. Delete the order itself
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId)

        if (error) throw error

        revalidatePath('/admin')
        revalidatePath('/admin/orders')
        revalidatePath('/admin/bookings')

        return { success: true }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        console.error('Error deleting order in action:', error)
        return { success: false, error: message }
    }
}

export async function processOrderStatusChange(orderId: string, newStatus: string) {
    try {
        // 1. Fetch Order details using Service
        const order = await OrderService.getById(orderId)
        if (!order) throw new Error('Pedido no encontrado')

        // 2. Fetch Order Items
        const items = await OrderService.getItems(orderId)
        const isBooking = items.some(i => !!i.service_id)

        // Resolve customer email and name with deep fallbacks (order -> profile -> linked booking)
        let customerEmail = (order.customer_email || order.profiles?.email || '').trim()
        let customerName = order.customer_name || order.profiles?.full_name || 'Cliente Mágico'

        if (!customerEmail) {
            for (const item of items) {
                const b = (item.booking_id ? await BookingService.getById(item.booking_id) : null)
                    || (item.service_id ? await BookingService.findByOrderNote(orderId, item.service_id) : null)
                if (b?.customer_email) {
                    customerEmail = b.customer_email.trim()
                    if (!order.customer_name && b.customer_name) {
                        customerName = b.customer_name
                    }
                    break
                }
            }
        }

        // 3. Update Order Status in DB via Service
        await OrderService.updateStatus(
            orderId,
            newStatus,
            newStatus.toLowerCase() === 'paid' ? 'paid' : undefined
        )

        // 4. Side effects for "paid" status
        if (newStatus.toLowerCase() === 'paid') {
            for (const item of items) {
                if (item.service_id) {
                    try {
                        let booking = null

                        if (item.booking_id) {
                            booking = await BookingService.getById(item.booking_id)
                        }

                        if (!booking) {
                            booking = await BookingService.findByOrderNote(orderId, item.service_id)
                        }

                        if (booking) {
                            // Update Booking to confirmed via Service
                            if (booking.status !== 'confirmed') {
                                await BookingService.updateStatus(booking.id, 'confirmed')
                            }

                            // Create Google Calendar Event if not created yet
                            if (!booking.google_calendar_id && booking.start_time) {
                                try {
                                    const duration = item.duration_minutes || 60
                                    const startTime = new Date(booking.start_time)
                                    const endTime = new Date(startTime.getTime() + duration * 60000)

                                    const nameLower = item.product_name?.toLowerCase() || ''
                                    const isRitual = nameLower.includes('ritual') || nameLower.includes('limpieza') || nameLower.includes('velación') || nameLower.includes('endulzamiento')

                                    const event = await createCalendarEvent(
                                        `${item.product_name} - ${customerName}`,
                                        `Pedido #${orderId.slice(-6)}\nServicio: ${item.product_name}\nCliente: ${customerName}\nEmail: ${customerEmail || ''}`,
                                        startTime.toISOString(),
                                        endTime.toISOString(),
                                        customerEmail ? [{ email: customerEmail }] : [],
                                        isRitual ? 'transparent' : 'opaque'
                                    )

                                    // Update booking with event ID via Service
                                    if (event?.id) {
                                        await BookingService.updateGoogleCalendarId(booking.id, event.id)
                                    }
                                } catch (calErr) {
                                    console.error('Error creating Google Calendar event (non-blocking):', calErr)
                                }
                            }
                        }
                    } catch (e) {
                        console.error('Error processing booking for item:', item.id, e)
                    }
                }
            }
        }

        // 5. Send Email Notification
        if (customerEmail) {
            try {
                if (newStatus.toLowerCase() === 'paid') {
                    // Send full Order Confirmation Email
                    const emailItems = await Promise.all(items.map(async (i) => {
                        let bookingDate: string | undefined
                        let bookingTime: string | null = null

                        if (i.service_id) {
                            const b = (i.booking_id ? await BookingService.getById(i.booking_id) : null)
                                || await BookingService.findByOrderNote(orderId, i.service_id)
                            if (b?.start_time) {
                                const dt = new Date(b.start_time)
                                const nameLower = i.product_name?.toLowerCase() || ''
                                const isRitual = nameLower.includes('ritual') || nameLower.includes('limpieza') || nameLower.includes('velación') || nameLower.includes('endulzamiento')
                                bookingDate = format(dt, "d 'de' MMMM", { locale: es })
                                bookingTime = isRitual ? null : (format(dt, "HH:mm") + 'hs')
                            }
                        }

                        return {
                            name: i.product_name || 'Servicio o Producto',
                            quantity: Number(i.quantity || 1),
                            price: Number(i.unit_price || 0),
                            type: i.service_id ? 'service' : 'physical',
                            variantName: i.selected_variant?.variant || i.selected_variant?.name || null,
                            bookingDate,
                            bookingTime
                        }
                    }))

                    const shippingAddressStr = order.requires_shipping
                        ? `${order.shipping_address || ''}${order.shipping_city ? `, ${order.shipping_city}` : ''}`
                        : (isBooking ? 'Servicio Digital / Presencial' : 'Digital')

                    await EmailService.sendOrderConfirmation(
                        customerEmail,
                        customerName,
                        orderId,
                        emailItems,
                        Number(order.total || 0),
                        shippingAddressStr,
                        isBooking,
                        Number(order.subtotal || 0),
                        Number(order.shipping_cost || 0)
                    )
                } else {
                    // Send Status Update Email for other statuses
                    await EmailService.sendStatusUpdate(
                        customerEmail,
                        customerName,
                        orderId,
                        newStatus,
                        isBooking
                    )
                }
            } catch (emailErr) {
                console.error('Error sending email notification during order status change:', emailErr)
            }
        } else {
            console.warn(`[adminActions] No customer email found for order ${orderId}; skipped customer email dispatch.`)
        }

        revalidatePath('/admin')
        revalidatePath('/admin/orders')
        revalidatePath('/admin/bookings')

        return { success: true }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        console.error('Error in processOrderStatusChange:', error)
        return { success: false, error: message }
    }
}

