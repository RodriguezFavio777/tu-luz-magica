'use client'

import React, { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, X, ChevronDown, SortAsc, Leaf } from 'lucide-react'
import { useLoadingStore } from '@/store/useLoadingStore'

// Define the Category interface
interface Category {
    id: string
    name: string
    slug: string
}

interface ProductFilterSidebarProps {
    categories: Category[]
}

export function ProductFilterSidebar({ categories }: ProductFilterSidebarProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { setIsFiltering } = useLoadingStore()

    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const currentCategory = searchParams.get('category')
    const currentPrice = searchParams.get('sort')
    const hasActiveFilters = currentCategory || currentPrice

    // Update params
    const updateFilter = (key: string, value: string | null) => {
        setIsFiltering(true); // Immediate visual feedback
        const params = new URLSearchParams(searchParams.toString())
        if (value) params.set(key, value)
        else params.delete(key)
        params.delete('page')
        router.push(`/productos?${params.toString()}`)
        setIsMobileOpen(false) // Close on selection
    }



    // CUSTOM GROUPING LOGIC
    const productTree = useMemo(() => {
        return [...categories].sort((a, b) => a.name.localeCompare(b.name));
    }, [categories]);

    return (
        <aside className="w-full md:w-72">
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden w-full flex items-center justify-between p-4 bg-surface border border-white/10 rounded-xl mb-6"
            >
                <div className="flex items-center gap-2 text-primary">
                    <Filter className="w-4 h-4" />
                    <span className="font-bold uppercase tracking-widest text-xs">Filtros & Categorías</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${isMobileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Content Container */}
            <div className={`${isMobileOpen ? 'block' : 'hidden'} md:block space-y-8`}>
                {/* Header */}
                <div className="hidden md:flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary">
                        <Filter className="w-5 h-5" />
                        <h3 className="text-lg font-display font-bold text-primary">Filtros</h3>
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={() => router.push('/productos')}
                            className="text-xs text-white/40 hover:text-red-400 flex items-center gap-1 transition-colors"
                        >
                            <X className="w-3 h-3" />
                            Limpiar
                        </button>
                    )}
                </div>

                {/* Price Sort */}
                <div className="relative group z-10">
                    <select
                        value={currentPrice || ''}
                        onChange={(e) => updateFilter('sort', e.target.value)}
                        className="w-full relative bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-primary/50 appearance-none cursor-pointer hover:border-white/30 transition-colors"
                    >
                        <option value="">✨ Orden Mágico</option>
                        <option value="price_asc">💰 Menor Precio</option>
                        <option value="price_desc">💎 Mayor Precio</option>
                    </select>
                    <SortAsc className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 w-4 h-4" />
                </div>

                <div className="h-px bg-white/5 w-full" />

                {/* --- SECCION PRODUCTOS --- */}
                <div>
                    <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4 pl-2">Galería Mística</h4>
                    <div className="space-y-1">
                        {productTree.map((cat) => {
                            const isActive = currentCategory === cat.slug;

                            return (
                                <div key={cat.id} className="rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => updateFilter('category', isActive ? null : cat.slug)}
                                        className={`w-full flex items-center justify-between p-2 px-3 text-left transition-colors rounded-lg group ${isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <span className="text-sm font-medium capitalize text-balance">
                                            {cat.name}
                                        </span>
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="h-px bg-white/5 w-full" />

                {/* Decorative Element */}
                <div className="p-6 rounded-2xl bg-linear-to-br from-primary/5 to-secondary/5 border border-white/5 text-center mt-auto">
                    <Leaf className="w-6 h-6 text-primary mx-auto mb-3 opacity-50" />
                    <p className="text-[10px] text-white/40 italic font-body max-w-[20ch] mx-auto leading-relaxed">
                        &quot;Cada objeto ha sido consagrado para elevar tu vibración.&quot;
                    </p>
                </div>
            </div>
        </aside>
    )
}
