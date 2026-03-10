'use client'

import React from 'react'
import Link from 'next/link'
import { LayoutDashboard, ShoppingBag, Calendar, Package, Mail, LogOut, Hexagon, Tags, MessageCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { TriquetaLogo } from '@/components/ui/TriquetaLogo'

export function AdminSidebar() {
    const pathname = usePathname()
    const { signOut } = useAuth()

    const [mobileOpen, setMobileOpen] = React.useState(false)

    const links = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Pedidos', href: '/admin/orders', icon: ShoppingBag },
        { name: 'Turnos', href: '/admin/bookings', icon: Calendar },
        { name: 'Productos', href: '/admin/products', icon: Package },
        { name: 'Servicios', href: '/admin/services', icon: Hexagon },
        { name: 'Categorías', href: '/admin/categories', icon: Tags },
        { name: 'Reseñas', href: '/admin/reviews', icon: MessageCircle },
        { name: 'Mensajes', href: '/admin/messages', icon: Mail },
    ]

    return (
        <>
            {/* Mobile Header Toggle */}
            <div className="lg:hidden fixed top-0 w-full z-50 bg-[#120d14]/90 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center">
                <Link href="/admin" className="font-display font-bold text-white text-xl">
                    TLM <span className="text-primary tracking-widest uppercase text-sm ml-2 relative -top-0.5">Admin</span>
                </Link>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="text-white/70 hover:text-white"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </button>
            </div>

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-white/5 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

                {/* Logo Area */}
                <div className="hidden lg:flex items-center gap-3 p-8 border-b border-white/5">
                    <TriquetaLogo size={40} className="shrink-0" />
                    <div>
                        <h1 className="text-white font-bold font-display tracking-wide leading-tight">Tu Luz Mágica</h1>
                        <p className="text-primary text-[10px] uppercase tracking-widest font-bold">Panel de Control</p>
                    </div>
                </div>

                {/* Nav Links */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 mt-20 lg:mt-0">
                    {links.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-inner'
                                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_5px_rgba(244,114,182,0.5)]' : ''}`} />
                                {link.name}
                            </Link>
                        )
                    })}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/5 space-y-2">
                    <Link
                        href="/"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors font-medium"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Ir al Sitio
                    </Link>
                    <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/80 lg:hidden backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </>
    )
}
