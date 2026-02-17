'use client'

import React, { useState } from 'react'
import { User, Package, Settings, LogOut, MapPin, CreditCard, Save, Calendar, Clock, ChevronRight, UserCircle, Edit2, ChevronLeft, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface ProfileDashboardProps {
    user: any
    profile: any
    orders: any[]
}

export function ProfileDashboard({ user, profile, orders }: ProfileDashboardProps) {
    const router = useRouter()
    const supabase = createClient()
    const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile')
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [selectedItem, setSelectedItem] = useState<any>(null)

    // specific form state
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
        shipping_address: profile?.shipping_address || '',
        shipping_city: profile?.shipping_city || '',
        shipping_state: profile?.shipping_state || '',
        shipping_zip: profile?.shipping_zip || '',
    })

    // Update form data if profile changes (e.g. after refresh)
    React.useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                phone: profile.phone || '',
                shipping_address: profile.shipping_address || '',
                shipping_city: profile.shipping_city || '',
                shipping_state: profile.shipping_state || '',
                shipping_zip: profile.shipping_zip || '',
            })
        }
    }, [profile])

    // AUTO-ENABLE EDIT MODE IF DATA IS MISSING
    React.useEffect(() => {
        const hasShippingData = formData.shipping_address && formData.shipping_city && formData.shipping_state && formData.shipping_zip && formData.phone
        if (!hasShippingData && !isEditing && !isLoading) {
            // We could auto-enable here, but user explicitly asked for "disabled by default, enable with button".
            // So we will respect that unless it's empty to avoid confusion? 
            // Better to just leave it disabled and let them click "Editar" to be consistent with "desactivadas... en caso de que quiera editar se activan".
        }
    }, [formData])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        try {
            // UPSERT: inserta si no existe, actualiza si existe
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    ...formData,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'id'
                })

            if (error) throw error

            setMessage({ type: 'success', text: '✅ Perfil actualizado correctamente' })
            setIsEditing(false)

            // Recargar datos desde el servidor
            router.refresh()

            // Auto-hide success message después de 3 segundos
            setTimeout(() => setMessage(null), 3000)
        } catch (error: any) {
            console.error('❌ Error guardando perfil:', error)
            setMessage({ type: 'error', text: `Error: ${error.message}` })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 shrink-0 space-y-8">
                <div className="bg-[#1d1520] border border-white/5 rounded-3xl p-6 text-center">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                        <UserCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-white font-bold font-display truncate">{profile?.full_name || user.email}</h2>
                    <p className="text-white/40 text-xs truncate">{user.email}</p>
                </div>

                <nav className="flex flex-col gap-2">
                    <button
                        onClick={() => { setActiveTab('profile'); setSelectedOrder(null) }}
                        className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl transition-all font-bold text-sm ${activeTab === 'profile'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-[#1d1520] text-white/60 hover:text-white hover:bg-primary/5 hover:border-primary/20 border border-white/5'
                            }`}
                    >
                        <Settings className="w-5 h-5" />
                        Mis Datos
                    </button>
                    <button
                        onClick={() => { setActiveTab('orders'); setSelectedOrder(null) }}
                        className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl transition-all font-bold text-sm ${activeTab === 'orders'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-[#1d1520] text-white/60 hover:text-white hover:bg-primary/5 hover:border-primary/20 border border-white/5'
                            }`}
                    >
                        <Package className="w-5 h-5" />
                        Mis Pedidos
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-6 py-4 rounded-xl transition-all font-bold text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10 mt-4"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </nav>
            </aside>

            {/* Content */}
            <div className="flex-1 bg-[#1d1520] border border-white/5 rounded-3xl p-8 min-h-[500px]">
                {activeTab === 'profile' && (
                    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-white font-display mb-2">Configuración de Perfil</h3>
                                <p className="text-white/40 text-sm">Administra tu información personal y dirección de envío.</p>
                            </div>
                            {!isEditing && (
                                <button
                                    className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg transition-colors border border-primary/20 flex items-center gap-2 text-sm font-bold shadow-lg shadow-primary/5"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Editar
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={!isEditing}
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className={`w-full bg-[#151018] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-hidden focus:border-primary/50 transition-colors ${!isEditing ? 'opacity-50 cursor-not-allowed bg-black/20' : ''}`}
                                        placeholder="Ej. María Pérez"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        required
                                        disabled={!isEditing}
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className={`w-full bg-[#151018] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-hidden focus:border-primary/50 transition-colors ${!isEditing ? 'opacity-50 cursor-not-allowed bg-black/20' : ''}`}
                                        placeholder="+54 9 11 ..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">Dirección de Envío</label>
                                <div className="relative">
                                    <MapPin className={`absolute left-4 top-3.5 w-5 h-5 ${!isEditing ? 'text-white/20' : 'text-white/30'}`} />
                                    <input
                                        type="text"
                                        required
                                        disabled={!isEditing}
                                        value={formData.shipping_address}
                                        onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                                        className={`w-full bg-[#151018] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-hidden focus:border-primary/50 transition-colors ${!isEditing ? 'opacity-50 cursor-not-allowed bg-black/20' : ''}`}
                                        placeholder="Calle 123, Depto 4B"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">Ciudad</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={!isEditing}
                                        value={formData.shipping_city}
                                        onChange={(e) => setFormData({ ...formData, shipping_city: e.target.value })}
                                        className={`w-full bg-[#151018] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-hidden focus:border-primary/50 transition-colors ${!isEditing ? 'opacity-50 cursor-not-allowed bg-black/20' : ''}`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">Provincia/Estado</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={!isEditing}
                                        value={formData.shipping_state}
                                        onChange={(e) => setFormData({ ...formData, shipping_state: e.target.value })}
                                        className={`w-full bg-[#151018] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-hidden focus:border-primary/50 transition-colors ${!isEditing ? 'opacity-50 cursor-not-allowed bg-black/20' : ''}`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">Código Postal</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={!isEditing}
                                        value={formData.shipping_zip}
                                        onChange={(e) => setFormData({ ...formData, shipping_zip: e.target.value })}
                                        className={`w-full bg-[#151018] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-hidden focus:border-primary/50 transition-colors ${!isEditing ? 'opacity-50 cursor-not-allowed bg-black/20' : ''}`}
                                    />
                                </div>
                            </div>

                            {message && (
                                <div className={`p-4 rounded-xl text-sm font-bold text-center animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                    {message.text}
                                </div>
                            )}

                            {isEditing && (
                                <div className="pt-4 flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Clock className="w-5 h-5 animate-spin" /> : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                Guardar Cambios
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isLoading}
                                        onClick={() => {
                                            setIsEditing(false)
                                            // Reset to original props derived values
                                            setFormData({
                                                full_name: profile?.full_name || '',
                                                phone: profile?.phone || '',
                                                shipping_address: profile?.shipping_address || '',
                                                shipping_city: profile?.shipping_city || '',
                                                shipping_state: profile?.shipping_state || '',
                                                shipping_zip: profile?.shipping_zip || '',
                                            })
                                        }}
                                        className="bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl transition-colors border border-white/5"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {selectedOrder ? (
                            // ORDER DETAIL VIEW
                            <div className="space-y-6">
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Volver al listado
                                </button>

                                <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-6 border-b border-white/5">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white font-display mb-1">
                                            Pedido #{selectedOrder.id.slice(0, 8)}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-white/60">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(selectedOrder.created_at).toLocaleDateString('es-AR', {
                                                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border ${selectedOrder.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        selectedOrder.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                            'bg-white/10 text-white/50 border-white/10'
                                        }`}>
                                        {selectedOrder.status === 'completed' ? 'Completado' : selectedOrder.status === 'pending' ? 'Pendiente' : selectedOrder.status}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-bold text-white uppercase text-xs tracking-wider opacity-60">Productos</h4>
                                    <div className="bg-black/20 rounded-2xl overflow-hidden border border-white/5">
                                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                            selectedOrder.items.map((item: any, i: number) => (
                                                <div
                                                    key={i}
                                                    onClick={() => setSelectedItem(item)}
                                                    className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer group/item"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative border border-white/10">
                                                            {(item.product?.images?.[0] || item.product?.image_url) ? (
                                                                <Image
                                                                    src={item.product.images?.[0] || item.product.image_url}
                                                                    alt={item.product_name || 'Producto'}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <Package className="w-6 h-6 text-white/20" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white group-hover/item:text-primary transition-colors">
                                                                {item.product_name || 'Producto'}
                                                            </div>
                                                            <div className="text-xs text-white/40">{item.quantity} x ${item.unit_price?.toLocaleString('es-AR')}</div>
                                                            <div className="text-[10px] text-primary/70 mt-1 opacity-0 group-hover/item:opacity-100 transition-opacity uppercase tracking-wider font-bold">Ver Detalles</div>
                                                        </div>
                                                    </div>
                                                    <div className="font-bold text-white">
                                                        ${((item.quantity || 1) * (item.unit_price || 0)).toLocaleString('es-AR')}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-white/40 italic">No hay productos en este pedido (Error de datos legacy)</div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                    <div className="flex justify-between items-center text-sm mb-2">
                                        <span className="text-white/60">Subtotal</span>
                                        <span className="text-white font-bold">${selectedOrder.subtotal?.toLocaleString('es-AR') || selectedOrder.total?.toLocaleString('es-AR')}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm mb-4">
                                        <span className="text-white/60">Envío</span>
                                        <span className="text-white font-bold">${selectedOrder.shipping_cost?.toLocaleString('es-AR') || '0'}</span>
                                    </div>
                                    <div className="h-px w-full bg-white/10 my-4" />
                                    <div className="flex justify-between items-center text-xl">
                                        <span className="text-white font-bold">Total Pagado</span>
                                        <span className="text-primary font-bold">${selectedOrder.total?.toLocaleString('es-AR')}</span>
                                    </div>
                                </div>

                                {selectedOrder.shipping_address && (
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                        <h4 className="font-bold text-white uppercase text-xs tracking-wider opacity-60 mb-4 flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Dirección de Envío
                                        </h4>
                                        <p className="text-white">
                                            {selectedOrder.shipping_address}<br />
                                            {selectedOrder.shipping_city}, {selectedOrder.shipping_postal_code}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // ORDERS LIST
                            <>
                                <h3 className="text-2xl font-bold text-white font-display mb-2">Mis Pedidos</h3>
                                <p className="text-white/40 text-sm mb-8">Historial de compras y estado de envíos.</p>

                                {!orders || orders.length === 0 ? (
                                    <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/5">
                                        <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                        <p className="text-white/40">Aún no has realizado ningún pedido mágico.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                onClick={() => setSelectedOrder(order)}
                                                className="bg-[#151018] border border-white/5 rounded-2xl p-6 hover:border-primary/30 hover:bg-white/5 transition-all cursor-pointer group relative"
                                            >
                                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <span className="font-bold text-white text-lg">Pedido #{order.id.slice(0, 8)}</span>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${order.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                                order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                                    'bg-white/10 text-white/50 border-white/10'
                                                                }`}>
                                                                {order.status === 'completed' ? 'Completado' : order.status === 'pending' ? 'Pendiente' : order.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-white/40">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {new Date(order.created_at).toLocaleDateString()}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <CreditCard className="w-3 h-3" />
                                                                Total:
                                                                <span className="text-primary font-bold ml-1">${order.total.toLocaleString()}</span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="self-end md:self-center">
                                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                                            <ArrowRight className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
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
                                        <p className="text-white font-bold text-lg">${selectedItem.unit_price?.toLocaleString('es-AR')}</p>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center border border-white/5 mt-6">
                                    <span className="text-white/60 font-medium text-sm">Subtotal</span>
                                    <span className="text-xl font-bold text-primary">
                                        ${((selectedItem.unit_price || 0) * (selectedItem.quantity || 1)).toLocaleString('es-AR')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
