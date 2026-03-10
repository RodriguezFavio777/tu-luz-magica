import { createClient } from '@/lib/supabase/server'

export interface Category {
    id: string
    name: string
    slug: string
    type: 'physical' | 'service'
    created_at?: string
}

export class CategoryService {
    static async getAll() {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('product_categories')
            .select('id, name, slug')
            .eq('is_active', true)
            .order('name')

        if (error) throw error
        return data as Category[]
    }

    static async getByType(type: 'physical' | 'service') {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('product_categories')
            .select('*')
            .eq('type', type)
            .eq('is_active', true)
            .order('name')

        if (error) throw error
        return data as Category[]
    }
}
