'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { VariantSelector } from './VariantSelector'
import { AddToCartButton } from '@/components/cart/CartComponents'
import { Product } from '@/lib/supabase/database.types'

interface ProductQuickViewProps {
    isOpen: boolean
    onClose: () => void
    product: Product | null
}

export function ProductQuickView({ isOpen, onClose, product }: ProductQuickViewProps) {
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen)
        if (isOpen) {
            setSelectedVariant(null)
            setCurrentImageIndex(0)
        }
    }

    if (!product || !mounted) return null

    // Combine main image + additional images
    const images = [
        product.image_url,
        ...(product.images || [])
    ].filter(Boolean) as string[]

    const displayImages = images.length > 0 ? images : ['/placeholder.jpg']

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation()
        setCurrentImageIndex((prev) => (prev + 1) % displayImages.length)
    }

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation()
        setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)
    }

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" style={{ pointerEvents: 'auto' }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl bg-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/40 hover:bg-white/10 text-white transition-colors backdrop-blur-sm"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Image Section */}
                        <div className="md:w-3/5 relative bg-[#151018] group">
                            <div className="relative w-full h-[300px] md:h-full">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentImageIndex}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute inset-0"
                                    >
                                        <Image
                                            src={displayImages[currentImageIndex]}
                                            alt={product.name}
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    </motion.div>
                                </AnimatePresence>

                                {/* Image Navigation Arrows */}
                                {displayImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>

                                        {/* Dots */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                            {displayImages.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                                    className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-primary w-6' : 'bg-white/50 hover:bg-white'}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="md:w-2/5 p-8 md:p-10 overflow-y-auto flex flex-col bg-surface">
                            {/* Category Badge */}
                            <div className="inline-flex mb-4">
                                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-secondary">
                                    Colección Mística
                                </span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display leading-tight">{product.name}</h2>

                            <div className="flex items-baseline gap-4 mb-6">
                                <span className="text-4xl font-bold text-white font-display">
                                    ${product.price.toLocaleString('es-AR')}
                                </span>
                                {product.stock && product.stock > 0 && (
                                    <span className="text-green-400 text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                        Disponible
                                    </span>
                                )}
                            </div>

                            <p className="text-white/60 text-base mb-8 leading-relaxed">
                                {product.description}
                            </p>

                            <div className="mt-auto space-y-8">
                                {/* Variants */}
                                {product.variants && Array.isArray(product.variants) && product.variants.length > 0 && (
                                    <div>
                                        <VariantSelector
                                            variants={product.variants}
                                            selected={selectedVariant}
                                            onSelect={setSelectedVariant}
                                        />
                                        {!selectedVariant && (
                                            <p className="text-amber-400 text-xs mt-2 font-medium animate-pulse">
                                                * Por favor selecciona una opción
                                            </p>
                                        )}
                                    </div>
                                )}

                                <AddToCartButton
                                    type="physical"
                                    product={{
                                        ...product,
                                        image_url: displayImages[0],
                                        variant: selectedVariant
                                    }}
                                    disabled={Boolean(product.variants && Array.isArray(product.variants) && product.variants.length > 0 && !selectedVariant)}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )

    return createPortal(modalContent, document.body)
}
