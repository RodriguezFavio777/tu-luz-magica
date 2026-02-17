'use client'

import React, { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, ChevronDown, Check, Sparkles, SortAsc, Leaf } from 'lucide-react'

// Define the Category interface
interface Category {
    id: string
    name: string
    slug: string
    parent_id?: string | null
}

interface ProductFilterSidebarProps {
    categories: Category[]
}

export function ProductFilterSidebar({ categories }: ProductFilterSidebarProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
    const [isMobileOpen, setIsMobileOpen] = useState(false) // New Mobile State

    const toggleSection = (id: string, slug?: string) => {
        setOpenSections(prev => {
            const newState = { ...prev, [id]: !prev[id] };
            if (slug) {
                // updateFilter('category', slug)
            }
            return newState;
        })
    }

    const currentCategory = searchParams.get('category')
    const currentPrice = searchParams.get('sort')
    const hasActiveFilters = currentCategory || currentPrice

    // Update params
    const updateFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) params.set(key, value)
        else params.delete(key)
        params.delete('page')
        router.push(`/productos?${params.toString()}`)
        setIsMobileOpen(false) // Close on selection
    }

    // Auto-open active
    React.useEffect(() => {
        if (currentCategory) {
            const activeCat = categories.find(c => c.slug === currentCategory)
            if (activeCat?.parent_id) {
                setOpenSections(prev => ({ ...prev, [activeCat.parent_id!]: true }))
            } else if (activeCat) {
                setOpenSections(prev => ({ ...prev, [activeCat.id]: true }))
            }
        }
    }, [currentCategory, categories])

    // CUSTOM GROUPING LOGIC (Simplified: All passed categories are Physical by definition of page query)
    const groupedGroups = useMemo(() => {
        // Root Categories
        const roots = categories.filter(c => !c.parent_id);

        // Build Tree
        const productTree = roots.map(parent => ({
            ...parent,
            children: categories.filter(c => c.parent_id === parent.id)
        })).sort((a, b) => a.name.localeCompare(b.name));

        return { productTree, serviceCats: [] }; // No separate service cats
    }, [categories]);

    return (
        <aside className="w-full md:w-72">
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden w-full flex items-center justify-between p-4 bg-[#1d1520] border border-white/10 rounded-xl mb-6"
            >
                <div className="flex items-center gap-2 text-primary">
                    <Filter className="w-4 h-4" />
                    <span className="font-bold uppercase tracking-widest text-xs">Filtros & Categorías</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${isMobileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Content Container (Hidden on mobile unless open) */}
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
                        className="w-full relative bg-[#1d1520] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-primary/50 appearance-none cursor-pointer hover:border-white/30 transition-colors"
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
                        {groupedGroups.productTree.map((parent) => {
                            const isOpen = openSections[parent.id];
                            const isActive = currentCategory === parent.slug;

                            return (
                                <div key={parent.id} className="rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => {
                                            if (parent.children.length > 0) toggleSection(parent.id);
                                            else updateFilter('category', isActive ? null : parent.slug);
                                        }}
                                        className={`w-full flex items-center justify-between p-2 px-3 text-left transition-colors rounded-lg group ${isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <span className="text-sm font-medium capitalize text-balance">
                                            {parent.name}
                                        </span>
                                        {parent.children.length > 0 && (
                                            <ChevronDown className={`w-3 h-3 text-white/30 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {isOpen && parent.children.length > 0 && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="overflow-hidden ml-2 border-l border-white/5"
                                            >
                                                {parent.children.map(child => (
                                                    <button
                                                        key={child.id}
                                                        onClick={() => updateFilter('category', child.slug)}
                                                        className={`block w-full text-left py-2 px-3 text-xs capitalize transition-colors ${currentCategory === child.slug ? 'text-primary font-bold' : 'text-white/50 hover:text-white'
                                                            }`}
                                                    >
                                                        {child.name.toLowerCase()}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="h-px bg-white/5 w-full" />

                {/* --- SECCION FILTROS EXTRAS (Opcional) --- */}
                {/* Removed logic that forced services separation */}
                {/* Removed logic that forced services separation */}

                {/* Decorative Element */}
                <div className="p-6 rounded-2xl bg-linear-to-br from-primary/5 to-secondary/5 border border-white/5 text-center mt-auto">
                    <Leaf className="w-6 h-6 text-primary mx-auto mb-3 opacity-50" />
                    <p className="text-[10px] text-white/40 italic font-body max-w-[20ch] mx-auto leading-relaxed">
                        "Cada objeto ha sido consagrado para elevar tu vibración."
                    </p>
                </div>
            </div>
        </aside >
    )
}
