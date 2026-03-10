import { createClient } from '@/lib/supabase/server'

export interface Service {
    id: string
    name: string
    description: string | null
    price: number
    duration_minutes: number
    duration_unit?: string | null
    image_url: string | null
    category_id: string | null
    is_active: boolean
    created_at?: string
    updated_at?: string
    variants?: any[] | null
    includes?: string[] | null
}

export type CreateServiceDTO = Omit<Service, 'id' | 'created_at' | 'updated_at'>
export type UpdateServiceDTO = Partial<CreateServiceDTO>

export interface ServiceCategory {
    id: string
    name: string
    slug: string
    is_active: boolean
    display_order: number
}

export class ServiceService {
    static async getAll() {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('is_active', true)
            .order('name')

        if (error) throw error
        return data as Service[]
    }

    static async getActiveServices(categorySlug?: string) {
        const supabase = await createClient()

        // 1. Determine dynamic filters
        let categoryId: string | null = null
        if (categorySlug) {
            const { data: cat } = await supabase
                .from('service_categories')
                .select('id')
                .eq('slug', categorySlug)
                .single()
            categoryId = cat?.id || null
        }

        // 2. Build Query
        let query = supabase
            .from('services')
            .select('*')
            .eq('is_active', true)

        if (categorySlug) {
            if (categoryId) {
                query = query.eq('category_id', categoryId)
            } else {
                // Return empty if slug provided but category not found
                return []
            }
        }

        const { data, error } = await query.order('name')

        if (error) throw error
        return data as Service[]
    }

    static async getCategories() {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('service_categories')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })

        if (error) throw error
        return data as ServiceCategory[]
    }

    static async getById(id: string) {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data as Service
    }

    static async create(payload: CreateServiceDTO) {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('services')
            .insert(payload)
            .select()
            .single()

        if (error) throw error
        return data as Service
    }

    static async update(id: string, payload: UpdateServiceDTO) {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('services')
            .update(payload)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Service
    }

    static async delete(id: string) {
        const supabase = await createClient()
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }

    static async getAdminList() {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('services')
            .select('*, service_categories(name)')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as (Service & { service_categories: { name: string } | null })[]
    }
}
