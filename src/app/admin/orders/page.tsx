'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Search, Package, ChevronDown, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { OrderDetailModal } from '@/components/admin/OrderDetailModal'
import { processOrderStatusChange } from '@/lib/actions/adminActions'
import { useToast } from '@/context/ToastContext'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

export default function AdminOrders() {
    const { showToast } = useToast()
    const [supabase] = useState(() => createClient())
    interface AdminOrder {
        id: string
        created_at: string
        total: number
        shipping_cost: number
        status: string
        profiles: {
            full_name: string | null
            email: string | null
            shipping_address: string | null
            phone: string | null
        } | null
    }
    const [orders, setOrders] = useState<AdminOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    profiles:user_id(full_name, email, shipping_address, phone)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setOrders(data || [])
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])




    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            // Use Server Action for side effects (Calendar, Email, Bookings)
            const result = await processOrderStatusChange(orderId, newStatus)

            if (result.success) {
                // Optimistic update locally
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
                showToast(`Estado del pedido actualizado a: ${newStatus}`, 'success')
            }
        } catch (error) {
            console.error('Error updating status:', error)
            showToast('Error al actualizar el estado del pedido: ' + (error as Error).message, 'error')
        }
    }

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [orderToDelete, setOrderToDelete] = useState<string | null>(null)

    const handleDeleteClick = (orderId: string) => {
        setOrderToDelete(orderId)
        setIsDeleteModalOpen(true)
    }

    const deleteOrder = async () => {
        if (!orderToDelete) return

        try {
            // 1. Fetch order items to find associated bookings
            const { data: items } = await supabase
                .from('order_items')
                .select('booking_id')
                .eq('order_id', orderToDelete)

            const bookingIds = items?.map(item => item.booking_id).filter(Boolean) as string[]

            // 2. Delete associated bookings if any
            if (bookingIds && bookingIds.length > 0) {
                await supabase
                    .from('bookings')
                    .delete()
                    .in('id', bookingIds)
            }

            // 3. Delete order items
            await supabase
                .from('order_items')
                .delete()
                .eq('order_id', orderToDelete)

            // 4. Delete the order itself
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderToDelete)

            if (error) throw error

            // Update local state
            setOrders(orders.filter(o => o.id !== orderToDelete))
            showToast('Pedido y registros asociados eliminados exitosamente', 'success')
        } catch (error) {
            console.error('Error deleting order:', error)
            showToast('Hubo un problema al intentar eliminar el pedido: ' + (error as Error).message, 'error')
        } finally {
            setOrderToDelete(null)
            setIsDeleteModalOpen(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const lowerCaseStatus = status?.toLowerCase()
        switch (lowerCaseStatus) {
            case 'completed':
            case 'shipped':
            case 'paid':
                return 'bg-green-500/20 text-green-400 border border-green-500/20'
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
            case 'cancelled':
                return 'bg-red-500/20 text-red-400 border border-red-500/20'
            default:
                return 'bg-white/10 text-white/70 border border-white/10'
        }
    }

    const filteredOrders = orders.filter(o =>
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white font-display mb-2">Pedidos Recientes</h1>
                    <p className="text-white/50 text-sm">Gestiona pagos, envíos y el estado general de las ventas.</p>
                </div>

                <div className="relative">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        type="text"
                        placeholder="Buscar ID, Email o Nombre..."
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
                                <th className="p-6 font-medium">Pedido / Fecha</th>
                                <th className="p-6 font-medium">Cliente</th>
                                <th className="p-6 font-medium">Monto</th>
                                <th className="p-6 font-medium">Estado</th>
                                <th className="p-6 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-12 text-white/50 animate-pulse">
                                        Cargando pedidos...
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-12 text-white/50">
                                        <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        No se encontraron pedidos.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-white/2 transition-colors group">
                                        <td className="p-6">
                                            <p className="text-white font-mono text-xs mb-1">...{order.id.slice(-8)}</p>
                                            <p className="text-white/40 text-xs">
                                                {format(new Date(order.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                                            </p>
                                        </td>
                                        <td className="p-6">
                                            <p className="text-white font-bold text-sm mb-1">{order.profiles?.full_name || 'Sin Nombre'}</p>
                                            <p className="text-white/50 text-xs truncate max-w-[200px]">{order.profiles?.email}</p>
                                        </td>
                                        <td className="p-6">
                                            <p className="text-emerald-400 font-bold tracking-wide">
                                                ${order.total?.toLocaleString('es-AR')}
                                            </p>
                                            {order.shipping_cost > 0 && (
                                                <p className="text-white/30 text-xs mt-1">
                                                    Envío: ${order.shipping_cost?.toLocaleString('es-AR')}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            <div className="relative inline-block">
                                                <select
                                                    value={order.status?.toLowerCase() || 'pending'}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                    className={`text-xs font-bold uppercase tracking-wider px-4 py-2 pr-8 rounded-full cursor-pointer appearance-none ${getStatusBadge(order.status)} bg-transparent focus:outline-hidden`}
                                                >
                                                    <option value="pending" className="bg-surface text-white">Pendiente</option>
                                                    <option value="paid" className="bg-surface text-white">Pagado</option>
                                                    <option value="shipped" className="bg-surface text-white">Enviado</option>
                                                    <option value="completed" className="bg-surface text-white">Completado</option>
                                                    <option value="cancelled" className="bg-surface text-white">Cancelado</option>
                                                </select>
                                                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                                            </div>
                                        </td>
                                        <td className="p-6 text-right space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order)
                                                    setIsModalOpen(true)
                                                }}
                                                className="p-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-colors inline-flex"
                                                title="Ver Detalles"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(order.id)}
                                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors inline-flex"
                                                title="Eliminar Pedido"
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

            <OrderDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={deleteOrder}
                title="¿Eliminar Pedido?"
                message="¿Estás seguro de que quieres eliminar este pedido de forma permanente? Esta acción no se puede deshacer y borrará todos los registros asociados."
                confirmText="Eliminar"
                variant="danger"
            />
        </div>
    )
}
