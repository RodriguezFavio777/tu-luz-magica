/**
 * Hybrid Cart Store - Usage Examples & Integration Validation
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

    // Validations
    if (requiresShipping()) throw new Error('Scenario 1: Should NOT require shipping')
    if (!hasServices()) throw new Error('Scenario 1: Should have services')
    if (hasPhysicalProducts()) throw new Error('Scenario 1: Should NOT have physical products')
}

// SCENARIO 2: Cart with ONLY physical products
export const testPhysicalOnly = () => {
    const { clearCart, requiresShipping, hasServices, hasPhysicalProducts } = useCartStore.getState()

    clearCart()
    addCrystal()

    // Validations
    if (!requiresShipping()) throw new Error('Scenario 2: SHOULD require shipping')
    if (hasServices()) throw new Error('Scenario 2: Should NOT have services')
    if (!hasPhysicalProducts()) throw new Error('Scenario 2: SHOULD have physical products')
}

// SCENARIO 3: MIXED cart (services + physical products)
export const testMixedCart = () => {
    const { clearCart, requiresShipping, hasServices, hasPhysicalProducts, subtotal } = useCartStore.getState()

    clearCart()
    addTarotReading() // Service
    addCrystal()     // Physical product

    // Validations
    if (!requiresShipping()) throw new Error('Scenario 3: SHOULD require shipping')
    if (!hasServices()) throw new Error('Scenario 3: SHOULD have services')
    if (!hasPhysicalProducts()) throw new Error('Scenario 3: SHOULD have physical products')
    if (subtotal() !== 8500) throw new Error(`Scenario 3: Subtotal mismatch, expected 8500, got ${subtotal()}`)
}

// SCENARIO 4: Update booking data for a service
export const testBookingUpdate = () => {
    const { clearCart, updateBookingData, items } = useCartStore.getState()

    clearCart()
    addTarotReading()

    // User selects a time slot
    updateBookingData('temp-1', {
        startTime: '2026-02-01T15:00:00Z',
        endTime: '2026-02-01T16:00:00Z',
        notes: 'Primera consulta, enfoque en amor y trabajo',
    })

    const updatedItem = items[0]
    if (updatedItem.bookingData?.startTime !== '2026-02-01T15:00:00Z') {
        throw new Error('Scenario 4: Booking data not updated correctly')
    }
}

// SCENARIO 5: Quantity management
export const testQuantityManagement = () => {
    const { clearCart, updateQuantity, itemCount, subtotal } = useCartStore.getState()

    clearCart()
    addCrystal()

    if (itemCount() !== 1) throw new Error('Scenario 5: Initial count should be 1')

    updateQuantity('temp-2', 3)
    if (itemCount() !== 3) throw new Error(`Scenario 5: Count should be 3, got ${itemCount()}`)
    if (subtotal() !== 10500) throw new Error(`Scenario 5: Subtotal mismatch, expected 10500, got ${subtotal()}`)

    updateQuantity('temp-2', 0)
    if (itemCount() !== 0) throw new Error(`Scenario 5: Count should be 0 after removal, got ${itemCount()}`)
}

// Run all tests
export const runAllTests = () => {
    try {
        testServicesOnly()
        testPhysicalOnly()
        testMixedCart()
        testBookingUpdate()
        testQuantityManagement()
        // No console.log allowed, using silence as success or error throw
    } catch (err) {
        console.error('Cart Tests Failed:', err)
        throw err
    }
}
