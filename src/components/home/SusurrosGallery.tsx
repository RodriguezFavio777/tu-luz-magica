'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X, MessageSquare, Quote, Star, Send, Loader2,
    Sparkles, Heart, CheckCircle2
} from 'lucide-react'
import { submitReview, getReviews } from '@/lib/actions/reviews'
import { useToast } from '@/context/ToastContext'

import { type Review } from '@/services/ReviewService'
export function SusurrosGallery() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const { showToast } = useToast()

    const [formData, setFormData] = useState({
        user_name: '',
        content: '',
        rating: 5
    })

    useEffect(() => {
        fetchReviews()
    }, [])

    async function fetchReviews() {
        setLoading(true)
        const data = await getReviews()
        setReviews(data)
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const form = new FormData()
            form.append('user_name', formData.user_name)
            form.append('content', formData.content)
            form.append('rating', formData.rating.toString())

            const result = await submitReview(form)
            if (result.success) {
                showToast('¡Gracias! Tu mensaje fue enviado y aparecerá pronto.', 'success')
                setFormData({ user_name: '', content: '', rating: 5 })
                setShowForm(false)
                // We don't refresh the list yet because it's pending approval
            } else {
                showToast('Error al enviar: ' + result.error, 'error')
            }
        } catch (error) {
            console.error('Error submitting review:', error)
            showToast('Ocurrió un error inesperado', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <section className="py-32 bg-background relative overflow-hidden" id="susurros">
            {/* Background Ornaments */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/20 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
                    <div className="text-left max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 mb-4 backdrop-blur-sm">
                            <Sparkles className="w-3 h-3 text-primary" />
                            <span className="text-primary text-[10px] font-bold uppercase tracking-wider">Voces de la Comunidad</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 font-display">Susurros de <span className="text-primary italic">Luz</span></h2>
                        <p className="text-white/60 text-lg md:text-xl font-body leading-relaxed text-balance">
                            Un espacio sagrado para compartir experiencias, sanaciones y despertar de consciencia.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        aria-label="Abrir formulario para dejar un testimonio"
                        className="px-8 py-4 rounded-full bg-linear-to-r from-primary to-primary-hover text-white font-bold text-sm shadow-[0_0_25px_rgba(244,114,182,0.4)] hover:shadow-[0_0_40px_rgba(244,114,182,0.6)] hover:scale-105 transition-all flex items-center gap-3 active:scale-95 group"
                    >
                        <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" aria-hidden="true" />
                        Dejar mi Susurro
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" aria-hidden="true" />
                        <p className="text-white/40 animate-pulse uppercase tracking-widest text-xs">Escuchando los susurros...</p>
                    </div>
                ) : reviews.length > 0 ? (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {reviews.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                viewport={{ once: true }}
                                className="break-inside-avoid relative p-8 rounded-3xl bg-surface/40 border border-white/5 backdrop-blur-md group hover:border-primary/30 transition-all duration-500 shadow-xl"
                            >
                                <div className="absolute top-6 right-8 text-white/5 opacity-50 group-hover:text-primary/20 transition-colors" aria-hidden="true">
                                    <Quote className="w-12 h-12 rotate-180" />
                                </div>

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center text-primary font-bold" aria-hidden="true">
                                        {item.user_name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm">{item.user_name}</h4>
                                        <div className="flex gap-0.5 mt-0.5" aria-label={`Calificación de ${item.rating} de 5 estrellas`}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < item.rating ? 'text-secondary fill-secondary' : 'text-white/10'}`} aria-hidden="true" />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-white/80 text-base leading-relaxed font-body italic mb-6">
                                    &quot;{item.content}&quot;
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-white/5 opacity-40">
                                    <span className="text-[10px] text-white/70 uppercase tracking-widest">
                                        {new Date(item.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                    {item.pinned && <CheckCircle2 className="w-3 h-3 text-secondary" aria-hidden="true" />}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-surface/20 rounded-4xl border border-dashed border-white/10">
                        <Heart className="w-12 h-12 text-white/10 mx-auto mb-4" aria-hidden="true" />
                        <p className="text-white/40 max-w-xs mx-auto">Aún no hay susurros públicos. ¡Sé la primera en compartir tu experiencia!</p>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-background/90 backdrop-blur-md"
                            onClick={() => setShowForm(false)}
                            aria-hidden="true"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="form-title"
                            className="relative w-full max-w-xl bg-surface border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-secondary" aria-hidden="true" />

                            <div className="p-8 md:p-12">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 id="form-title" className="text-2xl font-bold text-white mb-2 font-display">Deja tu <span className="text-primary italic">Susurro</span></h3>
                                        <p className="text-white/60 text-sm">Comparte tu luz con otros buscadores.</p>
                                    </div>
                                    <button
                                        onClick={() => setShowForm(false)}
                                        aria-label="Cerrar formulario"
                                        className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-all"
                                    >
                                        <X className="w-6 h-6" aria-hidden="true" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label htmlFor="user_name" className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-4">Tu Nombre</label>
                                        <input
                                            id="user_name"
                                            name="user_name"
                                            required
                                            type="text"
                                            value={formData.user_name}
                                            onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                                            placeholder="¿Cómo te llamas?"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-hidden focus:border-primary/50 transition-all font-body"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-4">Valoración</label>
                                        <div className="flex gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 justify-center" aria-label="Selecciona tu valoración">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, rating: star })}
                                                    aria-label={`Calificar con ${star} estrellas`}
                                                    className="group transition-all hover:scale-125"
                                                >
                                                    <Star
                                                        className={`w-8 h-8 transition-colors ${star <= formData.rating
                                                            ? 'text-secondary fill-secondary drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]'
                                                            : 'text-white/10 group-hover:text-white/30'
                                                            }`}
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="content" className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-4">Tu Experiencia</label>
                                        <textarea
                                            id="content"
                                            name="content"
                                            required
                                            rows={4}
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            placeholder="Cuéntanos cómo fue tu sesión o qué sentiste con tus productos..."
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-hidden focus:border-primary/50 transition-all resize-none font-body"
                                        />
                                    </div>

                                    <button
                                        disabled={submitting}
                                        type="submit"
                                        aria-label="Enviar testimonio"
                                        className="w-full py-5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
                                    >
                                        {submitting ? (
                                            <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
                                        ) : (
                                            <>
                                                <span>Enviar Susurro</span>
                                                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" aria-hidden="true" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    )
}
