'use server'

import { BookingService, Booking } from '@/services/BookingService'
import { revalidatePath } from 'next/cache'
import { sendStatusUpdateEmail } from '@/lib/actions/sendMail'

export async function getAdminBookings() {
    try {
        return await BookingService.getAdminList()
    } catch (error) {
        console.error('Error fetching admin bookings:', error)
        return []
    }
}

export async function updateBookingStatusAction(id: string, newStatus: string, emailInfo?: { email: string, fullName: string }) {
    try {
        await BookingService.updateStatus(id, newStatus)
        revalidatePath('/admin/bookings')

        // Send email if provided
        if (emailInfo?.email) {
            await sendStatusUpdateEmail(
                emailInfo.email,
                emailInfo.fullName || 'Cliente Mágico',
                id,
                newStatus,
                true // isBooking = true
            )
        }
        return { success: true }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        console.error('Error updating status:', error)
        return { success: false, error: message }
    }
}

export async function updateBookingDetailsAction(id: string, updates: Partial<Booking>) {
    try {
        await BookingService.updateBookingDetails(id, updates)
        revalidatePath('/admin/bookings')
        return { success: true }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        console.error('Error updating details:', error)
        return { success: false, error: message }
    }
}

export async function deleteBookingAction(id: string) {
    try {
        await BookingService.delete(id)
        revalidatePath('/admin/bookings')
        return { success: true }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        console.error('Error deleting booking:', error)
        return { success: false, error: message }
    }
}
