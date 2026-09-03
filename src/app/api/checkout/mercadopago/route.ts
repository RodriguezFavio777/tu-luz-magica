import { NextResponse } from 'next/server'
import { mercadopago, MercadoPagoPreferenceItem } from '@/lib/mercadopago'

function getBaseUrl(request: Request): string {
    const host = request.headers.get('host')
    const proto = request.headers.get('x-forwarded-proto') || 'https'
    if (host) {
        return `${proto}://${host}`
    }
    return process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://tuluzmagica.com'
}

export async function POST(request: Request) {
    try {
        const body = await request.json()

        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Payload must be an object' }, { status: 400 })
        }

        const { items, orderId, shipping_cost, customer } = body

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Preference requires non-empty items array' }, { status: 400 })
        }

        // Validate items and ensure genuine pricing
        for (const item of items) {
            if (!item.name && !item.title) {
                return NextResponse.json({ error: 'Item requires title or name' }, { status: 400 })
            }
            const price = typeof item.price === 'number' ? item.price : item.unit_price
            if (typeof price !== 'number' || price <= 0) {
                return NextResponse.json({ error: 'Item requires positive unit_price' }, { status: 400 })
            }
            const quantity = typeof item.quantity === 'number' ? item.quantity : 1
            if (quantity <= 0) {
                return NextResponse.json({ error: 'Item requires positive quantity' }, { status: 400 })
            }
            if (item.currency_id && item.currency_id !== 'ARS') {
                return NextResponse.json({ error: "Preference must enforce currency_id 'ARS'" }, { status: 400 })
            }
        }

        // Determine if cart has physical goods for shipping requirement
        const hasPhysical = items.some((i: { type?: string }) => i.type === 'physical')
        const calculatedShippingCost = hasPhysical && typeof shipping_cost === 'number' && shipping_cost > 0
            ? Math.round(shipping_cost * 100) / 100
            : 0

        const calculatedSubtotal = items.reduce((sum: number, item: { price?: number, unit_price?: number, quantity: number, type?: string }) => {
            const p = typeof item.price === 'number' ? item.price : (item.unit_price || 0)
            const q = item.type === 'service' ? 1 : item.quantity
            return sum + (p * q)
        }, 0)

        const externalRef = orderId || body.external_reference || `ord-${Date.now()}`
        const baseUrl = getBaseUrl(request)

        // Build preference items mapped from cart items
        const prefItems: MercadoPagoPreferenceItem[] = items.map((item: {
            id?: string
            productId?: string
            name?: string
            title?: string
            price?: number
            unit_price?: number
            quantity: number
            type?: string
            bookingData?: { startTime?: string; date?: string; time?: string }
        }) => {
            const title = item.name || item.title || 'Producto Tu Luz Mágica'
            const price = typeof item.price === 'number' ? item.price : (item.unit_price || 0)
            const quantity = item.type === 'service' ? 1 : item.quantity
            const serviceDetails = item.type === 'service' && item.bookingData?.startTime
                ? ` (Turno: ${item.bookingData.startTime})`
                : ''

            return {
                id: item.id || item.productId || `item-${Date.now()}`,
                title: `${title}${serviceDetails}`,
                unit_price: Math.round(price * 100) / 100,
                quantity,
                currency_id: 'ARS'
            }
        })

        // Call Mercado Pago REST API to create preference
        const preferencePayload = {
            items: prefItems,
            shipments: hasPhysical && calculatedShippingCost > 0 ? {
                cost: calculatedShippingCost,
                mode: 'not_specified'
            } : undefined,
            back_urls: {
                success: `${baseUrl}/checkout/success`,
                failure: `${baseUrl}/checkout/failure`,
                pending: `${baseUrl}/checkout/pending`
            },
            auto_return: 'approved' as const,
            notification_url: `${baseUrl}/api/webhooks/mercadopago`,
            external_reference: String(externalRef),
            payer: customer ? {
                name: customer.fullName || customer.name,
                email: customer.email,
                phone: customer.phone ? { number: customer.phone } : undefined
            } : undefined
        }

        const preference = await mercadopago.createPreference(preferencePayload)

        return NextResponse.json({
            preferenceId: preference.id,
            init_point: preference.init_point,
            sandbox_init_point: preference.sandbox_init_point,
            subtotal: calculatedSubtotal,
            shipping_cost: calculatedShippingCost,
            total: calculatedSubtotal + calculatedShippingCost,
            preference: {
                id: preference.id,
                items: prefItems,
                back_urls: preferencePayload.back_urls,
                notification_url: preferencePayload.notification_url,
                external_reference: String(externalRef)
            }
        })
    } catch (error: unknown) {
        console.error('Error in /api/checkout/mercadopago:', error)
        const message = error instanceof Error ? error.message : 'Error creando preferencia de pago'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
