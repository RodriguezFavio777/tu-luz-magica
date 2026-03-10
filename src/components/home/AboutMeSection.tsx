'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, ArrowRight } from 'lucide-react'

export function AboutMeSection() {
    return (
        <section className="py-32 relative bg-background" id="sobre-mi">
            <div className="absolute inset-0 bg-star-pattern"></div>
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        whileInView={{ opacity: 1, x: 0 }}
                        initial={{ opacity: 0, x: -50 }}
                        viewport={{ once: true }}
                        className="relative group"
                    >
                        <div className="absolute -inset-4 bg-linear-to-tr from-primary/30 to-secondary/30 rounded-4xl opacity-30 blur-2xl group-hover:opacity-50 transition-opacity duration-700"></div>
                        <div className="relative rounded-4xl overflow-hidden border border-white/10 aspect-4/5 shadow-[0_0_30px_rgba(244,114,182,0.6)] hover:shadow-[0_0_50px_rgba(244,114,182,0.8)] transition-shadow duration-500">
                            <Image
                                src="/cami-profile.jpg"
                                alt="Camí - Guía Espiritual"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover"
                            />
                            <div className="absolute bottom-8 left-8 right-8 glass-panel p-6 rounded-2xl">
                                <div className="flex items-center gap-1 text-secondary mb-2">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                                </div>
                                <p className="text-white/90 italic text-sm leading-relaxed font-body">
                                    &quot;Mi misión es recordarte que el universo entero conspira a tu favor cuando aprendes a escuchar tu propia luz.&quot;
                                </p>
                                <p className="text-primary font-bold text-xs mt-3 uppercase tracking-widest">— Camí</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileInView={{ opacity: 1, x: 0 }}
                        initial={{ opacity: 0, x: 50 }}
                        viewport={{ once: true }}
                        className="flex flex-col gap-8"
                    >
                        <div>
                            <h3 className="text-secondary text-sm font-bold uppercase tracking-[0.25em] mb-4 glow-text">La Guía Detrás de la Magia</h3>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight font-display">Canalizando Luz para tu <span className="italic bg-linear-to-r from-primary via-secondary to-primary/80 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(244,114,182,0.5)]">Evolución</span></h2>
                            <p className="text-white/60 text-lg leading-relaxed font-body mb-6">
                                Soy Camí, terapeuta holística y guía espiritual. Mi camino comenzó con la búsqueda de respuestas en lo invisible, encontrando en el tarot y los rituales las herramientas perfectas para transformar realidades.
                            </p>
                            <p className="text-white/60 text-lg leading-relaxed font-body">
                                En este santuario digital, te ofrezco un puente entre lo terrenal y lo divino, ayudándote a sanar bloqueos y manifestar la vida que tu alma anhela.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 border-y border-white/5 py-8">
                            <div>
                                <span className="text-3xl font-bold text-white block">+800</span>
                                <span className="text-white/40 text-[10px] uppercase tracking-widest">Almas conectadas</span>
                            </div>
                            <div>
                                <span className="text-3xl font-bold text-white block">7+</span>
                                <span className="text-white/40 text-[10px] uppercase tracking-widest">Años de experiencia</span>
                            </div>
                        </div>

                        <Link href="/sobre-mi" className="inline-flex items-center gap-4 text-secondary hover:text-primary font-black uppercase tracking-[0.3em] text-[10px] transition-all group">
                            Conoce mi camino espiritual
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
