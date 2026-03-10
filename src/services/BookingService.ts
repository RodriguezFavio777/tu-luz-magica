import { createClient } from '@/lib/supabase/server'
import { getFreeBusy } from '@/lib/googleCalendar'
import { startOfDay, endOfDay } from 'date-fns'

export interface Booking {
    id: string
    service_id: string
    user_id?: string | null
    start_time: string
    end_time?: string | null
    status: string // Relaxing to string to accommodate 'completed', 'rescheduled', etc.
    google_calendar_id?: string | null
    customer_name?: string | null
    customer_email?: string | null
    customer_phone?: string | null
    notes?: string | null
    created_at?: string
    services?: {
        name: string
    } | null
}

export interface AdminBooking extends Booking {
    profiles: {
        full_name: string | null
        email: string | null
        phone: string | null
    } | null
    services: {
        name: string
        category_id: string | null
    } | null
}

export class BookingService {
    static async getByDateRange(start: string, end: string) {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('bookings')
            .select('*, services(name)')
            .gte('start_time', start)
            .lte('start_time', end)
            .neq('status', 'cancelled')

        if (error) throw error
        return data as Booking[]
    }

    static async getAdminList() {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                id, 
                created_at, 
                start_time, 
                end_time, 
                status, 
                notes,
                service_id,
                user_id,
                customer_name,
                customer_email,
                customer_phone,
                profiles:user_id(full_name, email, phone),
                services:service_id(name, category_id)
            `)
            .order('start_time', { ascending: false })

        if (error) throw error
        return data as unknown as AdminBooking[]
    }

    static async checkAvailability(startTime: Date, durationMinutes: number, serviceName: string): Promise<{ isAvailable: boolean, error?: string }> {
        const nameLower = serviceName.toLowerCase()
        const isRitual = nameLower.includes('ritual') || nameLower.includes('limpieza') || nameLower.includes('velación') || nameLower.includes('endulzamiento');

        // Rituals don't need slot check as they happen at 21hs and support multiple
        if (isRitual) return { isAvailable: true };

        const endTime = new Date(startTime.getTime() + durationMinutes * 60000)
        const timeMin = startOfDay(startTime).toISOString()
        const timeMax = endOfDay(startTime).toISOString()

        // 1. Check Google Calendar
        try {
            const googleBusy = await getFreeBusy(timeMin, timeMax)
            const isGoogleTaken = googleBusy.some((b) => {
                const bStart = b.start ? new Date(b.start).getTime() : 0
                const bEnd = b.end ? new Date(b.end).getTime() : 0
                return bStart > 0 && bEnd > 0 && (startTime.getTime() < bEnd) && (endTime.getTime() > bStart)
            })

            if (isGoogleTaken) {
                return { isAvailable: false, error: `El horario para ${serviceName} ya no está disponible en el calendario.` }
            }
        } catch (error) {
            console.error('Error checking Google availability:', error)
            // If Google fails, we might still want to check our DB or fail safe. 
            // For now, we continue to DB check.
        }

        // 2. Check Database Bookings
        const dbBookings = await this.getByDateRange(timeMin, timeMax)
        const now = Date.now()
        const isDBTaken = dbBookings.some(b => {
            // Pending bookings expire after 30 minutes
            if (b.status === 'pending') {
                const createdTime = new Date(b.created_at!).getTime()
                if ((now - createdTime) > 30 * 60000) return false;
            }
            const bStart = new Date(b.start_time).getTime()
            // Default 60min if not specified
            const bEnd = new Date(bStart + 60 * 60000).getTime()
            return (startTime.getTime() < bEnd) && (endTime.getTime() > bStart)
        })

        if (isDBTaken) {
            return { isAvailable: false, error: `El turno para ${serviceName} acaba de ser reservado por otro usuario.` }
        }

        return { isAvailable: true }
    }

    static async create(payload: {
        user_id?: string | null
        service_id: string
        start_time: string
        end_time?: string | null
        status: Booking['status']
        customer_name?: string | null
        customer_email?: string | null
        customer_phone?: string | null
        notes?: string | null
    }) {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('bookings')
            .insert(payload)
            .select()
            .single()

        if (error) throw error
        return data as Booking
    }

    static async updateStatus(id: string, status: string) {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Booking
    }

    static async updateBookingDetails(id: string, updates: Partial<Booking>) {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('bookings')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Booking
    }

    static async delete(id: string) {
        const supabase = await createClient()
        const { error } = await supabase.from('bookings').delete().eq('id', id)
        if (error) throw error
        return true
    }

    static async findByOrderNote(orderId: string, serviceId: string) {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('service_id', serviceId)
            .ilike('notes', `%${orderId}%`)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data[0] as Booking | undefined
    }

    static async updateGoogleCalendarId(id: string, eventId: string) {
        const supabase = await createClient()
        const { error } = await supabase
            .from('bookings')
            .update({ google_calendar_id: eventId })
            .eq('id', id)

        if (error) throw error
        return true
    }
}
