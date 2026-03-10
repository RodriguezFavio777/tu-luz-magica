import { createClient } from '@/lib/supabase/server'

export interface Order {
    id: string
    user_id: string | null
    customer_name: string | null
    customer_email: string | null
    customer_phone: string | null
    subtotal: number
    shipping_cost: number
    total: number
    status: string
    payment_status: string
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
    static async getById(id: string) {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                profiles:user_id(full_name, email),
                order_items(*)
            `)
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    }

    static async updateStatus(id: string, status: string, paymentStatus?: string) {
        const supabase = await createClient()
        const updateData: Partial<Order> = { status }
        if (paymentStatus) updateData.payment_status = paymentStatus

        const { data, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Order
    }

    static async getItems(orderId: string) {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderId)

        if (error) throw error
        return data as OrderItem[]
    }

    static async create(payload: Partial<Order>) {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('orders')
            .insert(payload)
            .select()
            .single()

        if (error) throw error
        return data as Order
    }

    static async addItems(items: Partial<OrderItem>[]) {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('order_items')
            .insert(items)
            .select()

        if (error) throw error
        return data as OrderItem[]
    }
}
