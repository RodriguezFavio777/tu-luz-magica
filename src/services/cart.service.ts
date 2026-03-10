import { createClient } from '@/lib/supabase/client'
import { CartItem } from '@/store/useCartStore'

/**
 * Service to manage cart persistence in Supabase
 * Handles synchronization between local store and database
 */
export const CartService = {
    /**
     * Retrieves the cart items for a specific user
     */
    async getCart(userId: string): Promise<CartItem[]> {
        const supabase = createClient()

        // 1. Get or create the cart record
        const { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle()

        if (!cart) return []

        // 2. Get all items in this cart
        const { data: items, error } = await supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', cart.id)

        if (error || !items) {
            console.error('Error fetching cart items:', error)
            return []
        }

        // 3. Map database rows to frontend CartItem type
        return items.map(item => ({
            id: item.id,
            productId: item.product_id || item.service_id, // Map from either column
            name: item.name,
            type: item.type as 'physical' | 'service',
            price: Number(item.price),
            quantity: item.quantity,
            imageUrl: item.image_url,
            bookingData: item.booking_data,
            variantName: item.variant_name || undefined
        }))
    },

    /**
     * Adds an item to the cart or updates quantity if it exists
     */
    async addToCart(userId: string, item: CartItem) {
        const supabase = createClient()

        // 1. Ensure cart exists
        let { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle()

        if (!cart) {
            const { data: newCart, error } = await supabase
                .from('carts')
                .insert({ user_id: userId })
                .select('id')
                .single()

            if (error || !newCart) {
                console.error('Error creating cart:', error)
                throw new Error('No se pudo crear el carrito en el servidor')
            }
            cart = newCart
        }

        // 2. Check for existing item to avoid 409 Conflict
        // We look for same product/service and same variant
        const isService = item.type === 'service'
        const query = supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('cart_id', cart.id)

        if (isService) {
            query.eq('service_id', item.productId)
        } else {
            query.eq('product_id', item.productId)
        }

        if (item.variantName) {
            query.eq('variant_name', item.variantName)
        } else {
            query.is('variant_name', null)
        }

        const { data: existingItem } = await query.maybeSingle()

        if (existingItem) {
            // Update existing record
            // For services, we keep quantity at 1. For products, we increment.
            const newQuantity = item.type === 'service' ? 1 : existingItem.quantity + item.quantity

            const { error } = await supabase
                .from('cart_items')
                .update({
                    quantity: newQuantity
                })
                .eq('id', existingItem.id)

            if (error) console.error('Error updating cart item quantity:', error)
        } else {
            // Insert new record
            const { error } = await supabase
                .from('cart_items')
                .insert({
                    cart_id: cart.id,
                    product_id: !isService ? item.productId : null,
                    service_id: isService ? item.productId : null,
                    name: item.name,
                    type: item.type,
                    price: item.price,
                    quantity: item.quantity,
                    image_url: item.imageUrl,
                    booking_data: item.bookingData,
                    variant_name: item.variantName || null
                })

            if (error) {
                console.error('Error inserting cart item:', error)
                // If it fails with 400, it might be the missing service_id column
                if (error.code === '42703' || error.message.includes('column "service_id" does not exist')) {
                    console.warn('Fallback: service_id column missing, using product_id')
                    await supabase.from('cart_items').insert({
                        cart_id: cart.id,
                        product_id: item.productId,
                        name: item.name,
                        type: item.type,
                        price: item.price,
                        quantity: item.quantity,
                        variant_name: item.variantName || null
                    })
                }
            }
        }
    },

    /**
     * Removes an item from the cart
     */
    async removeFromCart(userId: string, productId: string, variantName?: string) {
        const supabase = createClient()

        const { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle()

        if (!cart) return

        // Remove matching item
        const query = supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cart.id)
            .or(`product_id.eq.${productId},service_id.eq.${productId}`)

        if (variantName) {
            query.eq('variant_name', variantName)
        } else {
            query.is('variant_name', null)
        }

        const { error } = await query

        if (error) console.error('Error removing from cart:', error)
    },

    /**
     * Updates the quantity of an item
     */
    async updateQuantity(userId: string, productId: string, quantity: number, variantName?: string) {
        if (quantity <= 0) {
            return this.removeFromCart(userId, productId, variantName)
        }

        const supabase = createClient()
        const { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle()

        if (!cart) return

        const query = supabase
            .from('cart_items')
            .update({ quantity })
            .eq('cart_id', cart.id)
            .or(`product_id.eq.${productId},service_id.eq.${productId}`)

        if (variantName) {
            query.eq('variant_name', variantName)
        } else {
            query.is('variant_name', null)
        }

        const { error } = await query

        if (error) console.error('Error updating quantity:', error)
    },

    /**
     * Clears all items from the cart
     */
    async clearCart(userId: string) {
        const supabase = createClient()
        const { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle()

        if (!cart) return

        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cart.id)

        if (error) console.error('Error clearing cart:', error)
    }
}
