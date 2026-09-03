'use client'

import React from 'react'
import Link from 'next/link'
import { Clock, ArrowRight } from 'lucide-react'

export default function CheckoutPendingPage() {
    return (
        <main className="min-h-screen bg-background pt-32 pb-20 flex items-center justify-center">
            <div className="container mx-auto px-6 max-w-xl text-center">
                <div className="bg-surface border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-yellow-500" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Pago en Proceso
                    </h1>

                    <p className="text-white/70 mb-8 leading-relaxed">
                        Tu pago está pendiente de confirmación por Mercado Pago (por ejemplo, si abonaste en efectivo vía Pago Fácil / Rapipago). Apenas se acredite, recibirás el email de confirmación.
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
