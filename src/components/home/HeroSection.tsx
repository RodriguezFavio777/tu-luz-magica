'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Calendar, ShoppingBag } from 'lucide-react'
import { TriquetaLogo } from '@/components/ui/TriquetaLogo'

export function HeroSection() {
    return (
        <section className="relative h-screen w-full flex items-center justify-center pt-20 overflow-hidden">
            {/* Background Image - Full Screen & Centered */}
            <div className="absolute inset-0 z-0 h-full w-full">
                <div className="absolute inset-0 bg-background/20 z-10" />
                <div className="absolute inset-0 bg-linear-to-b from-background/30 via-transparent to-background z-10" />
                <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent z-10" />
                <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDC8q67O81k9lwpZ5wtZdSJJiwGLnXK946JcUM0P0JINvIL0tl0UbzsVqS2lA7fP7eaTBBD8ttN1UvOiT_LuCnDScEcxIxWEOxciwHPFEecMeQvq4Rz0fypMd1ANYtsiY1c5KUUyc-m82zlMmC52yi8zkVqEh262U5cgNjjIUzMIDpcgA9UQuRGLJdfnW8WHinGasIfFfUqBTC6icoBsyqEI3_Drlnpu_tQkqEzkWhbLVJ33aILwAZ0Hr1lGCiLHyQH5_eid0iN7kA"
                    alt="Tu Luz Mágica"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center scale-100"
                />
            </div>

            {/* Content */}
            <div className="relative z-20 container mx-auto px-6 lg:px-12 max-w-7xl flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="max-w-4xl"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 mb-8 backdrop-blur-sm self-center">
                        <TriquetaLogo size={14} animate className="text-primary" />
                        <span className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] glow-text">Bienvenida a tu despertar</span>
                    </div>

                    <h2 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tighter text-white mb-8 font-sans drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                        Ilumina tu <br />
                        <span className="font-display bg-linear-to-r from-primary via-[#d63384] to-[#fa9acb] bg-clip-text text-transparent italic pr-3 drop-shadow-[0_0_25px_rgba(244,114,182,0.6)]">Esencia</span>
                        <span className="font-display bg-linear-to-r from-accent via-[#fcd34d] to-accent bg-clip-text text-transparent pl-3 drop-shadow-[0_0_25px_rgba(255,215,0,0.6)]">Sagrada</span>
                    </h2>


                    <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed mb-10 max-w-2xl mx-auto font-body text-balance">
                        Lecturas de tarot, rituales energéticos y herramientas místicas diseñadas por Camí para acompañarte en tu evolución espiritual.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link href="/servicios" className="h-16 px-10 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-base hover:scale-105 transition-all shadow-[0_0_30px_rgba(244,114,182,0.6)] flex items-center justify-center gap-3 active:scale-95">
                            <span>Reservar Sesión</span>
                            <Calendar className="w-5 h-5" />
                        </Link>
                        <Link href="/productos" className="h-16 px-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white font-bold text-base hover:bg-white/20 transition-all flex items-center justify-center gap-3 active:scale-95">
                            <ShoppingBag className="w-5 h-5" />
                            <span>Tienda Esotérica</span>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
