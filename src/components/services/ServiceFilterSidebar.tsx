'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Filter, X, Hexagon, Clock, Calendar, Star } from 'lucide-react'
import { useLoadingStore } from '@/store/useLoadingStore'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ServiceFilterSidebar({ categories }: { categories: any[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { setIsFiltering } = useLoadingStore()

    // Helper to update params
    const updateFilter = (key: string, value: string | null) => {
        setIsFiltering(true); // Immediate visual feedback
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`/servicios?${params.toString()}`)
    }

    const currentCategory = searchParams.get('category')
    const currentDuration = searchParams.get('duration')

    const hasActiveFilters = currentCategory || currentDuration

    return (
        <aside className="w-full md:w-72 space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                    <Filter className="w-5 h-5" />
                    <h3 className="text-lg font-display font-bold">Filtrar Experiencias</h3>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={() => router.push('/servicios')}
                        className="text-xs text-white/40 hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                        <X className="w-3 h-3" />
                        Limpiar
                    </button>
                )}
            </div>

            {/* Category Filter */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                    <Hexagon className="w-3 h-3" />
                    Tipo de Sesión
                </h4>
                <div className="flex flex-col gap-2">
                    <motion.button
                        onClick={() => updateFilter('category', null)}
                        whileHover={{ x: 4 }}
                        className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border w-full flex items-center justify-between ${!currentCategory
                            ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(244,114,182,0.3)]'
                            : 'bg-white/5 text-white/60 border-white/5 hover:border-white/20 hover:text-white'
                            }`}
                    >
                        <span>Todas las Sesiones</span>
                        {!currentCategory && <Star className="w-3 h-3 fill-current" />}
                    </motion.button>
                    {categories.map((cat) => (
                        <motion.button
                            key={cat.id}
                            onClick={() => updateFilter('category', cat.slug)}
                            whileHover={{ x: 4 }}
                            className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border w-full flex items-center justify-between ${currentCategory === cat.slug
                                ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(244,114,182,0.3)]'
                                : 'bg-white/5 text-white/60 border-white/5 hover:border-white/20 hover:text-white'
                                }`}
                        >
                            <span>{cat.name}</span>
                            {currentCategory === cat.slug && <Star className="w-3 h-3 fill-current" />}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Duration Filter */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Duración
                </h4>
                <div className="flex flex-wrap gap-2">
                    {['30', '45', '60', '90', '120'].map((mins) => {
                        const isActive = currentDuration === mins
                        return (
                            <motion.button
                                key={mins}
                                onClick={() => updateFilter('duration', isActive ? null : mins)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${isActive
                                    ? 'bg-secondary text-black border-secondary shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                                    : 'bg-white/5 text-white/60 border-white/5 hover:border-white/20 hover:text-white'
                                    }`}
                            >
                                {mins} Min
                            </motion.button>
                        )
                    })}
                </div>
            </div>

            {/* Availability Box */}
            <div className="p-6 rounded-2xl bg-surface border border-white/5 mt-8">
                <div className="flex items-center gap-3 mb-3 text-secondary">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Próxima Disponibilidad</span>
                </div>
                <p className="text-white text-sm font-body">
                    Agenda abierta para <span className="font-bold text-white underline decoration-primary decoration-2 underline-offset-2 capitalize">
                        {new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(new Date())}
                    </span>.
                </p>
                <div className="mt-3 flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">En línea ahora</span>
                </div>
            </div>
        </aside>
    )
}
