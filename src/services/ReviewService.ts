import { createClient } from '@/lib/supabase/server'

export interface Review {
    id: string
    user_name: string
    content: string
    rating: number
    is_approved: boolean
    created_at: string
    pinned?: boolean
}

export class ReviewService {
    static async submit(review: Omit<Review, 'id' | 'is_approved' | 'created_at'>) {
        const supabase = await createClient()
        const { error } = await supabase
            .from('reviews')
            .insert({
                ...review,
                is_approved: false
            })

        if (error) throw error
        return true
    }

    static async getAll(onlyApproved = true) {
        const supabase = await createClient()
        let query = supabase.from('reviews').select('*')

        if (onlyApproved) {
            query = query.eq('is_approved', true)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error
        return data as Review[]
    }

    static async toggleApproval(id: string, currentStatus: boolean) {
        const supabase = await createClient()
        const { error } = await supabase
            .from('reviews')
            .update({ is_approved: !currentStatus })
            .eq('id', id)

        if (error) throw error
        return true
    }

    static async delete(id: string) {
        const supabase = await createClient()
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }
}
