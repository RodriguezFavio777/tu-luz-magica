'use client'

import React from 'react'
import { X, ShoppingBag, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { CartItemCard } from './CartComponents'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CartDrawerProps {
    isOpen: boolean
    onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { items, subtotal, itemCount, clearCart } = useCart()
    const router = useRouter()

    const handleCheckout = () => {
        onClose()
        router.push('/checkout')
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-[#120d14] border-l border-white/10 shadow-2xl z-[70] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#1d1520]">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="w-5 h-5 text-primary" />
                                <h2 className="text-xl font-bold text-white font-display">Tu Altar ({itemCount})</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                    <ShoppingBag className="w-16 h-16 text-white/20" />
                                    <p className="text-white text-lg">Tu carrito está vacío</p>
                                    <button
                                        onClick={onClose}
                                        className="text-primary hover:text-primary-hover underline text-sm"
                                    >
                                        Explorar la tienda
                                    </button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <CartItemCard key={item.id} item={item} />
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 bg-[#1d1520] border-t border-white/5 space-y-4">
                                <div className="flex items-center justify-between text-white mb-2">
                                    <span className="text-white/60">Subtotal</span>
                                    <span className="text-2xl font-bold">${subtotal.toLocaleString('es-AR')}</span>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <span>Ir al Checkout</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={clearCart}
                                    className="w-full text-xs text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Vaciar carrito
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
