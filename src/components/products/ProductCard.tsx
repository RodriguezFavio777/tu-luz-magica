'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { AddToCartButton } from '@/components/cart/CartComponents'
import { ProductQuickView } from './ProductQuickView'
import { Product } from '@/lib/supabase/database.types'

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Check if product has variants
    const hasVariants = product.variants && Array.isArray(product.variants) && product.variants.length > 0

    // Image logic
    const images = product.images && product.images.length > 0 ? product.images : (product.image_url ? [product.image_url] : [])
    const displayImage = images.length > 0 ? images[0] : null

    const handleQuickView = (e: React.MouseEvent) => {
        e.preventDefault() // Prevent link navigation
        e.stopPropagation()
        setIsModalOpen(true)
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                <Link
                    href={`/productos/${product.id}`}
                    className="group bg-[#1d1520] border border-white/5 rounded-3xl overflow-hidden hover:border-primary/40 transition-all duration-500 flex flex-col cursor-pointer relative"
                >
                    <div className="aspect-square relative overflow-hidden">
                        {displayImage ? (
                            <Image
                                src={displayImage}
                                alt={product.name}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover group-hover:scale-110 transition-transform duration-2000"
                            />
                        ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20 italic">
                                Sin Imagen
                            </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-[#1d1520] via-transparent to-transparent opacity-60" />

                        {/* Badge */}
                        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/70 border border-white/5">
                            Objeto
                        </div>
                    </div>

                    <div className="p-6 flex flex-col grow">
                        <h3 className="text-lg font-bold text-white mb-6 font-display min-h-12 line-clamp-2 group-hover:text-primary transition-colors">
                            {product.name}
                        </h3>

                        <div className="space-y-4 mt-auto">
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-white">${product.price.toLocaleString('es-AR')}</span>
                                <span className="text-[10px] text-white/30 uppercase tracking-widest">Valor sin impuestos</span>
                            </div>

                            {/* Button Logic */}
                            {hasVariants ? (
                                <button
                                    onClick={handleQuickView}
                                    className="w-full bg-primary hover:bg-[#fa9acb] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 shadow-primary/20 z-10 relative"
                                >
                                    <Plus className="w-5 h-5" />
                                    Ver Opciones
                                </button>
                            ) : (
                                <div className="relative z-10" onClick={(e) => e.stopPropagation()}>
                                    <AddToCartButton type="physical" product={product} />
                                </div>
                            )}
                        </div>
                    </div>
                </Link>
            </motion.div>

            {/* Modal */}
            <ProductQuickView
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={product}
            />
        </>
    )
}
