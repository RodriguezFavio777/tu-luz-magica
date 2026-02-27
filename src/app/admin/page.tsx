'use client'

import React, { useEffect, useState } from 'react'
import { ShoppingBag, Calendar, Package, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        pendingOrders: 0,
        pendingBookings: 0,
        totalProducts: 0,
        totalServices: 0
    })

    useEffect(() => {
        const fetchStats = async () => {
            // Count pending orders
            const { count: pendingOrders } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'Pendiente')

            // Count bookings
            const { count: pendingBookings } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .in('status', ['Pendiente', 'Confirmada'])

            // Count products
            const { count: totalProducts } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })

            setStats({
                pendingOrders: pendingOrders || 0,
                pendingBookings: pendingBookings || 0,
                totalProducts: totalProducts || 0, // Need strictly separating logic later
                totalServices: 0 // Will implement distinction later
            })
        }

        fetchStats()
    }, [])

    return (
        <div className="space-y-8 min-h-[80vh]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white font-display">Dashboard</h1>
                    <p className="text-white/50 mt-1">Resumen general de tu tienda y servicios.</p>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Pedidos Pendientes"
                    value={stats.pendingOrders}
                    icon={ShoppingBag}
                    color="text-blue-400"
                    bgColor="bg-blue-400/10"
                    link="/admin/orders"
                />
                <StatCard
                    title="Turnos Activos"
                    value={stats.pendingBookings}
                    icon={Calendar}
                    color="text-green-400"
                    bgColor="bg-green-400/10"
                    link="/admin/bookings"
                />
                <StatCard
                    title="Total Productos"
                    value={stats.totalProducts}
                    icon={Package}
                    color="text-purple-400"
                    bgColor="bg-purple-400/10"
                    link="/admin/products"
                />
                <StatCard
                    title="Ingresos (Mes)"
                    value={"$ 0"}
                    icon={TrendingUp}
                    color="text-emerald-400"
                    bgColor="bg-emerald-400/10"
                    link="/admin/orders"
                />
            </div>

            {/* Quick Actions & Recent Activity area can go here */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Empty state for now */}
                <div className="lg:col-span-2 bg-surface border border-white/5 rounded-2xl p-6 shadow-xl">
                    <h2 className="text-xl font-bold text-white mb-6">Actividad Reciente</h2>
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-white/5 rounded-xl">
                        <Users className="w-12 h-12 text-white/10 mb-4" />
                        <p className="text-white/40">La actividad reciente aparecerá aquí conforme ingresen nuevos pedidos y reservas.</p>
                    </div>
                </div>

                <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl">
                    <h2 className="text-xl font-bold text-white mb-6">Atajos</h2>
                    <div className="space-y-3">
                        <Link href="/admin/products/new" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white text-sm font-medium">
                            <Package className="w-4 h-4 text-primary" />
                            Nuevo Producto
                        </Link>
                        <Link href="/admin/services/new" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white text-sm font-medium">
                            <span className="w-4 h-4 text-primary flex items-center justify-center font-bold font-serif italic text-lg leading-none mt-1">M</span>
                            Nuevo Servicio
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, color, bgColor, link }: any) {
    return (
        <Link href={link} className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl hover:border-white/10 transition-all group hover:-translate-y-1">
            <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center mb-6`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
                <p className="text-white/50 text-sm font-medium mb-1">{title}</p>
                <p className="text-3xl font-display font-bold text-white group-hover:text-primary transition-colors">{value}</p>
            </div>
        </Link>
    )
}
