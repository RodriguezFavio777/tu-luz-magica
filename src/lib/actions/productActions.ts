'use server'

import { ProductService, CreateProductDTO, Product } from '@/services/ProductService'
import { revalidatePath } from 'next/cache'
import { ProductSchema } from '@/lib/validations'

export async function getAdminProducts() {
    try {
        return await ProductService.getAdminList()
    } catch (error) {
        console.error('Error fetching admin products:', error)
        return []
    }
}

export async function saveProduct(id: string, payload: CreateProductDTO) {
    const isNew = id === 'new'

    // Validate with Zod
    const validated = ProductSchema.safeParse(payload)
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message }
    }

    try {
        let data: Product;
        const productData = validated.data as CreateProductDTO;
        if (isNew) {
            data = await ProductService.create(productData)
        } else {
            data = await ProductService.update(id, validated.data)
        }

        revalidatePath('/admin/products')
        revalidatePath('/productos')
        if (!isNew) revalidatePath(`/productos/${id}`)

        return { success: true, data }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        console.error('Error in saveProduct action:', error)
        return { success: false, error: message }
    }
}

export async function deleteProduct(id: string) {
    try {
        await ProductService.delete(id)
        revalidatePath('/admin/products')
        revalidatePath('/productos')
        return { success: true }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        console.error('Error in deleteProduct action:', error)
        return { success: false, error: message }
    }
}
