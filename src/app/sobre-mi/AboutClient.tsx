'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { submitContactForm } from '@/lib/actions/contact'
import {
    Clock, Heart, ShieldCheck, Star, ArrowRight, Mail, Instagram
} from 'lucide-react'

// Images (Unsplash placeholders unless specified)
const IMAGE_HERO = "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2694&auto=format&fit=crop"
const IMAGE_PROFILE = "/cami-profile.webp"
const IMAGE_GRID_1 = "/tarot_card_reading_close_up_mystical_1770752736602.webp" // Tarot
const IMAGE_GRID_2 = "/healing_crystals_amethyst_quartz_altar_1770752752291.webp" // Crystals
const IMAGE_GRID_3 = "/lit_candles_ritual_mystical_atmosphere_1770752768490.webp" // Candle
const IMAGE_GRID_4 = "/cosmic_sky_stars_nebula_mystical_v2_1770752822948.webp" // Sky

export function AboutClient() {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: 'lectura', message: '' })
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

    // Handle hash scroll after loading delay
    React.useEffect(() => {
        if (window.location.hash) {
            const id = window.location.hash.substring(1);
            // Small timeout to ensure DOM is ready
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('sending')

        const formPayload = new FormData()
        formPayload.append('name', formData.name)
        formPayload.append('email', formData.email)
        formPayload.append('phone', formData.phone)
        formPayload.append('subject', formData.subject)
        formPayload.append('message', formData.message)

        try {
            const result = await submitContactForm(null, formPayload)
            if (result.success) {
                setStatus('sent')
                setFormData({ name: '', email: '', phone: '', subject: 'lectura', message: '' })
            } else {
                setStatus('error')
            }
        } catch (error) {
            console.error(error)
            setStatus('error')
        }
    }

    return (
        <main className="min-h-screen bg-background">
            {/* 1. HERO SECTION */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src={IMAGE_HERO}
                        alt="Background Mystical"
                        fill
                        className="object-cover opacity-60 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0a080c]/50 to-[#0a080c]" />
                </div>

                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-display drop-shadow-2xl">
                            El Alma Detrás de <br />
                            <span className="bg-linear-to-r from-primary via-secondary to-primary/80 bg-clip-text text-transparent italic drop-shadow-[0_0_25px_rgba(244,114,182,0.6)]">Tu Luz Mágica</span>
                        </h1>
                        <p className="text-white/70 text-lg md:text-xl font-body max-w-2xl mx-auto leading-relaxed">
                            Descubre mi camino, mi misión y el compromiso inquebrantable que tengo con tu evolución espiritual.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* 2. BIO SECTION */}
            <section className="py-20 bg-[#0a080c]">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        {/* Profile Image Column */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative aspect-3/4 rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(244,114,182,0.6)] group"
                        >
                            <Image
                                src={IMAGE_PROFILE}
                                alt="Hola, soy Camí"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-8">
                                <span className="inline-block bg-primary text-white px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest mb-2">MI HISTORIA</span>
                            </div>
                        </motion.div>

                        {/* Bio Text Column */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 font-display">
                                Hola, soy <span className="text-primary italic drop-shadow-[0_0_15px_rgba(244,114,182,0.5)]">Camí</span>
                            </h2>
                            <div className="space-y-6 text-white/70 font-body text-lg leading-relaxed">
                                <p>
                                    Desde muy pequeña, sentí una conexión profunda con lo invisible. Mi camino no fue lineal; comenzó con una búsqueda personal de sanación que me llevó a través de diversos linajes de sabiduría ancestral y técnicas modernas de bienestar.
                                </p>
                                <p>
                                    A lo largo de los años, he dedicado mi vida a estudiar el Tarot evolutivo, la sanación energética y la astrología psicológica. Lo que comenzó como un llamado íntimo se transformó en mi misión de vida: ser un canal para que otros descubran su propio poder interior.
                                </p>
                                <p>
                                    En <strong className="text-white">Tu Luz Mágica</strong> no solo ofrezco servicios, comparto un pedazo de mi alma y el eco de la luz que he recolectado en mi propio viaje hacia la paz.
                                </p>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-4 mt-8">
                                {['Tarotista Evolutiva', 'Reikista Maestra', 'Guía Espiritual'].map(tag => (
                                    <span key={tag} className="text-primary font-bold text-xs uppercase tracking-[0.2em] border border-primary/30 px-4 py-2 rounded-full shadow-[0_0_10px_rgba(244,114,182,0.2)]">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 3. PHILOSOPHY SECTION */}
            <section className="py-24 bg-background relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                <div className="container mx-auto px-6 max-w-6xl relative z-10 text-center">
                    <div className="inline-block mb-4">
                        <span className="text-secondary text-xs font-bold uppercase tracking-[0.25em] glow-text">Filosofía de Trabajo</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-16 font-display drop-shadow-lg">Ética, Honestidad y Compasión</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <PhilosophyCard
                            icon={<ShieldCheck className="w-8 h-8 text-secondary" />}
                            title="Espacio Seguro"
                            description="Confidencialidad absoluta y un entorno libre de juicios para que puedas expresarte con total libertad."
                        />
                        {/* Card 2 */}
                        <PhilosophyCard
                            icon={<Star className="w-8 h-8 text-primary" />}
                            title="Enfoque Consciente"
                            description="No busco el efectismo ni la adivinación fatalista, mi objetivo es darte herramientas para que tú seas el arquitecto de tu destino."
                        />
                        {/* Card 3 */}
                        <PhilosophyCard
                            icon={<Heart className="w-8 h-8 text-secondary" />}
                            title="Compromiso Real"
                            description="Cada lectura y ritual se realiza con una preparación energética previa y dedicación exclusiva a tu consulta."
                        />
                    </div>
                </div>
            </section>

            {/* 4. WHY ME SECTION */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Text */}
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 font-display">
                                Por qué trabajar <br />
                                <span className="text-primary italic drop-shadow-[0_0_15px_rgba(244,114,182,0.5)]">conmigo</span>
                            </h2>
                            <p className="text-white/60 mt-6 mb-8 text-lg leading-relaxed">
                                Entiendo que elegir una guía espiritual es un acto de confianza inmenso. Mi trabajo no se trata de adivinar el futuro, sino de ayudarte a comprender el presente para crear el futuro que deseas.
                            </p>

                            <div className="space-y-6">
                                <BenefitItem
                                    icon={<Heart className="w-5 h-5 text-white" />}
                                    title="Acompañamiento Empático"
                                    desc="He estado en tu lugar. Entiendo tus dudas y el miedo al cambio."
                                />
                                <BenefitItem
                                    icon={<Clock className="w-5 h-5 text-white" />}
                                    title="Sabiduría Integrada"
                                    desc="Combino herramientas ancestrales con una visión práctica y moderna."
                                />
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4 translate-y-8">
                                <div className="aspect-4/5 rounded-2xl overflow-hidden relative border border-white/5">
                                    <Image src={IMAGE_GRID_1} alt="Tarot" fill className="object-cover" />
                                </div>
                                <div className="aspect-square rounded-2xl overflow-hidden relative border border-white/5">
                                    <Image src={IMAGE_GRID_3} alt="Velas" fill className="object-cover" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="aspect-square rounded-2xl overflow-hidden relative border border-white/5">
                                    <Image src={IMAGE_GRID_2} alt="Cristales" fill className="object-cover" />
                                </div>
                                <div className="aspect-4/5 rounded-2xl overflow-hidden relative border border-white/5">
                                    <Image src={IMAGE_GRID_4} alt="Cielo" fill className="object-cover" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. CONTACT SECTION */}
            <section className="py-24 bg-[#151018] scroll-mt-46" id="contacto">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid lg:grid-cols-5 gap-12 bg-white/5 rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl">

                        {/* Info (2 cols) */}
                        <div className="lg:col-span-2 flex flex-col justify-center">
                            <div className="inline-block mb-4">
                                <span className="text-secondary text-xs font-bold uppercase tracking-[0.25em] glow-text">Hablemos</span>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-6 font-display">Conectemos</h2>
                            <p className="text-white/60 mb-8 leading-relaxed">
                                ¿Tienes alguna duda sobre los servicios? ¿Necesitas orientación para elegir tu lectura? Escríbeme y te responderé con amor en las próximas 24-48 horas.
                            </p>

                            <div className="space-y-6">
                                <ContactLink
                                    icon={<Mail className="w-5 h-5" />}
                                    text="cami@tuluzmagica.com"
                                    href="mailto:cami@tuluzmagica.com"
                                />
                                <div className="pt-6 border-t border-white/5">
                                    <p className="text-secondary text-xs font-bold uppercase tracking-widest mb-4">Redes Sociales</p>
                                    <div className="flex gap-4">
                                        <Link
                                            href="https://instagram.com"
                                            target="_blank"
                                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-primary hover:text-white transition-all border border-white/5"
                                        >
                                            <Instagram className="w-5 h-5" />
                                        </Link>
                                        <Link
                                            href="https://tiktok.com"
                                            target="_blank"
                                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-primary hover:text-white transition-all border border-white/5 relative group"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="w-5 h-5"
                                            >
                                                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                                            </svg>
                                        </Link>
                                        <Link
                                            href="https://youtube.com"
                                            target="_blank"
                                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-primary hover:text-white transition-all border border-white/5"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="w-5 h-5"
                                            >
                                                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                                                <path d="m10 15 5-3-5-3z" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 bg-primary/10 p-6 rounded-2xl border border-primary/20">
                                <div className="flex gap-3 items-start">
                                    <div className="w-3 h-3 rounded-full bg-primary mt-1.5 shrink-0 animate-pulse" />
                                    <div>
                                        <h4 className="text-primary font-bold text-sm mb-1">Reservas Directas</h4>
                                        <p className="text-primary/70 text-xs">Si ya sabes qué servicio necesitas, puedes agendar directamente para asegurar tu espacio en mi agenda.</p>
                                        <Link href="/servicios" className="text-white hover:text-primary text-xs font-bold uppercase tracking-wider mt-3 inline-flex items-center gap-2 group">
                                            Ir al calendario
                                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form (3 cols) */}
                        <div className="lg:col-span-3 bg-surface p-8 md:p-10 rounded-3xl border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.3)] flex flex-col justify-center">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-white/50 text-xs font-bold uppercase tracking-wider ml-1">Nombre Completo</label>
                                        <input
                                            name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Tu nombre"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/20 focus:outline-hidden focus:border-primary/50 transition-colors"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-white/50 text-xs font-bold uppercase tracking-wider ml-1">Correo Electrónico</label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="tu@email.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/20 focus:outline-hidden focus:border-primary/50 transition-colors"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-white/50 text-xs font-bold uppercase tracking-wider ml-1">Teléfono</label>
                                    <input
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+54 9 11 ..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/20 focus:outline-hidden focus:border-primary/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-white/50 text-xs font-bold uppercase tracking-wider ml-1">Asunto</label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-hidden focus:border-primary/50 transition-colors appearance-none"
                                    >
                                        <option value="lectura" className="bg-surface">Duda sobre Lecturas</option>
                                        <option value="tienda" className="bg-surface">Soporte Tienda</option>
                                        <option value="collab" className="bg-surface">Colaboración</option>
                                        <option value="otro" className="bg-surface">Otro</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-white/50 text-xs font-bold uppercase tracking-wider ml-1">Mensaje</label>
                                    <textarea
                                        name="message"
                                        rows={6}
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="¿En qué puedo ayudarte?"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/20 focus:outline-hidden focus:border-primary/50 transition-colors resize-none"
                                        required
                                    />
                                </div>

                                {status === 'error' && (
                                    <p className="text-red-400 text-xs text-center">Hubo un error al enviar el mensaje. Intenta nuevamente.</p>
                                )}
                                {status === 'sent' && (
                                    <p className="text-green-400 text-xs text-center font-bold">¡Mensaje enviado con éxito!</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === 'sending' || status === 'sent'}
                                    className="w-full py-4 rounded-xl bg-linear-to-r from-primary to-secondary text-white font-bold hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(244,114,182,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {status === 'sending' ? 'Enviando...' : status === 'sent' ? '¡Mensaje Enviado!' : 'Enviar Mensaje'}
                                    {status === 'idle' && <ArrowRight className="w-5 h-5" />}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

        </main >
    )
}


function PhilosophyCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-[#18121a] p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors text-left group hover:shadow-[0_0_30px_rgba(244,114,182,0.1)]">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/5">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3 font-display">{title}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{description}</p>
        </div>
    )
}

function BenefitItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors hover:border-primary/20">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-white mb-1">{title}</h4>
                <p className="text-white/60 text-sm">{desc}</p>
            </div>
        </div>
    )
}

function ContactLink({ icon, text, href }: { icon: React.ReactNode, text: string, href: string }) {
    return (
        <a href={href} className="flex items-center gap-4 text-white/70 hover:text-white transition-colors group">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all border border-white/5">
                {icon}
            </div>
            <span className="font-medium">{text}</span>
        </a>
    )
}

