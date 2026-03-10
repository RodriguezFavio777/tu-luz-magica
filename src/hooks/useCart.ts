'use client'

import { useCartStore } from '@/store/useCartStore'
import { useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { CartService } from '@/services/cart.service'

/**
 * Custom hook for cart operations with optimized selectors
 * Use this in components instead of directly accessing the store
 */
export function useCart() {
    const { user } = useAuth()

    // Selectors
    const items = useCartStore((state) => state.items)
    const storeAddItem = useCartStore((state) => state.addItem)
    const storeRemoveItem = useCartStore((state) => state.removeItem)
    const storeUpdateQuantity = useCartStore((state) => state.updateQuantity)
    const storeUpdateBookingData = useCartStore((state) => state.updateBookingData)
    const storeClearCart = useCartStore((state) => state.clearCart)

    // Computed values
    const itemCount = useCartStore((state) => state.itemCount())
    const subtotal = useCartStore((state) => state.subtotal())
    const requiresShipping = useCartStore((state) => state.requiresShipping())
    const hasServices = useCartStore((state) => state.hasServices())
    const hasPhysicalProducts = useCartStore((state) => state.hasPhysicalProducts())

    // WRAPPED ACTIONS (Sync with DB)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addItem = useCallback(async (item: any) => {
        storeAddItem(item) // Optimistic update
        if (user) {
            try {
                await CartService.addToCart(user.id, item)
            } catch (error) {
                console.error('Error syncing adding item to cart:', error)
            }
        }
    }, [user, storeAddItem])

    const removeItem = useCallback(async (itemId: string) => {
        const itemToRemove = items.find(i => i.id === itemId);
        storeRemoveItem(itemId) // Optimistic update
        if (user && itemToRemove) {
            try {
                await CartService.removeFromCart(user.id, itemToRemove.productId, itemToRemove.variantName)
            } catch (error) {
                console.error('Error syncing removing item from cart:', error)
            }
        }
    }, [user, storeRemoveItem, items])

    const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
        const itemToUpdate = items.find(i => i.id === itemId);
        storeUpdateQuantity(itemId, quantity) // Optimistic update
        if (user && itemToUpdate) {
            try {
                await CartService.updateQuantity(user.id, itemToUpdate.productId, quantity, itemToUpdate.variantName)
            } catch (error) {
                console.error('Error syncing update quantity:', error)
            }
        }
    }, [user, storeUpdateQuantity, items])

    const clearCart = useCallback(async () => {
        storeClearCart()
        if (user) {
            try {
                await CartService.clearCart(user.id)
            } catch (error) {
                console.error('Error syncing clear cart:', error)
            }
        }
    }, [user, storeClearCart])

    // Helper: Get item by product ID
    const getItem = useCallback(
        (productId: string) => {
            return items.find((item) => item.productId === productId)
        },
        [items]
    )

    // Helper: Check if product is in cart
    const isInCart = useCallback(
        (productId: string) => {
            return items.some((item) => item.productId === productId)
        },
        [items]
    )

    // Helper: Get services that need booking
    const getServicesNeedingBooking = useCallback(() => {
        return items.filter(
            (item) =>
                item.type === 'service' &&
                (!item.bookingData?.startTime || !item.bookingData?.endTime)
        )
    }, [items])

    // Helper: Check if cart is ready for checkout
    const isReadyForCheckout = useCallback(() => {
        const servicesNeedingBooking = getServicesNeedingBooking()
        return servicesNeedingBooking.length === 0
    }, [getServicesNeedingBooking])

    return {
        // State
        items,
        itemCount,
        subtotal,
        requiresShipping,
        hasServices,
        hasPhysicalProducts,

        // Actions
        addItem,
        removeItem,
        updateQuantity,
        updateBookingData: storeUpdateBookingData, // No server sync needed yet for this? Or maybe yes.
        clearCart,

        // Helpers
        getItem,
        isInCart,
        getServicesNeedingBooking,
        isReadyForCheckout,
    }
}

/**
 * Hook for cart badge (optimized for navbar)
 * Only re-renders when item count changes
 */
export function useCartBadge() {
    const itemCount = useCartStore((state) => state.itemCount())
    return { itemCount }
}

/**
 * Hook for checkout flow
 * Provides all necessary data for the checkout process
 */
export function useCheckout() {
    const items = useCartStore((state) => state.items)
    const subtotal = useCartStore((state) => state.subtotal())
    const requiresShipping = useCartStore((state) => state.requiresShipping())
    const getItemsByType = useCartStore((state) => state.getItemsByType)

    const physicalItems = getItemsByType('physical')
    const serviceItems = getItemsByType('service')

    // Calculate shipping cost (placeholder logic)
    const calculateShipping = useCallback(() => {
        if (!requiresShipping) return 0

        const totalWeight = physicalItems.reduce(
            (sum, item) => sum + (item.shippingWeight || 0) * item.quantity,
            0
        )

        // Simple shipping calculation (can be replaced with API call)
        if (totalWeight <= 0.5) return 1500 // Light package
        if (totalWeight <= 2) return 2500 // Medium package
        return 3500 // Heavy package
    }, [requiresShipping, physicalItems])

    const shippingCost = calculateShipping()
    const total = subtotal + shippingCost
    const hasMixedCart = requiresShipping && serviceItems.length > 0

    return {
        items,
        physicalItems,
        serviceItems,
        subtotal,
        shippingCost,
        total,
        requiresShipping,
        hasMixedCart,
    }
}
