import { BookingService } from '@/services/BookingService'
import { OrderService } from '@/services/OrderService'
import { EmailService } from '@/services/EmailService'
import { NextResponse } from 'next/server'
import { CheckoutSchema } from '@/lib/validations'

function parseBookingStartTime(startTimeStr: string): Date {
    if (startTimeStr.includes('Todo el día')) {
        return new Date(startTimeStr.replace(' Todo el día', 'T00:00:00'))
    }
    const d = new Date(startTimeStr)
    if (!isNaN(d.getTime())) return d;

    const rawDate = startTimeStr.split(' ')[0]
    return new Date(`${rawDate}T00:00:00`)
}

export async function POST(request: Request) {
    try {
        const payload = await request.json()

        // Validate with Zod
        const validation = CheckoutSchema.safeParse(payload)
        if (!validation.success) {
            console.error('API Checkout Zod Validation Error:', JSON.stringify(validation.error.format(), null, 2))
            return NextResponse.json({
                error: 'Datos de checkout inválidos',
                details: validation.error.format()
            }, { status: 400 })
        }

        const {
            user_id, items, subtotal, shipping_cost, total,
            requires_shipping, shipping_address, shipping_city,
            shipping_postal_code, fullName, email, phone
        } = validation.data

        // 0. Availability Check via Service
        for (const item of items) {
            if (item.type === 'service' && item.bookingData?.startTime) {
                const startTime = parseBookingStartTime(item.bookingData.startTime)
                const duration = item.durationMinutes || 60

                const availability = await BookingService.checkAvailability(startTime, duration, item.name)
                if (!availability.isAvailable) {
                    return NextResponse.json({ error: availability.error }, { status: 409 })
                }
            }
        }

        // 1. Create Order via Service
        const order = await OrderService.create({
            user_id, subtotal, shipping_cost, total,
            payment_status: 'pending',
            requires_shipping, shipping_address,
            shipping_city, shipping_postal_code,
            customer_email: email, customer_name: fullName,
            customer_phone: phone
        })

        // 2. Process Items & Bookings
        const orderItemsToInsert = []

        for (const item of items) {
            let bookingId = null
            if (item.type === 'service' && item.bookingData?.startTime) {
                const startTimeStr = item.bookingData.startTime
                const nameLower = item.name.toLowerCase()
                const isRitual = nameLower.includes('ritual') || nameLower.includes('limpieza') || nameLower.includes('velación') || nameLower.includes('endulzamiento')

                const startTime = parseBookingStartTime(startTimeStr)
                if (isRitual) startTime.setHours(21, 0, 0, 0)

                const duration = item.durationMinutes || 60
                const endTime = new Date(startTime.getTime() + duration * 60000)

                const booking = await BookingService.create({
                    user_id: user_id || null,
                    service_id: item.productId,
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    status: 'pending',
                    customer_name: fullName,
                    customer_email: email,
                    customer_phone: phone,
                    notes: `Pedido #${order.id}. ${item.bookingData.notes || ''}`
                })
                bookingId = booking.id
            }

            orderItemsToInsert.push({
                order_id: order.id,
                product_id: item.type === 'physical' ? item.productId : null,
                service_id: item.type === 'service' ? item.productId : null,
                product_name: item.name,
                quantity: item.quantity,
                unit_price: item.price,
                selected_variant: item.variantName ? { variant: item.variantName } : null,
                booking_id: bookingId
            })
        }

        await OrderService.addItems(orderItemsToInsert)

        // 3. Send Confirmation Email via Service
        if (email) {
            const isBooking = items.some(i => i.type === 'service')
            const emailItems = items.map(i => {
                let bookingDate, bookingTime;
                if (i.bookingData && i.bookingData.startTime) {
                    const dt = parseBookingStartTime(i.bookingData.startTime);
                    const nameLower = i.name.toLowerCase();
                    const isRitual = nameLower.includes('ritual') || nameLower.includes('limpieza') || nameLower.includes('velación') || nameLower.includes('endulzamiento');

                    bookingDate = dt.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
                    bookingTime = isRitual ? null : (dt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + 'hs');
                }
                return {
                    name: i.name, quantity: i.quantity, price: i.price,
                    variantName: i.variantName, bookingDate, bookingTime
                }
            })

            await EmailService.sendOrderConfirmation(
                email,
                fullName,
                order.id,
                emailItems,
                total,
                requires_shipping ? `${shipping_address}, ${shipping_city}` : 'Digital',
                isBooking,
                subtotal,
                shipping_cost
            )
        }

        return NextResponse.json({ success: true, orderId: order.id })
    } catch (error: unknown) {
        console.error('API Checkout Error:', error)
        const message = error instanceof Error ? error.message : 'Internal Server Error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
