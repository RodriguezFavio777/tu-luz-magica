'use server'

import { ReviewService } from '@/services/ReviewService'
import { revalidatePath } from 'next/cache'

export async function submitReview(formData: FormData) {
    const name = formData.get('user_name') as string
    const content = formData.get('content') as string
    const rating = Number(formData.get('rating')) || 5

    try {
        await ReviewService.submit({
            user_name: name,
            content: content,
            rating: rating
        })

        return { success: true }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        console.error('Error submitting review:', error)
        return { success: false, error: message }
    }
}

export async function getReviews(all = false) {
    try {
        return await ReviewService.getAll(!all)
    } catch (error: unknown) {
        console.error('Error fetching reviews:', error)
        return []
    }
}

export async function toggleReviewApproval(id: string, currentStatus: boolean) {
    try {
        await ReviewService.toggleApproval(id, currentStatus)
        revalidatePath('/admin/reviews')
        revalidatePath('/')
        return { success: true }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        return { success: false, error: message }
    }
}

export async function deleteReview(id: string) {
    try {
        await ReviewService.delete(id)
        revalidatePath('/admin/reviews')
        revalidatePath('/')
        return { success: true }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        return { success: false, error: message }
    }
}
