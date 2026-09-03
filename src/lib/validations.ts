import { z } from 'zod'

export const ProductSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    description: z.string().nullable(),
    price: z.number().positive('El precio debe ser positivo'),
    cost_price: z.number().nullable().optional(),
    stock: z.number().int().nonnegative('El stock no puede ser negativo'),
    sku: z.string().nullable().optional(),
    image_url: z.string().url().nullable().optional(),
    images: z.array(z.string()).nullable().optional(),
    category_id: z.string().uuid().nullable().optional(),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    variants: z.array(z.any()).optional()

})

export const ServiceSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    description: z.string().nullable().optional(),
    price: z.number().positive('El precio debe ser positivo'),
    duration_minutes: z.number().int().positive('La duración debe ser positiva'),
    duration_unit: z.string().optional().default('minutos'),
    image_url: z.string().nullable().optional(),
    category_id: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
    variants: z.array(z.any()).nullable().optional(),
    includes: z.array(z.string()).nullable().optional()
})

export const CheckoutSchema = z.object({
    user_id: z.string().uuid().nullable().optional(),
    items: z.array(z.object({
        id: z.string().optional(),
        productId: z.string(),
        name: z.string(),
        quantity: z.number().int().positive(),
        price: z.number(),
        type: z.enum(['physical', 'service']),
        variantName: z.string().nullable().optional(),
        bookingData: z.object({
            date: z.string().optional(),
            time: z.string().optional(),
            startTime: z.string(),
            endTime: z.string().optional(),
            notes: z.string().optional()
        }).nullable().optional(),
        durationMinutes: z.number().optional()
    })),
    subtotal: z.number(),
    shipping_cost: z.number(),
    total: z.number(),
    requires_shipping: z.boolean(),
    shipping_address: z.string().nullable().optional(),
    shipping_city: z.string().nullable().optional(),
    shipping_province: z.string().nullable().optional(),
    shipping_postal_code: z.string().nullable().optional(),
    fullName: z.string().min(1, 'El nombre completo es requerido'),
    email: z.string().email('Email inválido'),
    phone: z.string().min(5, 'Teléfono inválido'),
    payment_method: z.enum(['mercadopago', 'transfer']).optional().default('mercadopago')
}).refine(data => !data.requires_shipping || (!!data.shipping_address?.trim() && !!data.shipping_city?.trim()), {
    message: 'Dirección y ciudad son requeridas cuando requires_shipping es true',
    path: ['shipping_address']
})

