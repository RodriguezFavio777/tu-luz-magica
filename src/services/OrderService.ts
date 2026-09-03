import { createAdminClient } from '@/lib/supabase/server'

export interface Order {
    id: string
    user_id: string | null
    customer_name: string | null
    customer_email: string | null
    customer_phone: string | null
    subtotal: number
    shipping_cost: number
    total: number
    status?: string
    payment_status: string
    payment_method?: string | null
    mercadopago_preference_id?: string | null
    mercadopago_payment_id?: string | null
    requires_shipping: boolean
    shipping_address: string | null
    shipping_city: string | null
    shipping_postal_code: string | null
    created_at?: string
    updated_at?: string
    profiles?: {
        email: string | null
        full_name: string | null
    }
}

export interface OrderItem {
    id: string
    order_id: string
    product_id: string | null
    service_id: string | null
    product_name: string
    quantity: number
    unit_price: number
    selected_variant: any | null
    booking_id: string | null
    duration_minutes?: number
}

export class OrderService {
    static async getAdminList() {
        const supabase = createAdminClient()
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    profiles:user_id(full_name, email, shipping_address, phone)
                `)
                .order('created_at', { ascending: false })

            if (error) {
                console.warn('OrderService.getAdminList join failed, falling back to simple select:', error)
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (fallbackError) throw fallbackError
                return (fallbackData || []) as Order[]
            }
            return (data || []) as Order[]
        } catch (err) {
            console.error('OrderService.getAdminList error:', err)
            throw err
        }
    }

    static async getById(id: string) {
        const supabase = createAdminClient()
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    profiles:user_id(full_name, email),
                    order_items(*)
                `)
                .eq('id', id)
                .maybeSingle()

