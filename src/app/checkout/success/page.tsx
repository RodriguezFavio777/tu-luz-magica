'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

export default function CheckoutSuccessPage() {
    const { clearCart } = useCart()

    useEffect(() => {
        clearCart()
        if (typeof window !== 'undefined') {
            localStorage.removeItem('checkout_shipping_data')
        }
    }, [clearCart])

    return (
        <main className="min-h-screen bg-background pt-32 pb-20 flex items-center justify-center">
            <div className="container mx-auto px-6 max-w-xl text-center">
                <div className="bg-surface border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-xs uppercase font-bold tracking-widest text-primary">Pago Confirmado</span>
                        <Sparkles className="w-4 h-4 text-primary" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        ¡Gracias por tu compra mágica!
                    </h1>

                    <p className="text-white/70 mb-8 leading-relaxed">
                        Tu pago ha sido acreditado exitosamente. Te enviamos un correo con los detalles de tu pedido y confirmación del turno o envío.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/"
                            className="bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                            Volver al Inicio
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}
