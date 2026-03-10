'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, Package, Calendar, MapPin, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Order {
    id: string
    created_at: string
    status: string
    total: number
    shipping_address: string
    shipping_city: string
    payment_status: string
    items?: OrderItem[]
}

interface OrderItem {
    id: string
    product_name: string
    quantity: number
    unit_price: number
    product_id: string
    selected_variant?: {
        name: string
    } | null
    product?: {
        image_url: string | null
        images: string[] | null
        description: string | null
        type: string
    }
}

export default function OrderHistoryPage() {
    const { user } = useAuth()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null)

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return

            const supabase = createClient()

            // Fetch orders
            const { data: ordersData, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    items:order_items (
                        id,
                        product_name,
                        quantity,
                        unit_price,
                        product_id,
                        selected_variant,
                        product:products (
                            image_url,
                            images,
                            description,
                            type
                        )
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching orders:', error)
            } else {
                setOrders(ordersData as unknown as Order[])
            }
            setLoading(false)
        }

        fetchOrders()
    }, [user])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a080c] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a080c] py-20 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Package className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold text-white font-display">Mis Pedidos</h1>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-[#1d1520] border border-white/5 rounded-3xl p-12 text-center">
                        <Package className="w-16 h-16 text-white/10 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No tienes pedidos aún</h3>
                        <p className="text-white/40 mb-6">Explora nuestra tienda y encuentra algo especial para ti.</p>
                        <Link
                            href="/productos"
                            className="inline-flex bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-full transition-colors"
                        >
                            Ir a la Tienda
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-[#1d1520] border border-white/5 rounded-3xl p-6 hover:border-primary/20 transition-colors group">
                                <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-wider font-bold">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(order.created_at).toLocaleDateString('es-AR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                        <h3 className="text-white font-bold text-lg">
                                            Pedido #{order.id.slice(0, 8)}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                                                ${order.payment_status === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}
                                            `}>
                                                {order.payment_status === 'pending' ? 'Pendiente de Pago' : 'Pagado'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-white/40 text-xs mb-1">Total</div>
                                        <div className="text-2xl font-bold text-white text-primary">
                                            ${order.total.toLocaleString('es-AR')}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items Preview */}
                                <div className="bg-black/20 rounded-xl p-4 mb-4">
                                    <div className="space-y-3">
                                        {order.items?.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex justify-between items-center text-sm p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group/item"
                                                onClick={() => setSelectedItem(item)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-10 h-10 rounded-md overflow-hidden bg-white/5 shrink-0 border border-white/10">
                                                        {(item.product?.images?.[0] || item.product?.image_url) ? (
                                                            <Image
                                                                src={item.product.images?.[0] || item.product.image_url || ''}
                                                                alt={item.product_name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[8px] text-white/30 uppercase">
                                                                Sin IMG
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-primary font-bold">{item.quantity}x</span>
                                                            <span className="text-white/80 font-medium group-hover/item:text-primary transition-colors">
                                                                {item.product_name || 'Producto Desconocido'}
                                                                {item.selected_variant?.name ? ` (${item.selected_variant.name})` : ''}
                                                            </span>
                                                        </div>
                                                        <p className="text-white/30 text-xs line-clamp-1 max-w-[200px]">
                                                            Click para ver detalles
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-white/40 font-mono">
                                                    ${(item.unit_price * item.quantity).toLocaleString('es-AR')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-white/40 text-sm">
                                        <MapPin className="w-4 h-4" />
                                        {order.shipping_city || 'Digital'}
                                    </div>

                                    {/* Action Button (Details or Whatsapp) */}
                                    <button className="text-white text-sm font-bold flex items-center gap-1 group-hover:text-primary transition-colors">
                                        Ver Detalles <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Order Item Details Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
                    <div className="bg-[#1d1520] border border-white/10 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh] mt-20" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white/50 hover:text-white transition-colors border border-white/10"
                        >
                            <span className="text-xl leading-none">&times;</span>
                        </button>

                        <div className="relative h-64 w-full bg-[#0a080c] shrink-0">
                            {(selectedItem.product?.images?.[0] || selectedItem.product?.image_url) ? (
                                <Image
                                    src={selectedItem.product.images?.[0] || selectedItem.product.image_url || ''}
                                    alt={selectedItem.product_name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20 italic">
                                    Sin Imagen
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-[#1d1520] to-transparent">
                                <div className="inline-block px-3 py-1 rounded-full bg-primary/20 border border-primary/20 backdrop-blur-md mb-2">
                                    <span className="text-primary text-xs font-bold uppercase tracking-wider">
                                        {selectedItem.product?.type === 'physical' ? 'Producto Físico' : 'Servicio / Ritual'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div>
                                <h3 className="text-xl font-bold text-white font-display mb-2 text-primary leading-tight">
                                    {selectedItem.product_name}
                                </h3>
                                <p className="text-white/60 text-xs leading-relaxed line-clamp-3">
                                    {selectedItem.product?.description || 'Sin descripción disponible.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-6 mt-4 border-t border-white/5">
                                <div className="space-y-1">
                                    <span className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Cantidad</span>
                                    <p className="text-white font-bold text-lg">{selectedItem.quantity} <span className="text-xs font-normal text-white/40">unidades</span></p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <span className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Precio Unitario</span>
                                    <p className="text-white font-bold text-lg">${selectedItem.unit_price.toLocaleString('es-AR')}</p>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center border border-white/5 mt-6">
                                <span className="text-white/60 font-medium text-sm">Subtotal</span>
                                <span className="text-xl font-bold text-primary">
                                    ${(selectedItem.unit_price * selectedItem.quantity).toLocaleString('es-AR')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
