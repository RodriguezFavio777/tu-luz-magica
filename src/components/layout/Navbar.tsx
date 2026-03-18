'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Menu, X, Sparkles, Calendar, LogOut, User as UserIcon } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useCartBadge } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { CartService } from '@/services/cart.service'
import { useCartStore } from '@/store/useCartStore'
import { TriquetaLogo } from '@/components/ui/TriquetaLogo'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { MoonPhaseIndicator } from '@/components/layout/MoonPhaseIndicator'
import { useHydrated } from '@/hooks/useHydrated'

function UserMenu() {
    const { user, role, signOut } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const [prevPath, setPrevPath] = useState(pathname)
    if (pathname !== prevPath) {
        setPrevPath(pathname)
        setIsOpen(false)
    }

    if (!user) {
        return (
            <Link
                href="/ingresar"
                className="text-white/80 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
            >
                Ingresar
            </Link>
        )
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 rounded-full border border-white/10 hover:border-primary/50 transition-colors"
                aria-expanded={isOpen}
                aria-label="Menú de usuario"
            >
                {user.user_metadata?.avatar_url ? (
                    <Image
                        src={user.user_metadata.avatar_url}
                        alt="Avatar"
                        width={32}
                        height={32}
                        className="rounded-full"
                    />
                ) : (
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-primary" />
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface border border-white/10 rounded-xl shadow-xl py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                        <p className="text-white text-sm font-bold truncate">{user.user_metadata?.full_name || 'Usuario'}</p>
                        <p className="text-white/40 text-[10px] truncate">{user.email}</p>
                    </div>
                    <Link
                        href="/perfil"
                        className="w-full text-left px-4 py-3 text-white hover:bg-white/5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
                    >
                        <UserIcon className="w-3 h-3 text-primary" />
                        Mi Perfil
                    </Link>
                    {role === 'admin' && (
                        <Link
                            href="/admin"
                            className="w-full text-left px-4 py-3 text-secondary hover:bg-white/5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-t border-white/5 transition-colors"
                        >
                            <Sparkles className="w-3 h-3" />
                            Panel Admin
                        </Link>
                    )}
                    <button
                        onClick={async () => {
                            try {
                                setIsLoggingOut(true)
                                useCartStore.getState().clearCart()
                                await signOut()
                                setIsOpen(false)
                                router.push('/')
                                router.refresh()
                            } catch (e) {
                                console.error('Logout failed', e)
                            } finally {
                                setIsLoggingOut(false)
                            }
                        }}
                        disabled={isLoggingOut}
                        className={`w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-t border-white/5 transition-colors ${isLoggingOut ? 'opacity-50 cursor-wait' : ''}`}
                    >
                        {isLoggingOut ? (
                            <div className="w-3 h-3 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
                        ) : (
                            <LogOut className="w-3 h-3" />
                        )}
                        {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
                    </button>
                </div>
            )}
        </div>
    )
}

function HydratedBadge({ count }: { count: number }) {
    const mounted = useHydrated()

    if (!mounted) return null

    return (
        <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-[0_0_15px_rgba(244,114,182,0.4)]">
            {count}
        </span>
    )
}

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [cartOpen, setCartOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { itemCount } = useCartBadge()
    const { user, loading } = useAuth()
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path

    // Sync Cart with Server on Auth State Change
    useEffect(() => {
        if (loading) return

        const syncCart = async () => {
            if (user) {
                try {
                    const items = await CartService.getCart(user.id)
                    useCartStore.getState().setItems(items)
                } catch (error) {
                    console.error('Failed to sync cart:', error)
                }
            } else {
                // If no user and finished loading, ALWAYS clear cart (User requirement)
                useCartStore.getState().clearCart()
            }
        }

        syncCart()
    }, [user, loading])

    const [prevPath, setPrevPath] = useState(pathname)
    if (pathname !== prevPath) {
        setPrevPath(pathname)
        setMobileMenuOpen(false)
        setCartOpen(false)
    }

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <>
            <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

            <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-white/5 py-3 md:py-4' : 'bg-transparent py-4 md:py-6'
                }`}>
                <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-6">
                        <Link
                            href="/"
                            aria-label="Volver al inicio - Tu Luz Mágica"
                            className="flex items-center gap-3 group"
                        >
                            <TriquetaLogo size={42} className="group-hover:rotate-12 transition-transform duration-500" aria-hidden="true" />
                            <span className="text-2xl font-bold tracking-tight font-display bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent hidden md:block">
                                Tu Luz Mágica
                            </span>
                        </Link>

                        {/* Moon Phase - Desktop */}
                        <div className="hidden lg:block border-l border-white/10 pl-6 ml-2" aria-hidden="true">
                            <MoonPhaseIndicator />
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-10" aria-label="Navegación principal">
                        {[
                            { name: 'Inicio', path: '/' },
                            { name: 'Servicios', path: '/servicios' },
                            { name: 'Tienda', path: '/productos' },
                            { name: 'Sobre Mí', path: '/sobre-mi' },
                        ].map((link) => (
                            <Link
                                key={link.path}
                                href={link.path}
                                aria-current={isActive(link.path) ? 'page' : undefined}
                                className={`text-sm font-medium transition-colors ${isActive(link.path)
                                    ? 'text-primary font-bold'
                                    : 'text-white/80 hover:text-primary'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setCartOpen(true)}
                            className="relative p-2 group"
                            aria-label={`Ver carrito ${itemCount > 0 ? `(${itemCount} productos)` : ''}`}
                        >
                            <ShoppingCart className="w-6 h-6 text-white/80 group-hover:text-white transition-colors" aria-hidden="true" />
                            {itemCount > 0 && (
                                <HydratedBadge count={itemCount} />
                            )}
                        </button>

                        {/* User Auth */}
                        <UserMenu />

                        <Link
                            href="/servicios"
                            aria-label="Reservar una sesión"
                            className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_4px_20px_rgba(244,114,182,0.3)] hover:scale-105 active:scale-95"
                        >
                            <Calendar className="w-4 h-4" aria-hidden="true" />
                            Reservar Sesión
                        </Link>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden text-white"
                            aria-expanded={mobileMenuOpen}
                            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                        >
                            {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-surface/95 backdrop-blur-2xl border-b border-white/10 p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-white/90">Inicio</Link>
                        <Link href="/servicios" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-white/90">Servicios</Link>
                        <Link href="/productos" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-white/90">Tienda</Link>
                        <Link href="/sobre-mi" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-white/90">Sobre Mí</Link>
                        <Link href="/servicios" onClick={() => setMobileMenuOpen(false)} className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 text-center uppercase tracking-widest text-xs">
                            Reservar Sesión
                        </Link>
                    </div>
                )}
            </header>
        </>
    )
}
