/**
 * Hybrid Cart Store - Usage Examples
 * 
 * This file demonstrates how the cart handles different scenarios:
 * 1. Services only (no shipping required)
 * 2. Physical products only (shipping required)
 * 3. Mixed cart (shipping required)
 */

import { useCartStore } from './useCartStore'

// Example 1: Adding a SERVICE (Tarot Reading)
const addTarotReading = () => {
    const { addItem } = useCartStore.getState()

    addItem({
        id: 'temp-1',
        productId: 'service-tarot-001',
        name: 'Lectura de Tarot Completa',
        type: 'service',
        price: 5000, // $5000 ARS
        quantity: 1,
        durationMinutes: 60,
        categoryId: 'cat-lectura-tarot',
        categoryName: 'Lectura de Tarot',
        imageUrl: '/images/tarot.jpg',
        bookingData: {
            // Will be filled during checkout
            startTime: undefined,
            endTime: undefined,
            notes: '',
        },
    })
}

// Example 2: Adding a PHYSICAL PRODUCT (Crystal)
const addCrystal = () => {
    const { addItem } = useCartStore.getState()

    addItem({
        id: 'temp-2',
        productId: 'product-crystal-001',
        name: 'Cuarzo Rosa - Cristal Natural',
        type: 'physical',
        price: 3500, // $3500 ARS
        quantity: 1,
        shippingWeight: 0.15, // 150g
        stock: 10,
        imageUrl: '/images/cuarzo-rosa.jpg',
    })
}

// Example 3: Adding a RITUAL SERVICE
const addRitual = () => {
    const { addItem } = useCartStore.getState()

    addItem({
        id: 'temp-3',
        productId: 'service-ritual-001',
        name: 'Ritual de Limpieza Energética',
        type: 'service',
        price: 8000, // $8000 ARS
        quantity: 1,
        durationMinutes: 90,
        categoryId: 'cat-ritual-energetico',
        categoryName: 'Ritual Energético',
        imageUrl: '/images/ritual.jpg',
    })
}

// SCENARIO 1: Cart with ONLY services
export const testServicesOnly = () => {
    const { clearCart, requiresShipping, hasServices, hasPhysicalProducts } = useCartStore.getState()

    clearCart()
    addTarotReading()
    addRitual()

    console.log('=== SCENARIO 1: Services Only ===')
    console.log('Requires Shipping:', requiresShipping()) // false ✅
    console.log('Has Services:', hasServices()) // true
    console.log('Has Physical Products:', hasPhysicalProducts()) // false
    console.log('Expected: NO shipping address required')
}

// SCENARIO 2: Cart with ONLY physical products
export const testPhysicalOnly = () => {
    const { clearCart, requiresShipping, hasServices, hasPhysicalProducts } = useCartStore.getState()

    clearCart()
    addCrystal()

    console.log('=== SCENARIO 2: Physical Products Only ===')
    console.log('Requires Shipping:', requiresShipping()) // true ✅
    console.log('Has Services:', hasServices()) // false
    console.log('Has Physical Products:', hasPhysicalProducts()) // true
    console.log('Expected: Shipping address REQUIRED')
}

// SCENARIO 3: MIXED cart (services + physical products)
export const testMixedCart = () => {
    const { clearCart, requiresShipping, hasServices, hasPhysicalProducts, subtotal } = useCartStore.getState()

    clearCart()
    addTarotReading() // Service
    addCrystal()     // Physical product

    console.log('=== SCENARIO 3: Mixed Cart ===')
    console.log('Requires Shipping:', requiresShipping()) // true ✅
    console.log('Has Services:', hasServices()) // true
    console.log('Has Physical Products:', hasPhysicalProducts()) // true
    console.log('Subtotal:', subtotal()) // 8500 ARS
    console.log('Expected: Shipping address REQUIRED (because of crystal)')
}

// SCENARIO 4: Update booking data for a service
export const testBookingUpdate = () => {
    const { clearCart, updateBookingData, items } = useCartStore.getState()

    clearCart()
    addTarotReading()

    // User selects a time slot
    updateBookingData('service-tarot-001', {
        startTime: '2026-02-01T15:00:00Z',
        endTime: '2026-02-01T16:00:00Z',
        notes: 'Primera consulta, enfoque en amor y trabajo',
    })

    console.log('=== SCENARIO 4: Booking Data Update ===')
    console.log('Booking Data:', items()[0].bookingData)
    console.log('Expected: Booking data should be populated')
}

// SCENARIO 5: Quantity management
export const testQuantityManagement = () => {
    const { clearCart, updateQuantity, itemCount, subtotal } = useCartStore.getState()

    clearCart()
    addCrystal()

    console.log('=== SCENARIO 5: Quantity Management ===')
    console.log('Initial quantity:', itemCount()) // 1

    updateQuantity('product-crystal-001', 3)
    console.log('After update to 3:', itemCount()) // 3
    console.log('Subtotal:', subtotal()) // 10500 ARS (3500 * 3)

    updateQuantity('product-crystal-001', 0)
    console.log('After update to 0:', itemCount()) // 0 (item removed)
}

// Run all tests
export const runAllTests = () => {
    testServicesOnly()
    testPhysicalOnly()
    testMixedCart()
    testBookingUpdate()
    testQuantityManagement()
}
