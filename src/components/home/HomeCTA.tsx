'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'

export function HomeCTA() {
    return (
        <section className="py-32 bg-primary relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    whileInView={{ opacity: 1, scale: 1 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    className="max-w-3xl mx-auto"
                >
                    <h2 className="text-5xl md:text-6xl font-black text-white mb-8 font-display drop-shadow-[0_2px_10px_rgba(0,0,0,0.1)]">¿Lista para comenzar tu viaje?</h2>
                    <p className="text-white/90 text-xl max-w-2xl mx-auto mb-12 font-body font-light">
                        No dejes para mañana la sanación que tu alma necesita hoy. Encuentra tu luz en este espacio sagrado.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link href="/servicios" className="bg-background text-white px-10 py-5 rounded-full font-bold text-sm hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 group">
                            <Calendar className="w-5 h-5 group-hover:text-primary transition-colors" />
                            Agendar mi Sesión
                        </Link>
                        <Link href="/productos" className="bg-transparent border-2 border-white text-white px-10 py-5 rounded-full font-bold text-sm hover:bg-white/20 transition-all active:scale-95">
                            Explorar la Tienda
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