            if (error || !data) {
                // Fallback if profiles join fails or returns error
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        order_items(*)
                    `)
                    .eq('id', id)
                    .maybeSingle()

                if (fallbackError || !fallbackData) {
                    const { data: simpleData, error: simpleError } = await supabase
                        .from('orders')
                        .select('*')
                        .eq('id', id)
                        .maybeSingle()
                    if (simpleError) throw simpleError
                    return simpleData as Order | null
                }
                return fallbackData as Order
            }
            return data as Order
        } catch (err) {
            console.error('OrderService.getById error:', err)
            throw err
        }
    }

    static async updateStatus(
        id: string,
        statusOrPaymentStatus: string,
        paymentStatusOrPaymentId?: string,
        mercadopagoPaymentId?: string
    ) {
        const supabase = createAdminClient()

        // Resolve status and payment_status
        const inputStatus = (statusOrPaymentStatus || '').toLowerCase()
        let targetStatus = inputStatus
        let targetPaymentStatus = inputStatus
        let paymentId = mercadopagoPaymentId

        if (mercadopagoPaymentId) {
            targetPaymentStatus = (paymentStatusOrPaymentId || statusOrPaymentStatus).toLowerCase()
            paymentId = mercadopagoPaymentId
        } else if (paymentStatusOrPaymentId) {
            if (['pending', 'approved', 'rejected', 'cancelled', 'paid'].includes(paymentStatusOrPaymentId.toLowerCase())) {
                targetPaymentStatus = paymentStatusOrPaymentId.toLowerCase()
            } else {
                paymentId = paymentStatusOrPaymentId
            }
        }

        // Standardize status mapping
        if (targetPaymentStatus === 'paid' || targetStatus === 'paid' || targetStatus === 'completed' || targetStatus === 'shipped') {
            targetPaymentStatus = 'approved'
            if (targetStatus !== 'completed' && targetStatus !== 'shipped') {
                targetStatus = 'paid'
            }
        } else if (targetStatus === 'cancelled' || targetPaymentStatus === 'cancelled' || targetPaymentStatus === 'rejected') {
            targetStatus = 'cancelled'
            targetPaymentStatus = 'cancelled'
        } else if (targetStatus === 'pending') {
            targetPaymentStatus = 'pending'
        }

        // Do not include updated_at because orders table in Supabase does not have an updated_at column
        const updateData: Record<string, any> = {
            status: targetStatus,
            payment_status: targetPaymentStatus
        }
        if (paymentId) {
            updateData.payment_id = paymentId
        }

        try {
            // Primary attempt: update status and payment_status together
            const { data, error } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', id)
                .select()
                .maybeSingle()

            if (!error) {
                return (data || { id, status: targetStatus, payment_status: targetPaymentStatus }) as Order
            }

            console.warn('OrderService.updateStatus first attempt failed:', error.message)

            // Fallback 1: Try without payment_id if it failed
            if (paymentId) {
                delete updateData.payment_id
                const { data: noPaymentIdData, error: noPaymentIdError } = await supabase
                    .from('orders')
                    .update(updateData)
                    .eq('id', id)
                    .select()
                    .maybeSingle()

                if (!noPaymentIdError) {
                    return (noPaymentIdData || { id, status: targetStatus, payment_status: targetPaymentStatus }) as Order
                }
            }

            // Fallback 2: Try updating only payment_status (e.g. if 'status' column doesn't exist in Supabase schema)
            const { data: paymentOnlyData, error: paymentOnlyError } = await supabase
                .from('orders')
                .update({ payment_status: targetPaymentStatus })
                .eq('id', id)
                .select()
                .maybeSingle()

            if (!paymentOnlyError) {
                return (paymentOnlyData || { id, status: targetStatus, payment_status: targetPaymentStatus }) as Order
            }

            // Fallback 3: Try updating only status
            const { data: statusOnlyData, error: statusOnlyError } = await supabase
                .from('orders')
                .update({ status: targetStatus })
                .eq('id', id)
                .select()
                .maybeSingle()

            if (!statusOnlyError) {
                return (statusOnlyData || { id, status: targetStatus, payment_status: targetPaymentStatus }) as Order
            }

            throw error
        } catch (err) {
            console.error('OrderService.updateStatus error:', err)
            throw err
        }
    }

    static async getItems(orderId: string) {
        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderId)

        if (error) {
            console.error('OrderService.getItems error:', error)
            return []
        }
        return (data || []) as OrderItem[]
    }

    static async create(payload: Partial<Order>) {
        const supabase = createAdminClient()
        const cleanPayload: Record<string, any> = { ...payload }
        if (!cleanPayload.user_id) {
            delete cleanPayload.user_id
        }
        if (!cleanPayload.status) {
            cleanPayload.status = cleanPayload.payment_status === 'approved' ? 'paid' : 'pending'
        }

        const { data, error } = await supabase
            .from('orders')
            .insert(cleanPayload)
            .select()
            .maybeSingle()

        if (error) {
            console.error('Supabase Order insert error, retrying without non-standard fields:', error)
            delete cleanPayload.status
            delete cleanPayload.customer_name
            delete cleanPayload.customer_email
            delete cleanPayload.customer_phone
            delete cleanPayload.payment_method
            delete cleanPayload.mercadopago_payment_id

            const { data: retryData, error: retryError } = await supabase
                .from('orders')
                .insert(cleanPayload)
                .select()
                .maybeSingle()

            if (retryError) {
                console.error('Fallback insert failed too:', retryError)
                return {
                    id: `ORD-${Date.now().toString(36).toUpperCase()}`,
                    subtotal: payload.subtotal || 0,
                    shipping_cost: payload.shipping_cost || 0,
                    total: payload.total || 0,
                    status: 'pending',
                    payment_status: 'pending',
                    requires_shipping: payload.requires_shipping || false,
                    customer_name: payload.customer_name || 'Invitado',
                    customer_email: payload.customer_email || '',
                    customer_phone: payload.customer_phone || ''
                } as Order
            }
            return retryData as Order
        }
        return data as Order
    }

    static async addItems(items: Partial<OrderItem>[]) {
        const supabase = createAdminClient()
        try {
            const { data, error } = await supabase
                .from('order_items')
                .insert(items)
                .select()

            if (error) {
                console.error('Supabase order_items insert error:', error)
                return []
            }
            return data as OrderItem[]
        } catch (e) {
            console.error('OrderService.addItems error:', e)
            return []
        }
    }
}

