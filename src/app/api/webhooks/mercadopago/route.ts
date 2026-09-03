import { NextResponse } from 'next/server'
import { mercadopago } from '@/lib/mercadopago'
import { OrderService } from '@/services/OrderService'
import { BookingService } from '@/services/BookingService'
import { EmailService } from '@/services/EmailService'
import { createCalendarEvent } from '@/lib/googleCalendar'
import { createClient } from '@/lib/supabase/server'

// In-memory set for delivery idempotency to protect against rapid duplicate webhooks
const processedPaymentIds = new Set<string>()

export async function GET() {
    return NextResponse.json({ status: 'active', message: 'Mercado Pago Webhook Endpoint' })
}

export async function POST(request: Request) {
    try {
        const url = new URL(request.url)
        const searchParams = url.searchParams

        let body: any = null
        try {
            body = await request.json()
        } catch {
            body = null
        }

        // Support both body payload and legacy query parameters
        const topic = body?.topic || body?.type || searchParams.get('topic') || searchParams.get('type')
        const paymentId = body?.data?.id || body?.id || searchParams.get('data.id') || searchParams.get('id')

        // Validate webhook contract
        if (!topic || (topic !== 'payment' && topic !== 'merchant_order')) {
            return NextResponse.json({
                error: "Webhook topic/type must be 'payment' or 'merchant_order'"
            }, { status: 400 })
        }

        if (!paymentId) {
            return NextResponse.json({
                error: 'Webhook payload missing payment ID'
            }, { status: 400 })
        }

        const paymentIdStr = String(paymentId)

        // Idempotency check: if this payment has already completed processing in this process
        if (processedPaymentIds.has(paymentIdStr)) {
            return NextResponse.json({
                action: 'ignored_duplicate',
                status: 200,
                message: 'Duplicate webhook already processed'
            }, { status: 200 })
        }

        // Register immediately to prevent race conditions during async payment lookup
        processedPaymentIds.add(paymentIdStr)

        // Fetch payment details from Mercado Pago
        let paymentStatus = 'pending'
        let externalReference: string | null = null

        if (topic === 'payment') {
            const payment = await mercadopago.getPayment(paymentIdStr)
            paymentStatus = payment.status
            externalReference = payment.external_reference || body?.external_reference || searchParams.get('external_reference')
        } else if (topic === 'merchant_order') {
            const merchantOrder = await mercadopago.getMerchantOrder(paymentIdStr)
            if (merchantOrder?.payments?.length > 0) {
                const firstPayment = merchantOrder.payments[0]
                paymentStatus = firstPayment.status
            } else if (merchantOrder?.status === 'closed') {
                paymentStatus = 'approved'
            }
            externalReference = merchantOrder?.external_reference || body?.external_reference || searchParams.get('external_reference')
        }

        // Non-approved payment handling: keep order as pending or cancelled without triggering paid effects
        if (paymentStatus !== 'approved') {
            if (externalReference) {
                try {
                    const mappedStatus = (paymentStatus === 'rejected' || paymentStatus === 'cancelled') ? 'cancelled' : 'pending'
                    await OrderService.updateStatus(externalReference, mappedStatus)

                    // When payment is rejected/cancelled, cancel associated bookings to free up the 30-minute calendar lock
                    if (mappedStatus === 'cancelled') {
                        const items = await OrderService.getItems(externalReference)
                        for (const item of items) {
                            if (item.service_id) {
                                let booking = await BookingService.findByOrderNote(externalReference, item.service_id)
                                if (!booking && item.booking_id) {
                                    const supabase = await createClient()
                                    const { data: b } = await supabase.from('bookings').select('*').eq('id', item.booking_id).single()
                                    booking = b
                                }
                                if (booking && booking.status === 'pending') {
                                    await BookingService.updateStatus(booking.id, 'cancelled')
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.warn('Could not update order status for non-approved payment:', e)
                }
            }
            return NextResponse.json({
                status: paymentStatus,
                message: `Payment status is ${paymentStatus}, not approved`
            }, { status: 200 })
        }

        // If no external reference exists, we acknowledge simulation successfully
        if (!externalReference) {
            return NextResponse.json({
                success: true,
                paymentId: paymentIdStr,
                status: 'approved',
                message: 'Payment approved (simulation payload without order reference)'
            }, { status: 200 })
        }

        const orderId = externalReference

        // 1. Fetch Order details
        let order: any = null
        try {
            order = await OrderService.getById(orderId)
        } catch (err) {
            console.warn(`Order ${orderId} not found in DB (likely simulation/test):`, err)
            return NextResponse.json({
                success: true,
                orderId,
                paymentId: paymentIdStr,
                status: 'approved',
                message: 'Payment approved, order not in database'
            }, { status: 200 })
        }

        if (!order) {
            return NextResponse.json({
                success: true,
                orderId,
                status: 'approved',
                message: 'Order record empty'
            }, { status: 200 })
        }

        // Check if order was already paid in DB
        if (order.payment_status === 'approved') {
            return NextResponse.json({
                action: 'ignored_duplicate',
                status: 200,
                message: 'Order already marked as paid'
            }, { status: 200 })
        }

        // 2. Update Order in DB to 'approved'
        await OrderService.updateStatus(orderId, 'approved', paymentIdStr)

        // 3. Process Order Items: update bookings to 'confirmed' and create Google Calendar events
        const items = await OrderService.getItems(orderId)
        const customerEmail = order.customer_email || order.profiles?.email
        const customerName = order.customer_name || order.profiles?.full_name || 'Cliente Mágico'

        for (const item of items) {
            if (item.service_id) {
                try {
                    let booking = await BookingService.findByOrderNote(orderId, item.service_id)

                    if (!booking && item.booking_id) {
                        const supabase = await createClient()
                        const { data: b } = await supabase.from('bookings').select('*').eq('id', item.booking_id).single()
                        booking = b
                    }

                    if (booking && booking.status === 'pending') {
                        // Confirm booking status
                        await BookingService.updateStatus(booking.id, 'confirmed')

                        // Calculate timing
                        const nameLower = item.product_name?.toLowerCase() || ''
                        const isRitual = nameLower.includes('ritual') || nameLower.includes('limpieza') || nameLower.includes('velación') || nameLower.includes('endulzamiento')

                        const startTime = new Date(booking.start_time)
                        if (isRitual) {
                            startTime.setHours(21, 0, 0, 0)
                        }
                        const duration = item.duration_minutes || 60
                        const endTime = new Date(startTime.getTime() + duration * 60000)

                        // Trigger Google Calendar event creation
                        try {
                            const event = await createCalendarEvent(
                                `${item.product_name} - ${customerName}`,
                                `Pedido #${orderId.slice(-6)}\nServicio: ${item.product_name}\nCliente: ${customerName}\nEmail: ${customerEmail || ''}`,
                                startTime.toISOString(),
                                endTime.toISOString(),
                                customerEmail ? [{ email: customerEmail }] : [],
                                isRitual ? 'transparent' : 'opaque'
                            )

                            if (event?.id) {
                                await BookingService.updateGoogleCalendarId(booking.id, event.id)
                            }
                        } catch (calErr) {
                            console.error('Failed to create calendar event during webhook processing:', calErr)
                        }
                    }
                } catch (serviceErr) {
                    console.error('Error processing service booking in webhook:', item.id, serviceErr)
                }
            }
        }

        // 4. Trigger Email Confirmation via EmailService
        if (customerEmail) {
            try {
                const isBooking = items.some(i => !!i.service_id)
                const emailItems = items.map(i => ({
                    name: i.product_name,
                    quantity: i.quantity,
                    price: i.unit_price,
                    variantName: i.selected_variant?.variant || null
                }))

                await EmailService.sendOrderConfirmation(
                    customerEmail,
                    customerName,
                    orderId,
                    emailItems,
                    order.total,
                    order.requires_shipping ? `${order.shipping_address || ''}, ${order.shipping_city || ''}` : 'Digital',
                    isBooking,
                    order.subtotal,
                    order.shipping_cost
                )
            } catch (emailErr) {
                console.error('Failed to send order confirmation email during webhook processing:', emailErr)
            }
        }

        return NextResponse.json({
            success: true,
            orderId,
            status: 'approved',
            paymentStatus: 'paid'
        }, { status: 200 })

    } catch (error: unknown) {
        console.error('Fatal error in Mercado Pago webhook:', error)
        const message = error instanceof Error ? error.message : 'Internal Server Error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
