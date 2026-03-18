'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Star, Pause, Play, Plus } from 'lucide-react'
import { AddToCartButton } from '@/components/cart/CartComponents'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/lib/supabase/database.types'
import { ProductQuickView } from '@/components/products/ProductQuickView'

export function NewsCarousel() {
    const [products, setProducts] = useState<Product[]>([])
    const [activeIndex, setActiveIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const fetchProducts = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('products')
                .select('*')

                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(4)

            if (data) setProducts(data)
        }
        fetchProducts()
    }, [])

    useEffect(() => {
        // Pause if hovered OR modal is open
        const shouldPause = isPaused || isModalOpen

        if (!shouldPause && products.length > 0) {
            intervalRef.current = setInterval(() => {
                setActiveIndex((prev) => (prev + 1) % products.length)
            }, 5000)
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [isPaused, isModalOpen, products.length])

    if (products.length === 0) return null

    const product = products[activeIndex]
    const hasVariants = product.variants && Array.isArray(product.variants) && product.variants.length > 0;

    return (
        <section className="py-24 bg-surface-accent relative overflow-hidden group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex items-center gap-3 mb-10">
                    <Star className="text-secondary w-5 h-5 animate-pulse" />
                    <h3 className="text-secondary text-xs font-black uppercase tracking-[0.3em] glow-text">Novedades Místicas</h3>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    {/* Left: Content & Controls */}
                    <div className="lg:w-1/2 space-y-8 z-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="flex gap-2 mb-4">
                                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] items-center uppercase tracking-wider text-white/70">
                                        NUEVO
                                    </span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-display leading-tight">
                                    {product.name}
                                </h2>
                                <p className="text-white/70 text-lg mb-8 max-w-md line-clamp-3">
                                    {product.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-6">
                                    <span className="text-3xl font-bold text-primary font-display">${product.price.toLocaleString('es-AR')}</span>
                                    <div className="w-px h-10 bg-white/10 hidden sm:block" />

                                    {/* Variant Logic Switch */}
                                    {hasVariants ? (
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            aria-label={`Ver opciones y variantes para ${product.name}`}
                                            className="bg-primary hover:bg-[#fa9acb] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 shadow-primary/20"
                                        >
                                            <Plus className="w-5 h-5" aria-hidden="true" />
                                            Ver Opciones
                                        </button>
                                    ) : (
                                        <AddToCartButton type="physical" product={product} />
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Progress Bar & Controls */}
                        <div className="flex items-center gap-4 pt-8">
                            {products.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveIndex(idx)}
                                    aria-label={`Ver producto ${idx + 1}`}
                                    className={`h-1 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-12 bg-primary' : 'w-4 bg-white/10 hover:bg-white/30'}`}
                                />
                            ))}
                            <button
                                onClick={() => setIsPaused(!isPaused)}
                                aria-label={isPaused ? "Reanudar carrusel" : "Pausar carrusel"}
                                className="ml-4 text-white/30 hover:text-white transition-colors"
                            >
                                {isPaused ? <Play className="w-4 h-4" aria-hidden="true" /> : <Pause className="w-4 h-4" aria-hidden="true" />}
                            </button>
                        </div>
                    </div>

                    {/* Right: Image Display */}
                    <div className="lg:w-1/2 relative w-full aspect-square md:aspect-video lg:aspect-square max-h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 1.05, rotate: 2 }}
                                transition={{ duration: 0.6, ease: "circOut" }}
                                className="absolute inset-0"
                            >
                                <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl group-hover:shadow-[0_0_40px_rgba(244,114,182,0.15)] transition-all duration-500">
                                    <div className="absolute inset-0 bg-linear-to-tr from-black/60 via-transparent to-transparent z-10" />
                                    {product.image_url ? (
                                        <Image
                                            src={product.image_url}
                                            alt={product.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-surface-accent flex items-center justify-center text-white/20">Sin Imagen</div>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Floating Badge */}
                        <div className="absolute -bottom-6 -right-6 z-20 bg-background border border-white/10 p-6 rounded-3xl shadow-xl hidden md:block">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-500/20 p-2 rounded-full">
                                    <ShoppingBag className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-white text-xs font-bold uppercase tracking-wider">En Stock</p>
                                    <p className="text-white/40 text-[10px]">Envío inmediato</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick View Modal */}
            <ProductQuickView
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={product}
            />
        </section>
    )
}
