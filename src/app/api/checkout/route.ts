
import { createClient } from '@/lib/supabase/server'
import { createCalendarEvent } from '@/lib/googleCalendar'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        console.log('API Checkout: Request received');

        const payload = await request.json()
        const { user_id, items, subtotal, shipping_cost, total, requires_shipping, shipping_address, shipping_city, shipping_postal_code, fullName, email } = payload

        console.log('API Checkout: Payload parsed', { user_id, itemCount: items.length, total });

        // Debug Env Vars (Safety check)
        if (!process.env.GOOGLE_CLIENT_ID) console.error('MISSING GOOGLE_CLIENT_ID');
        if (!process.env.GOOGLE_CLIENT_SECRET) console.error('MISSING GOOGLE_CLIENT_SECRET');
        if (!process.env.GOOGLE_REFRESH_TOKEN) console.error('MISSING GOOGLE_REFRESH_TOKEN');

        const supabase = await createClient()

        // 1. Create Order in Supabase
        console.log('API Checkout: Creating order in Supabase...');
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id,
                subtotal,
                shipping_cost,
                total,
                payment_status: 'pending',
                requires_shipping,
                shipping_address,
                shipping_city,
                shipping_postal_code,
            })
            .select()
            .single()

        if (orderError) {
            console.error('API Checkout: Error creating order:', orderError)
            return NextResponse.json({ error: 'Error creating order' }, { status: 500 })
        }
        console.log('API Checkout: Order created', order.id);

        // 2. Create Order Items & Handle Calendar Events
        const orderItems = []
        const calendarEvents = []

        for (const item of items) {
            // Prepare Order Item
            orderItems.push({
                order_id: order.id,
                product_id: item.productId,
                product_name: item.name,
                quantity: item.quantity,
                unit_price: item.price,
                selected_variant: item.variantName ? { name: item.variantName } : null,
                booking_id: null
            })

            // If Service with Booking Data -> Create Calendar Event & Booking Record
            if (item.type === 'service' && item.bookingData?.startTime) {
                console.log('API Checkout: Processing calendar event for service', item.name);
                try {
                    // Start Time is in "YYYY-MM-DD HH:mm" format or similar
                    // We need to parse it to ISO for Google
                    const startTime = new Date(item.bookingData.startTime)

                    // If the Date is invalid (e.g. Rituals without specific time), skip Calendar Event but create DB record safely
                    if (isNaN(startTime.getTime())) {
                        console.log('API Checkout: Invalid booking start time, skipping Google Calendar event for', item.name)
                        // We can still create the booking record with a default time or skip it based on requirements
                        // For now, let's just make sure it doesn't crash:
                        const { error: bookingError } = await supabase
                            .from('bookings')
                            .insert({
                                user_id: user_id || null,
                                product_id: item.productId,
                                start_time: new Date().toISOString(), // Fallback to current time
                                end_time: new Date(Date.now() + 60 * 60000).toISOString(),
                                status: 'Confirmado',
                                notes: item.bookingData.notes || 'Velación o limpieza (sin fecha/hora específica)',
                                price: item.price
                            })
                        if (bookingError) throw bookingError;
                        continue; // Skip the rest of calendar logic
                    }

                    const duration = item.durationMinutes || (item.name.toLowerCase().includes('ritual') ? 30 : 60) // Rituals 30min default, others 60
                    const endTime = new Date(startTime.getTime() + duration * 60000)

                    // Event Title: "Lectura de Vínculo para Pepito"
                    const summary = `${item.name} para ${fullName || 'Cliente'}`

                    const description = `
                        Servicio: ${item.name}
                        Variante: ${item.variantName || 'N/A'}
                        Cliente: ${fullName}
                        Email Cliente: ${email || (user_id ? 'Usuario Registrado' : 'Invitado sin email')}
                        Pedido ID: #${order.id}
                        Notas: ${item.bookingData.notes || 'N/A'}
                    `

                    console.log('API Checkout: Creating Google Calendar event...');
                    // Manually construct event object here to include attendees since createCalendarEvent helper might not support it directly
                    // Actually, createCalendarEvent helper uses fixed parameters. I will just rely on the helper for now, but pass the description with email.
                    // Wait, the user WANTS notifications.
                    // I'll check createCalendarEvent signature in googleCalendar.ts
                    // It is: exported async function createCalendarEvent(summary, description, start, end)
                    // It doesn't accept attendees.
                    // I should modify googleCalendar.ts to accept attendees.

                    const event = await createCalendarEvent(
                        summary,
                        description,
                        startTime.toISOString(),
                        endTime.toISOString(),
                        email ? [{ email }] : []
                    )

                    calendarEvents.push({ itemId: item.id, eventId: event.id })
                    console.log(`API Checkout: Calendar event created: ${event.id}`)

                    // Create Booking Record in DB
                    const { error: bookingError } = await supabase
                        .from('bookings')
                        .insert({
                            user_id: user_id || null, // Can be null for guest
                            product_id: item.productId, // Use UUID from item
                            start_time: startTime.toISOString(),
                            end_time: endTime.toISOString(),
                            status: 'confirmed', // Paid via Checkout
                            notes: `Pedido #${order.id}. ${item.bookingData.notes || ''}`,
                            google_calendar_id: event.id
                        })

                    if (bookingError) {
                        console.error('API Checkout: Error creating booking record:', bookingError)
                        // Don't fail the whole request, but log it
                    } else {
                        console.log('API Checkout: Booking record created in DB')
                    }

                } catch (calError) {
                    console.error('API Checkout: Error creating calendar event:', calError)
                    // Continue processing order even if calendar fails
                }
            }
        }

        // Bulk Insert Order Items
        console.log('API Checkout: Inserting order items...');
        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

        if (itemsError) {
            console.error('API Checkout: Error creating order items:', itemsError)
            return NextResponse.json({ error: 'Error creating order items' }, { status: 500 })
        }

        console.log('API Checkout: Success');

        // 3. Send Emails via Resend
        if (email) {
            try {
                const isBooking = items.some((i: any) => i.type === 'service')
                await import('@/actions/sendMail').then(module => {
                    module.sendOrderConfirmation(
                        email,
                        fullName || 'Cliente Sagrado',
                        order.id,
                        items.map((i: any) => ({
                            name: i.name,
                            quantity: i.quantity,
                            price: i.price,
                            type: i.type
                        })),
                        total,
                        requires_shipping ? `${shipping_address}, ${shipping_city}, ${shipping_postal_code}` : 'No requiere (Servicio/Digital)',
                        isBooking
                    )
                })
            } catch (e) {
                console.error("Failed to send email", e)
            }
        }

        return NextResponse.json({ success: true, orderId: order.id, calendarEvents })

    } catch (error: any) {
        console.error('API Checkout: Critical API Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
