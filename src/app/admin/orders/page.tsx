'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Eye, Trash2, Search, ExternalLink, Package } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id, 
                    created_at, 
                    total_amount, 
                    status, 
                    mp_payment_id,
                    user_id,
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
    }

    const updateOrderStatus = async (orderId: string, newStatus: string, order: any) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId)

            if (error) throw error

            // Optimistic update
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))

            // Enviar email de actualización de estado
            if (order.profiles?.email) {
                const { sendStatusUpdateEmail } = await import('@/actions/sendMail')
                await sendStatusUpdateEmail(
                    order.profiles.email,
                    order.profiles.full_name || 'Cliente Mágico',
                    order.id,
                    newStatus,
                    false // isBooking = false
                )
            }

        } catch (error) {
            console.error('Error updating status:', error)
            alert('Error al actualizar el estado del pedido.')
        }
    }

    const deleteOrder = async (orderId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este pedido de forma permanente? Esta acción no se puede deshacer.')) return

        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId)

            if (error) throw error

            setOrders(orders.filter(o => o.id !== orderId))
        } catch (error) {
            console.error('Error deleting order:', error)
            alert('Hubo un problema al intentar eliminar el pedido. Verifica que no tenga dependencias pendientes.')
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Completado':
            case 'Enviado':
            case 'Pagado':
                return 'bg-green-500/20 text-green-400 border border-green-500/20'
            case 'Pendiente':
                return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
            case 'Cancelado':
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
                    <p className="text-white/50 text-sm">Gestiona pagos, envíos y el estado general de las ventas físicas.</p>
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
                                <th className="p-6 font-medium">Order ID / Fecha</th>
                                <th className="p-6 font-medium">Cliente</th>
                                <th className="p-6 font-medium">Monto</th>
                                <th className="p-6 font-medium">MercadoPago</th>
                                <th className="p-6 font-medium">Estado</th>
                                <th className="p-6 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-12 text-white/50 animate-pulse">
                                        Cargando pedidos...
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-12 text-white/50">
                                        <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        No se encontraron pedidos.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
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
                                                ${order.total_amount?.toLocaleString('es-AR')}
                                            </p>
                                        </td>
                                        <td className="p-6">
                                            {order.mp_payment_id ? (
                                                <a
                                                    href={`https://www.mercadopago.com.ar/activities/details/${order.mp_payment_id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    {order.mp_payment_id}
                                                </a>
                                            ) : (
                                                <span className="text-white/20 text-xs italic">N/A</span>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value, order)}
                                                className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full cursor-pointer appearance-none ${getStatusBadge(order.status)}`}
                                                style={{ textAlignLast: 'center' }}
                                            >
                                                <option value="Pendiente" className="bg-[#1a151b] text-white">Pendiente</option>
                                                <option value="Pagado" className="bg-[#1a151b] text-white">Pagado</option>
                                                <option value="Enviado" className="bg-[#1a151b] text-white">Enviado</option>
                                                <option value="Completado" className="bg-[#1a151b] text-white">Completado</option>
                                                <option value="Cancelado" className="bg-[#1a151b] text-white">Cancelado</option>
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
                                                onClick={() => deleteOrder(order.id)}
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
        </div>
    )
}
