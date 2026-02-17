import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Types
export interface CartItem {
    id: string
    productId: string
    name: string
    type: 'physical' | 'service'
    price: number
    quantity: number
    imageUrl?: string

    // Physical product fields
    shippingWeight?: number
    stock?: number

    // Service fields
    durationMinutes?: number
    categoryId?: string
    categoryName?: string

    // Booking data (for services)
    bookingData?: {
        startTime?: string
        endTime?: string
        notes?: string
    }

    // Variant data
    variantId?: string
    variantName?: string
}

interface CartStore {
    items: CartItem[]

    // Actions
    setItems: (items: CartItem[]) => void
    addItem: (item: CartItem) => void
    removeItem: (itemId: string) => void
    updateQuantity: (itemId: string, quantity: number) => void
    updateBookingData: (itemId: string, bookingData: CartItem['bookingData']) => void
    clearCart: () => void

    // Computed values
    itemCount: () => number
    subtotal: () => number
    requiresShipping: () => boolean
    hasServices: () => boolean
    hasPhysicalProducts: () => boolean
    getItemsByType: (type: 'physical' | 'service') => CartItem[]
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            // Set items (sync from server)
            setItems: (items) => {
                set({ items })
            },

            // Add item to cart
            addItem: (item) => {
                set((state) => {
                    const existingItemIndex = state.items.findIndex(
                        (i) => i.id === item.id && (i.variantName === item.variantName)
                    )

                    if (existingItemIndex > -1) {
                        // Item match (same ID + same Variant), update quantity
                        const updatedItems = [...state.items]
                        updatedItems[existingItemIndex].quantity += item.quantity
                        return { items: updatedItems }
                    } else {
                        // New item (or different variant), add to cart
                        return { items: [...state.items, item] }
                    }
                })
            },

            // Remove item from cart
            removeItem: (itemId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== itemId),
                }))
            },

            // Update item quantity
            updateQuantity: (itemId, quantity) => {
                set((state) => {
                    if (quantity <= 0) {
                        return {
                            items: state.items.filter((item) => item.id !== itemId),
                        }
                    }

                    const updatedItems = state.items.map((item) =>
                        item.id === itemId ? { ...item, quantity } : item
                    )
                    return { items: updatedItems }
                })
            },

            // Update booking data for a service
            updateBookingData: (itemId, bookingData) => {
                set((state) => {
                    const updatedItems = state.items.map((item) =>
                        item.id === itemId
                            ? { ...item, bookingData: { ...item.bookingData, ...bookingData } }
                            : item
                    )
                    return { items: updatedItems }
                })
            },

            // Clear entire cart
            clearCart: () => {
                set({ items: [] })
            },

            // Get total number of items
            itemCount: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0)
            },

            // Calculate subtotal
            subtotal: () => {
                return get().items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                )
            },

            // CRITICAL: Determine if shipping is required
            requiresShipping: () => {
                return get().items.some((item) => item.type === 'physical')
            },

            // Check if cart has services
            hasServices: () => {
                return get().items.some((item) => item.type === 'service')
            },

            // Check if cart has physical products
            hasPhysicalProducts: () => {
                return get().items.some((item) => item.type === 'physical')
            },

            // Get items filtered by type
            getItemsByType: (type) => {
                return get().items.filter((item) => item.type === type)
            },
        }),
        {
            name: 'tuluzmagica-cart', // localStorage key
            storage: createJSONStorage(() => localStorage),
        }
    )
)
