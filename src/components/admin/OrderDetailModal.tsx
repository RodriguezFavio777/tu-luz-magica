'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, Clock, User, Mail, Phone, MapPin, CreditCard, ShoppingBag } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'

interface AdminOrder {
    id: string
    created_at: string
    total: number
    subtotal?: number
    shipping_cost: number
    status: string
    payment_status?: string
    shipping_address?: string
    shipping_city?: string
    shipping_postal_code?: string
    requires_shipping?: boolean
    customer_name?: string
    customer_email?: string
    customer_phone?: string
    profiles?: {
        full_name: string | null
        email: string | null
        shipping_address: string | null
        phone: string | null
    } | null
}

interface OrderItem {
    product_name: string
    quantity: number
    unit_price: number
    selected_variant?: { name: string } | null
    bookings?: { start_time: string; end_time: string } | null
}

interface OrderDetailModalProps {
    isOpen: boolean
    onClose: () => void
    order: AdminOrder | null
}

export function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
    const [supabase] = useState(() => createClient())
    const [items, setItems] = useState<OrderItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isOpen || !order?.id) return

        const fetchOrderItems = async () => {
            try {
                setLoading(true)
                const { data, error } = await supabase
                    .from('order_items')
                    .select('*, bookings(start_time, end_time)')
                    .eq('order_id', order.id)

                if (error) throw error
                setItems(data || [])
            } catch (error) {
                console.error('Error fetching order items:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchOrderItems()
    }, [isOpen, order, supabase])


    if (!order) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-3xl bg-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <Package className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white font-display">Detalle del Pedido</h3>
                                    <p className="text-white/40 text-xs font-mono uppercase">ID: {order.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-8">
                            {/* Grid Info */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Customer Info */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                                        <User className="w-3 h-3" />
                                        Información del Cliente
                                    </h4>
                                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <User className="w-4 h-4 text-white/30" />
                                            <span className="text-white font-medium">{order.customer_name || order.profiles?.full_name || 'Sin Nombre'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Mail className="w-4 h-4 text-white/30" />
                                            <span className="text-white/70">{order.customer_email || order.profiles?.email || 'Sin Email'}</span>
                                        </div>
                                        {(order.customer_phone || order.profiles?.phone) && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Phone className="w-4 h-4 text-white/30" />
                                                <span className="text-white/70">{order.customer_phone || order.profiles?.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Order Status & Payment */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                                        <CreditCard className="w-3 h-3" />
                                        Estado y Pago
                                    </h4>
                                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-white/40">Fecha:</span>
                                            <span className="text-white">{format(new Date(order.created_at), "d 'de' MMMM, yyyy", { locale: es })}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-white/40">Estado:</span>
                                            <span className="text-xs font-bold uppercase tracking-wider text-primary">{order.status}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-white/40">Pago:</span>
                                            <span className="text-white uppercase text-xs">{order.payment_status || 'Pendiente'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping info if needed */}
                            {order.requires_shipping && (
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                                        <MapPin className="w-3 h-3" />
                                        Dirección de Envío
                                    </h4>
                                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                        <p className="text-white/70 text-sm leading-relaxed">
                                            {order.shipping_address}, {order.shipping_city} ({order.shipping_postal_code})
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Items Table */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                                    <ShoppingBag className="w-3 h-3" />
                                    Productos / Servicios ({items.length})
                                </h4>
                                <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-white/5 text-white/30 text-[10px] uppercase font-bold">
                                            <tr>
                                                <th className="p-4">Item</th>
                                                <th className="p-4 text-center">Cant.</th>
                                                <th className="p-4 text-right">Precio</th>
                                                <th className="p-4 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-white/70">
                                            {loading ? (
                                                <tr><td colSpan={4} className="p-8 text-center animate-pulse">Cargando items...</td></tr>
                                            ) : (
                                                items.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-white/2">
                                                        <td className="p-4">
                                                            <div className="font-medium text-white">{item.product_name}</div>
                                                            {item.selected_variant?.name && (
                                                                <div className="text-[10px] text-primary mt-0.5">Variante: {item.selected_variant.name}</div>
                                                            )}
                                                            {item.bookings?.start_time && (
                                                                <div className="text-[10px] text-amber-400 mt-1.5 flex items-center gap-1 font-bold bg-amber-400/10 w-fit px-2 py-0.5 rounded-md">
                                                                    <Clock className="w-3 h-3" />
                                                                    {format(new Date(item.bookings.start_time), "d 'de' MMM, HH:mm'hs'", { locale: es })}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="p-4 text-center">{item.quantity}</td>
                                                        <td className="p-4 text-right">${item.unit_price?.toLocaleString('es-AR')}</td>
                                                        <td className="p-4 text-right font-bold text-white">
                                                            ${(item.quantity * item.unit_price)?.toLocaleString('es-AR')}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                        <tfoot className="bg-white/5 font-bold text-white">
                                            <tr>
                                                <td colSpan={3} className="p-4 text-right text-white/40">Subtotal</td>
                                                <td className="p-4 text-right">${order.subtotal?.toLocaleString('es-AR')}</td>
                                            </tr>
                                            {order.shipping_cost > 0 && (
                                                <tr>
                                                    <td colSpan={3} className="p-4 text-right text-white/40">Envío</td>
                                                    <td className="p-4 text-right">${order.shipping_cost?.toLocaleString('es-AR')}</td>
                                                </tr>
                                            )}
                                            <tr className="text-lg bg-primary/10 border-t border-primary/20">
                                                <td colSpan={3} className="p-4 text-right">Total</td>
                                                <td className="p-4 text-right text-primary font-display">${order.total?.toLocaleString('es-AR')}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-full border border-white/10 text-white/70 hover:bg-white/5 transition-colors text-sm font-bold"
                            >
                                Cerrar
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
