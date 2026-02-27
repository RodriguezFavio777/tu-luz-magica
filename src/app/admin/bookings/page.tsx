'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Eye, Trash2, Search, Calendar as CalendarIcon, Clock, User, Hexagon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function AdminBookings() {
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    id, 
                    created_at, 
                    booking_date, 
                    booking_time, 
                    status, 
                    payment_status,
                    product_id,
                    user_id,
                    profiles:user_id(full_name, email, phone),
                    products:product_id(name, category_id)
                `)
                .order('booking_date', { ascending: false })

            if (error) throw error
            setBookings(data || [])
        } catch (error) {
            console.error('Error fetching bookings:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateBookingStatus = async (bookingId: string, newStatus: string, booking: any) => {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: newStatus })
                .eq('id', bookingId)

            if (error) throw error

            setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))

            if (booking.profiles?.email) {
                const { sendStatusUpdateEmail } = await import('@/actions/sendMail')
                await sendStatusUpdateEmail(
                    booking.profiles.email,
                    booking.profiles.full_name || 'Cliente Mágico',
                    booking.id,
                    newStatus,
                    true // isBooking = true
                )
            }

        } catch (error) {
            console.error('Error updating status:', error)
            alert('Error al actualizar el estado del turno.')
        }
    }

    const deleteBooking = async (bookingId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este turno de forma permanente? Esta acción no se puede deshacer.')) return

        try {
            const { error } = await supabase
                .from('bookings')
                .delete()
                .eq('id', bookingId)

            if (error) throw error

            setBookings(bookings.filter(b => b.id !== bookingId))
        } catch (error) {
            console.error('Error deleting booking:', error)
            alert('Hubo un problema al intentar eliminar el turno.')
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Realizada':
            case 'Confirmada':
                return 'bg-green-500/20 text-green-400 border border-green-500/20'
            case 'Pendiente':
                return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
            case 'Cancelada':
            case 'Rechazada':
                return 'bg-red-500/20 text-red-400 border border-red-500/20'
            case 'Reprogramada':
                return 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
            default:
                return 'bg-white/10 text-white/70 border border-white/10'
        }
    }

    const filteredBookings = bookings.filter(b =>
        b.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.products?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white font-display mb-2">Turnos y Reservas</h1>
                    <p className="text-white/50 text-sm">Organiza tu agenda de Rituales, Lecturas de Tarot y otros servicios holísticos.</p>
                </div>

                <div className="relative">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        type="text"
                        placeholder="Buscar Cliente o Servicio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-4 py-3 bg-surface border border-white/10 rounded-full text-sm text-white focus:outline-hidden focus:border-primary/50 w-full md:w-80 transition-colors"
                    />
                </div>
            </div>

            <div className="bg-surface border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-wider text-white/50 font-bold">
                                <th className="p-6 font-medium">Fecha y Hora</th>
                                <th className="p-6 font-medium">Paciente / Cliente</th>
                                <th className="p-6 font-medium">Servicio</th>
                                <th className="p-6 font-medium">Estado del Turno</th>
                                <th className="p-6 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-12 text-white/50 animate-pulse">
                                        Cargando turnos...
                                    </td>
                                </tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-12 text-white/50">
                                        <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        No hay turnos registrados en este momento.
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex flex-col justify-center items-center text-primary border border-primary/20">
                                                    <span className="text-xs font-bold leading-none">{format(new Date(booking.booking_date), "dd")}</span>
                                                    <span className="text-[10px] uppercase font-bold leading-none opacity-80">{format(new Date(booking.booking_date), "MMM", { locale: es })}</span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm tracking-wide">
                                                        {format(new Date(booking.booking_date), "EEEE", { locale: es })}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 text-white/50 text-xs mt-0.5">
                                                        <Clock className="w-3 h-3 text-secondary" />
                                                        {booking.booking_time}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-6">
                                            <div className="flex items-center gap-2 mb-1 text-white font-bold text-sm">
                                                <User className="w-3.5 h-3.5 text-primary" />
                                                {booking.profiles?.full_name || 'Desconocido'}
                                            </div>
                                            <div className="flex flex-col gap-0.5 text-white/40 text-xs pl-5.5">
                                                <span>{booking.profiles?.email}</span>
                                                {booking.profiles?.phone && <span>{booking.profiles?.phone}</span>}
                                            </div>
                                        </td>

                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <Hexagon className="w-4 h-4 text-secondary opacity-50" />
                                                <p className="text-white font-medium text-sm">
                                                    {booking.products?.name || 'Servicio Desconocido'}
                                                </p>
                                            </div>
                                            <div className="mt-1 flex gap-2">
                                                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${booking.payment_status === 'Pagado' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/50'
                                                    }`}>
                                                    Pago: {booking.payment_status}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="p-6">
                                            <select
                                                value={booking.status}
                                                onChange={(e) => updateBookingStatus(booking.id, e.target.value, booking)}
                                                className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full cursor-pointer appearance-none ${getStatusBadge(booking.status)}`}
                                                style={{ textAlignLast: 'center' }}
                                            >
                                                <option value="Pendiente" className="bg-[#1a151b] text-white">Pendiente</option>
                                                <option value="Confirmada" className="bg-[#1a151b] text-white">Confirmada</option>
                                                <option value="Reprogramada" className="bg-[#1a151b] text-white">Reprogramada</option>
                                                <option value="Realizada" className="bg-[#1a151b] text-white">Realizada</option>
                                                <option value="Cancelada" className="bg-[#1a151b] text-white">Cancelada</option>
                                            </select>
                                        </td>
                                        <td className="p-6 text-right space-x-2">
                                            <button
                                                className="p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg transition-colors inline-flex"
                                                title="Ver Detalles (Próximamente)"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteBooking(booking.id)}
                                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors inline-flex"
                                                title="Eliminar Turno"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
