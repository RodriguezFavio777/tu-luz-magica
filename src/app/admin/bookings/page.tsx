'use client'

import React, { useEffect, useState, useCallback } from 'react'

import { Eye, Trash2, Search, Calendar as CalendarIcon, Clock, User, Hexagon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useToast } from '@/context/ToastContext'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

import { AdminBooking } from '@/services/BookingService'
import { getAdminBookings, updateBookingStatusAction, updateBookingDetailsAction, deleteBookingAction } from '@/lib/actions/bookingActions'

export default function AdminBookings() {
    const { showToast } = useToast()
    const [bookings, setBookings] = useState<AdminBooking[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [bookingToDelete, setBookingToDelete] = useState<string | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingBooking, setEditingBooking] = useState<AdminBooking | null>(null)

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true)
            const data = await getAdminBookings()
            setBookings(data || [])
        } catch (error) {
            console.error('Error fetching bookings:', error)
            showToast('Error al cargar los turnos.', 'error')
        } finally {
            setLoading(false)
        }
    }, [showToast])

    useEffect(() => {
        fetchBookings()
    }, [fetchBookings])


    const updateBookingStatus = async (bookingId: string, newStatus: string, booking: AdminBooking) => {
        try {
            const emailInfo = booking.profiles?.email
                ? { email: booking.profiles.email, fullName: booking.profiles.full_name || 'Cliente Mágico' }
                : undefined

            const result = await updateBookingStatusAction(bookingId, newStatus, emailInfo)

            if (!result.success) throw new Error(result.error)

            setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b))
            showToast(`Estado del turno actualizado a: ${newStatus}`, 'success')

        } catch (error: unknown) {
            console.error('Error updating status:', error)
            showToast('Error al actualizar el estado del turno.', 'error')
        }
    }

    const handleDeleteClick = (bookingId: string) => {
        setBookingToDelete(bookingId)
        setIsDeleteModalOpen(true)
    }

    const deleteBooking = async () => {
        if (!bookingToDelete) return

        try {
            const result = await deleteBookingAction(bookingToDelete)

            if (!result.success) throw new Error(result.error)

            setBookings(bookings.filter(b => b.id !== bookingToDelete))
            showToast('Turno eliminado correctamente')
        } catch (error: unknown) {
            console.error('Error deleting booking:', error)
            showToast('Hubo un problema al intentar eliminar el turno.', 'error')
        } finally {
            setBookingToDelete(null)
        }
    }

    const handleEditClick = (booking: AdminBooking) => {
        setEditingBooking({
            ...booking,
            // Format for datetime-local input
            start_time: booking.start_time ? new Date(booking.start_time).toISOString().slice(0, 16) : ''
        })
        setIsEditModalOpen(true)
    }

    const saveBookingChanges = async () => {
        if (!editingBooking) return

        try {
            const result = await updateBookingDetailsAction(editingBooking.id, {
                start_time: editingBooking.start_time,
                status: editingBooking.status,
                notes: editingBooking.notes
            })

            if (!result.success) throw new Error(result.error)

            setBookings(bookings.map(b => b.id === editingBooking.id ? {
                ...b,
                start_time: editingBooking.start_time,
                status: editingBooking.status,
                notes: editingBooking.notes
            } : b))

            showToast('Turno actualizado correctamente')
            setIsEditModalOpen(false)
        } catch (error: unknown) {
            console.error('Error updating booking:', error)
            showToast('Error al guardar los cambios del turno.', 'error')
        }
    }

    const getStatusBadge = (status: string) => {
        const lowerStatus = status?.toLowerCase()
        switch (lowerStatus) {
            case 'completed':
            case 'realizada':
            case 'confirmed':
            case 'confirmada':
                return 'bg-green-500/20 text-green-400 border border-green-500/20'
            case 'pending':
            case 'pendiente':
                return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
            case 'cancelled':
            case 'cancelada':
            case 'rejected':
            case 'rechazada':
                return 'bg-red-500/20 text-red-400 border border-red-500/20'
            case 'rescheduled':
            case 'reprogramada':
                return 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
            default:
                return 'bg-white/10 text-white/70 border border-white/10'
        }
    }

    const filteredBookings = bookings.filter(b =>
        b.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.services?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
                                    <tr key={booking.id} className="hover:bg-white/2 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex flex-col justify-center items-center text-primary border border-primary/20">
                                                    <span className="text-xs font-bold leading-none">{booking.start_time ? format(new Date(booking.start_time), "dd") : '--'}</span>
                                                    <span className="text-[10px] uppercase font-bold leading-none opacity-80">{booking.start_time ? format(new Date(booking.start_time), "MMM", { locale: es }) : '--'}</span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm tracking-wide">
                                                        {booking.start_time ? format(new Date(booking.start_time), "EEEE", { locale: es }) : 'Fecha no asignada'}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 text-white/50 text-xs mt-0.5">
                                                        <Clock className="w-3 h-3 text-secondary" />
                                                        {booking.start_time ? format(new Date(booking.start_time), "HH:mm") : '--:--'} hs
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-6">
                                            <div className="flex items-center gap-2 mb-1 text-white font-bold text-sm">
                                                <User className="w-3.5 h-3.5 text-primary" />
                                                {booking.customer_name || booking.profiles?.full_name || 'Desconocido'}
                                            </div>
                                            <div className="flex flex-col gap-0.5 text-white/40 text-xs pl-5.5">
                                                <span>{booking.customer_email || booking.profiles?.email}</span>
                                                {(booking.customer_phone || booking.profiles?.phone) && <span>{booking.customer_phone || booking.profiles?.phone}</span>}
                                            </div>
                                        </td>

                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <Hexagon className="w-4 h-4 text-secondary opacity-50" />
                                                <p className="text-white font-medium text-sm">
                                                    {booking.services?.name || 'Servicio Desconocido'}
                                                </p>
                                            </div>
                                            <div className="mt-1 flex gap-2">
                                                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/50`}>
                                                    Ref: {booking.id.substring(0, 8)}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="p-6">
                                            <select
                                                value={booking.status?.toLowerCase() || 'pending'}
                                                onChange={(e) => updateBookingStatus(booking.id, e.target.value, booking)}
                                                className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full cursor-pointer appearance-none ${getStatusBadge(booking.status)}`}
                                                style={{ textAlignLast: 'center' }}
                                            >
                                                <option value="pending" className="bg-[#1a151b] text-white">Pendiente</option>
                                                <option value="confirmed" className="bg-[#1a151b] text-white">Confirmada</option>
                                                <option value="rescheduled" className="bg-[#1a151b] text-white">Reprogramada</option>
                                                <option value="completed" className="bg-[#1a151b] text-white">Realizada</option>
                                                <option value="cancelled" className="bg-[#1a151b] text-white">Cancelada</option>
                                            </select>
                                        </td>
                                        <td className="p-6 text-right space-x-2">
                                            <button
                                                onClick={() => handleEditClick(booking)}
                                                className="p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg transition-colors inline-flex"
                                                title="Editar Turno"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(booking.id)}
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

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={deleteBooking}
                title="¿Eliminar Turno?"
                message="¿Estás seguro de que quieres eliminar este turno de forma permanente? Esta acción no se puede deshacer y liberará el horario en tu agenda."
                confirmText="Eliminar"
                variant="danger"
            />

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-surface border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white font-display">Editar <span className="text-primary italic">Turno</span></h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-white/40 hover:text-white">✕</button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Fecha y Hora</label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-hidden focus:border-primary/50 transition-colors"
                                    value={editingBooking?.start_time || ''}
                                    onChange={(e) => setEditingBooking(prev => prev ? { ...prev, start_time: e.target.value } : null)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Estado</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-hidden focus:border-primary/50 transition-colors uppercase font-bold text-xs tracking-wider"
                                    value={editingBooking?.status || 'pending'}
                                    onChange={(e) => setEditingBooking(prev => prev ? { ...prev, status: e.target.value } : null)}
                                >
                                    <option value="pending" className="bg-[#1a151b]">Pendiente</option>
                                    <option value="confirmed" className="bg-[#1a151b]">Confirmada</option>
                                    <option value="rescheduled" className="bg-[#1a151b]">Reprogramada</option>
                                    <option value="completed" className="bg-[#1a151b]">Realizada</option>
                                    <option value="cancelled" className="bg-[#1a151b]">Cancelada</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Notas / Detalles</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-hidden focus:border-primary/50 transition-colors min-h-[100px]"
                                    placeholder="Agrega notas internas o detalles del ritual..."
                                    value={editingBooking?.notes || ''}
                                    onChange={(e) => setEditingBooking(prev => prev ? { ...prev, notes: e.target.value } : null)}
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-white/2 border-t border-white/5 flex gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-xs text-white/40 hover:bg-white/5 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={saveBookingChanges}
                                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
