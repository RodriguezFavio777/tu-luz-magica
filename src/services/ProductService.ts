import { createClient } from '@/lib/supabase/server'
import { Json } from '@/lib/supabase/database.types'

export interface Product {
    id: string
    name: string
    description: string | null
    price: number
    cost_price: number | null
    stock: number
    sku: string | null
    image_url: string | null
    images: string[] | null
    category_id: string | null
    is_active: boolean | null
    is_featured: boolean | null
    variants: Json | null

    created_at: string | null
    updated_at: string | null
}

export type CreateProductDTO = Omit<Product, 'id' | 'created_at' | 'updated_at'>
export type UpdateProductDTO = Partial<CreateProductDTO>

export interface SearchParams {
    searchQuery?: string
    categorySlug?: string
    sort?: string
    page?: number
    pageSize?: number
}

export class ProductService {
    static async getAll() {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as Product[]
    }

    static async search({ searchQuery, categorySlug, sort, page = 1, pageSize = 12 }: SearchParams) {
        const supabase = await createClient()

        // 1. First fetch category ID if slug provided
        let categoryId: string | null = null
        if (categorySlug) {
            const { data: cat } = await supabase
                .from('product_categories')
                .select('id')
                .eq('slug', categorySlug)
                .single()
            categoryId = cat?.id || null
        }

        // 2. Build Query
        let query = supabase
            .from('products')
            .select('*', { count: 'exact' })
            .eq('is_active', true)

        if (searchQuery) {
            query = query.ilike('name', `%${searchQuery}%`)
        }

        if (categoryId) {
            query = query.eq('category_id', categoryId)
        }

        // Sort Logic
        switch (sort) {
            case 'price_asc':
                query = query.order('price', { ascending: true })
                break
            case 'price_desc':
                query = query.order('price', { ascending: false })
                break
            default:
                query = query.order('created_at', { ascending: false })
        }

        // Pagination
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1

        const { data, count, error } = await query.range(from, to)

        if (error) throw error
        return {
            products: data as Product[],
            count: count || 0
        }
    }

    static async getById(id: string) {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data as Product
    }

    static async create(payload: CreateProductDTO) {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('products')
            .insert(payload)
            .select()
            .single()

        if (error) throw error
        return data as Product
    }

    static async update(id: string, payload: UpdateProductDTO) {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('products')
            .update(payload)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Product
    }

    static async delete(id: string) {
        const supabase = await createClient()
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)

        if (error) {
            if (error.code === '23503') {
                throw new Error('No se puede eliminar porque este producto tiene pedidos/historial de compras vinculados. Te sugerimos "Editarlo" y apagar el interruptor de visibilidad para ocultarlo de la tienda.')
            }
            throw error
        }
        return true
    }

    static async getByCategory(categoryId: string) {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', categoryId)

        if (error) throw error
        return data as Product[]
    }

    static async getAdminList() {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('products')
            .select('*, product_categories(name)')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as (Product & { product_categories: { name: string } | null })[]
    }
}
