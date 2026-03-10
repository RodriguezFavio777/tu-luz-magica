'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { getReviews, toggleReviewApproval, deleteReview } from '@/lib/actions/reviews'
import {
    CheckCircle, XCircle, Trash2, Star,
    MessageSquare, Clock
} from 'lucide-react'
import { useToast } from '@/context/ToastContext'

interface Review {
    id: string
    user_name: string
    user_email: string
    content: string
    rating: number
    is_approved: boolean
    created_at: string
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
    const { showToast } = useToast()

    const fetchReviews = useCallback(async () => {
        setLoading(true)
        const data = await getReviews(true) // Get all for admin
        setReviews(data as Review[])
        setLoading(false)
    }, [])

    useEffect(() => {
        Promise.resolve().then(() => { fetchReviews() })
    }, [fetchReviews])

    const handleToggleApproval = async (id: string, currentStatus: boolean) => {
        const result = await toggleReviewApproval(id, currentStatus)
        if (result.success) {
            showToast(`Reseña ${currentStatus ? 'desactivada' : 'aprobada'} correclamente`, 'success')
            fetchReviews()
        } else {
            showToast('Error: ' + result.error, 'error')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta reseña?')) return

        const result = await deleteReview(id)
        if (result.success) {
            showToast('Reseña eliminada', 'success')
            fetchReviews()
        } else {
            showToast('Error: ' + result.error, 'error')
        }
    }

    const filteredReviews = reviews.filter(r => {
        if (filter === 'pending') return !r.is_approved
        if (filter === 'approved') return r.is_approved
        return true
    })

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white font-display mb-2">Gestión de <span className="text-primary italic">Reseñas</span></h1>
                    <p className="text-white/40">Moderación de testimonios &quot;Susurros de Luz&quot;.</p>
                </div>

                <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-white/5">
                    {(['all', 'pending', 'approved'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === f
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-white/40 hover:text-white'
                                }`}
                        >
                            {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Aprobadas'}
                        </button>
                    ))}
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-white/20 uppercase tracking-widest text-xs">Cargando testimonios...</p>
                </div>
            ) : filteredReviews.length > 0 ? (
                <div className="grid gap-4">
                    {filteredReviews.map((review) => (
                        <div
                            key={review.id}
                            className={`p-6 rounded-2xl bg-surface border transition-all ${review.is_approved ? 'border-white/5' : 'border-primary/30 bg-primary/5'
                                }`}
                        >
                            <div className="flex flex-col md:flex-row gap-6 justify-between">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary font-bold">
                                            {review.user_name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold">{review.user_name}</h4>
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-secondary fill-secondary' : 'text-white/10'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        {!review.is_approved && (
                                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider animate-pulse">Pendiente</span>
                                        )}
                                    </div>

                                    <p className="text-white/70 italic leading-relaxed">
                                        &quot;{review.content}&quot;
                                    </p>

                                    <div className="flex items-center gap-4 text-[10px] text-white/30 uppercase tracking-widest">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(review.created_at).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Testimonio</span>
                                    </div>
                                </div>

                                <div className="flex md:flex-col gap-2 justify-end">
                                    <button
                                        onClick={() => handleToggleApproval(review.id, review.is_approved)}
                                        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all ${review.is_approved
                                            ? 'bg-white/5 text-white/60 hover:bg-white/10'
                                            : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105'
                                            }`}
                                    >
                                        {review.is_approved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                        {review.is_approved ? 'Desactivar' : 'Aprobar'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-surface/20 rounded-3xl border border-dashed border-white/5">
                    <MessageSquare className="w-12 h-12 text-white/5 mx-auto mb-4" />
                    <p className="text-white/20">No se encontraron reseñas con este filtro.</p>
                </div>
            )}
        </div>
    )
}
