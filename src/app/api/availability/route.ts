import { NextResponse } from 'next/server'
import { getFreeBusy } from '@/lib/googleCalendar'
import { BookingService } from '@/services/BookingService'
import { startOfDay, endOfDay } from 'date-fns'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    try {
        // 1. Get Google Calendar Busy slots
        const startDate = new Date(date + 'T00:00:00');
        const timeMin = startOfDay(startDate).toISOString()
        const timeMax = endOfDay(startDate).toISOString()


        const googleBusy = await getFreeBusy(timeMin, timeMax)

        // 2. Get Suppabase bookings via Service
        const dbBookings = await BookingService.getByDateRange(timeMin, timeMax)

        // 3. Filter and Combine Busy Slots
        const now = Date.now()
        const dbBusy = dbBookings
            .filter(b => {
                // Ignore rituals
                const serviceName = (b.services as { name: string } | null)?.name?.toLowerCase() || ''
                const isRitual = serviceName.includes('ritual') || serviceName.includes('limpieza') || serviceName.includes('velación') || serviceName.includes('endulzamiento');
                if (isRitual) return false;

                if (b.status === 'pending') {
                    const createdTime = new Date(b.created_at!).getTime()
                    return (now - createdTime) < 30 * 60000;
                }

                return b.status === 'confirmed';
            })
            .map(b => ({
                start: b.start_time,
                end: b.end_time || new Date(new Date(b.start_time).getTime() + 60 * 60000).toISOString()
            }))

        const allBusy = [
            ...googleBusy.map((b: { start?: string | null; end?: string | null }) => ({ start: b.start || '', end: b.end || '' })),
            ...dbBusy
        ]

        return NextResponse.json({ busy: allBusy })

    } catch (error) {
        console.error('Availability API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
