'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { CartItemCard, CartSummary } from '@/components/cart/CartComponents'

export default function CartPage() {
    const { items, itemCount } = useCart()

    return (
        <main className="min-h-screen bg-background pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-7xl">
                <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors mb-12 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Volver al inicio</span>
                </Link>

                <header className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <ShoppingCart className="text-secondary w-6 h-6" />
                        <span className="text-secondary text-xs font-black uppercase tracking-[0.4em]">Tus Elecciones</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold">Carrito de <span className="text-primary italic">Luz</span></h1>
                </header>

                {itemCount === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <p className="text-white/40 text-xl mb-10 italic">Tu carrito está vacío, esperando por tu magia...</p>
                        <Link href="/servicios" className="bg-primary text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-primary-hover transition-all shadow-xl shadow-primary/20">
                            Explorar Servicios
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-12 items-start">
                        <div className="lg:col-span-2 space-y-6">
                            {items.map((item) => (
                                <CartItemCard key={item.id} item={item} />
                            ))}
                        </div>
                        <div className="lg:col-span-1 lg:sticky top-32">
                            <CartSummary />
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
