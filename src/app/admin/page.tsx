'use client'

import React, { useEffect, useState } from 'react'
import { ShoppingBag, Calendar, Package, TrendingUp, Users, Clock, ArrowUpRight, CheckCircle2, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { format, subMonths, startOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'

export default function AdminDashboard() {
    const [supabase] = useState(() => createClient())
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        pendingOrders: 0,
        pendingBookings: 0,
        totalProducts: 0,
        monthlyIncome: 0
    })
    interface ActivityItem {
        id: string
        customer_name: string | null
        total?: number
        status: string
        created_at: string
        type: 'order' | 'booking'
        booking_date?: string
    }

    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
    const [salesHistory, setSalesHistory] = useState<{ name: string; total: number }[]>([])

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true)
            try {
                // 1. Core Stats
                const { count: pendingOrders } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'paid')

                const { count: activeBookings } = await supabase
                    .from('bookings')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'confirmed')

                const { count: totalProducts } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true })

                // 2. Monthly Income (Current Month)
                const now = new Date()
                const startOfCurrentMonth = startOfMonth(now).toISOString()

                const { data: monthOrders } = await supabase
                    .from('orders')
                    .select('total')
                    .gte('created_at', startOfCurrentMonth)
                    .in('status', ['paid', 'completed', 'shipped'])

                const totalIncomes = monthOrders?.reduce((acc, order) => acc + (order.total || 0), 0) || 0

                setStats({
                    pendingOrders: pendingOrders || 0,
                    pendingBookings: activeBookings || 0,
                    totalProducts: totalProducts || 0,
                    monthlyIncome: totalIncomes
                })

                // 3. Recent Activity (Orders + Bookings)
                const { data: orders } = await supabase
                    .from('orders')
                    .select('id, customer_name, total, status, created_at')
                    .order('created_at', { ascending: false })
                    .limit(5)

                const { data: bookings } = await supabase
                    .from('bookings')
                    .select('id, customer_name, status, booking_date, created_at')
                    .order('created_at', { ascending: false })
                    .limit(5)

                const combined = [
                    ...(orders?.map(o => ({ ...o, type: 'order' as const })) || []),
                    ...(bookings?.map(b => ({ ...b, type: 'booking' as const })) || [])
                ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6)

                setRecentActivity(combined)

                // 4. Sales History (Last 6 Months)
                const sixMonthsAgo = startOfMonth(subMonths(now, 5)).toISOString()
                const { data: historyOrders } = await supabase
                    .from('orders')
                    .select('total, created_at')
                    .gte('created_at', sixMonthsAgo)
                    .in('status', ['paid', 'completed', 'shipped'])

                const chartData = Array.from({ length: 6 }).map((_, i) => {
                    const monthDate = subMonths(now, 5 - i)
                    const monthName = format(monthDate, 'MMM', { locale: es })
                    const monthKey = format(monthDate, 'yyyy-MM')

                    const monthTotal = historyOrders?.reduce((acc, order) => {
                        const orderMonth = format(new Date(order.created_at), 'yyyy-MM')
                        return orderMonth === monthKey ? acc + (order.total || 0) : acc
                    }, 0) || 0

                    return { name: monthName, total: monthTotal }
                })

                setSalesHistory(chartData)

            } catch (err) {
                console.error('Error fetching dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [supabase])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
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
                    title="Turnos Confirmados"
                    value={stats.pendingBookings}
                    icon={Calendar}
                    color="text-green-400"
                    bgColor="bg-green-400/10"
                    link="/admin/bookings"
                />
                <StatCard
                    title="Catálogo Total"
                    value={stats.totalProducts}
                    icon={Package}
                    color="text-purple-400"
                    bgColor="bg-purple-400/10"
                    link="/admin/products"
                />
                <StatCard
                    title="Ingresos (Mes)"
                    value={`$${stats.monthlyIncome.toLocaleString('es-AR')}`}
                    icon={TrendingUp}
                    color="text-emerald-400"
                    bgColor="bg-emerald-400/10"
                    link="/admin/orders"
                />
            </div>

            {/* Middle Section: Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-surface border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-white">Ventas Mensuales</h2>
                            <p className="text-sm text-white/40">Cierre de facturación últimos 6 meses</p>
                        </div>
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <CreditCard className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>

                    <div className="flex-1 min-h-[250px] relative flex items-end justify-between gap-2 px-2 pb-8 pt-4">
                        {/* Simple CSS Chart */}
                        {salesHistory.map((data, idx) => {
                            const maxVal = Math.max(...salesHistory.map(h => h.total), 1)
                            const heightPercentage = (data.total / maxVal) * 100

                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                    {/* Tooltip */}
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg pointer-events-none">
                                        ${data.total.toLocaleString('es-AR')}
                                    </div>

                                    <div
                                        className="w-full max-w-[40px] bg-linear-to-t from-primary/50 to-primary rounded-t-lg transition-all duration-1000 group-hover:from-primary group-hover:to-primary group-hover:scale-x-110 shadow-[0_0_20px_rgba(244,114,182,0.1)]"
                                        style={{ height: `${Math.max(heightPercentage, 2)}%` }}
                                    />
                                    <span className="absolute -bottom-6 text-[10px] font-bold text-white/30 uppercase tracking-widest group-hover:text-white transition-colors">
                                        {data.name}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Shortcuts */}
                <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl">
                    <h2 className="text-xl font-bold text-white mb-6">Atajos</h2>
                    <div className="space-y-4">
                        <QuickLink href="/admin/products/new" label="Nuevo Producto" icon={Package} />
                        <QuickLink href="/admin/services/new" label="Nuevo Servicio" icon={CheckCircle2} />
                        <QuickLink href="/admin/bookings" label="Gestionar Turnos" icon={Calendar} />
                        <QuickLink href="/admin/orders" label="Ver Pedidos" icon={ShoppingBag} />
                    </div>

                    <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                        <p className="text-xs text-primary font-bold uppercase tracking-widest mb-2">Recordatorio Contable</p>
                        <p className="text-xs text-white/60 leading-relaxed">
                            Los cierres mensuales se calculan en base a pedidos con estado &quot;Pagado&quot;, &quot;Completado&quot; o &quot;Enviado&quot;.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Recent Activity */}
            <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Actividad Reciente
                    </h2>
                    <Link href="/admin/orders" className="text-xs text-primary hover:underline font-bold uppercase tracking-widest">
                        Ver todo
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentActivity.length > 0 ? (
                        recentActivity.map((item, idx) => (
                            <div key={idx} className="bg-black/20 border border-white/5 rounded-xl p-4 flex items-center gap-4 group hover:bg-black/30 transition-all">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.type === 'order' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'
                                    }`}>
                                    {item.type === 'order' ? <ShoppingBag size={18} /> : <Calendar size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-bold text-sm truncate">{item.customer_name || 'Cliente Anon.'}</p>
                                    <p className="text-white/30 text-xs flex items-center gap-1">
                                        {item.type === 'order' ? 'Pedido por' : 'Turno reservado'}
                                        <span className="text-white/50 font-bold">{item.total ? `$${item.total.toLocaleString()}` : 'Confirmado'}</span>
                                    </p>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-primary transition-colors" />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-xl">
                            <Users className="w-12 h-12 text-white/10 mb-4 mx-auto" />
                            <p className="text-white/40">No hay actividad reciente para mostrar.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, color, bgColor, link }: { title: string, value: string | number, icon: React.ElementType, color: string, bgColor: string, link: string }) {
    return (
        <Link href={link} className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl hover:border-white/10 transition-all group hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center mb-6 ring-1 ring-white/10 shadow-lg`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
                <p className="text-white/50 text-sm font-medium mb-1 uppercase tracking-widest">{title}</p>
                <p className="text-3xl font-display font-bold text-white group-hover:text-primary transition-colors">{value}</p>
            </div>
        </Link>
    )
}

function QuickLink({ href, label, icon: Icon }: { href: string, label: string, icon: React.ElementType }) {
    return (
        <Link href={href} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white text-sm font-medium group active:scale-[0.98]">
            <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                {label}
            </div>
            <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
        </Link>
    )
}
