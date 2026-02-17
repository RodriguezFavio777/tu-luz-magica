import { createClient } from '@/lib/supabase/client'
import { CartItem } from '@/store/useCartStore'

export const CartService = {
    async getCart(userId: string): Promise<CartItem[]> {
        const supabase = createClient()

        // Get the cart first
        const { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', userId)
            .single()

        if (!cart) return []

        // Get items
        const { data: items } = await supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', cart.id)

        if (!items) return []

        // Map DB items to frontend CartItem type
        return items.map(item => ({
            id: item.id,
            productId: item.product_id,
            name: item.name,
            type: item.type as 'physical' | 'service',
            price: Number(item.price),
            quantity: item.quantity,
            imageUrl: item.image_url,
            // Optional fields that might be null
            bookingData: item.booking_data,
            variantName: item.variant_name
        }))
    },

    async addToCart(userId: string, item: CartItem) {
        const supabase = createClient()

        // 1. Ensure cart exists
        let { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', userId)
            .single()

        if (!cart) {
            const { data: newCart, error } = await supabase
                .from('carts')
                .insert({ user_id: userId })
                .select('id')
                .single()

            if (error || !newCart) throw new Error('Error creating cart')
            cart = newCart
        }

        // 2. Check if item exists in cart (by product_id and variant)
        // Note: This logic duplicates the store logic but at DB level
        const { data: existingItem } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('cart_id', cart.id)
            .eq('product_id', item.productId)
            .eq('variant_name', item.variantName || '') // handle nulls if needed, or use 'is'
            .maybeSingle()

        if (existingItem) {
            // Update quantity
            await supabase
                .from('cart_items')
                .update({ quantity: existingItem.quantity + item.quantity })
                .eq('id', existingItem.id)
        } else {
            // Insert new item
            await supabase
                .from('cart_items')
                .insert({
                    cart_id: cart.id,
                    product_id: item.productId,
                    name: item.name,
                    type: item.type,
                    price: item.price,
                    quantity: item.quantity,
                    image_url: item.imageUrl,
                    booking_data: item.bookingData,
                    variant_name: item.variantName
                })
        }
    },

    async removeFromCart(userId: string, productId: string) {
        const supabase = createClient()

        // Need cart_id to be safe? Or just use filters.
        // Ideally we remove by the specific cart_item_id, but our Store currently uses productId.
        // We will do a subquery delete for safety.

        // Get cart id
        const { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', userId)
            .single()

        if (!cart) return

        await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cart.id)
            .eq('product_id', productId)
    },

    async updateQuantity(userId: string, productId: string, quantity: number) {
        const supabase = createClient()

        const { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', userId)
            .single()

        if (!cart) return

        if (quantity <= 0) {
            await this.removeFromCart(userId, productId)
            return
        }

        await supabase
            .from('cart_items')
            .update({ quantity })
            .eq('cart_id', cart.id)
            .eq('product_id', productId)
    },

    async clearCart(userId: string) {
        const supabase = createClient()
        const { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', userId)
            .single()

        if (!cart) return

        await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cart.id)
    }
}
