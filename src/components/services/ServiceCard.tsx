'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, Plus } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { BookingModal } from './BookingModal'
import { SERVICE_VARIANTS } from '@/data/serviceVariants'

interface ServiceCardProps {
    id: string
    title: string
    description: string
    price: number
    duration: string
    image: string
    icon: React.ReactNode
    isPopular?: boolean
}

export function ServiceCard({ id, title, description, price, duration, image, icon, isPopular = false }: ServiceCardProps) {
    const [isBookingOpen, setIsBookingOpen] = useState(false)
    const { addItem, items } = useCart()
    const [isAdded, setIsAdded] = useState(false)

    // Check if item is already in cart
    const existingItem = items.find(i => i.productId === id)
    const isInCart = !!existingItem

    const handleBookingConfirm = (date: string, time: string) => {
        addItem({
            id: `service-${id}`,
            productId: id,
            name: title,
            type: 'service',
            price: price,
            quantity: 1,
            imageUrl: image,
            bookingData: { startTime: `${date} ${time}` }
        })

        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 2000)
    }

    const hasVariants = !!SERVICE_VARIANTS[title];
    const variants = SERVICE_VARIANTS[title];
    const displayPrice = hasVariants && variants.length > 0
        ? Math.min(...variants.map(v => v.price))
        : price;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -12 }}
                className="group bg-surface border border-white/5 hover:border-primary/40 rounded-3xl overflow-hidden transition-all duration-500 shadow-xl"
            >
                <div className="flex flex-col h-full">
                    {/* Image Section - Clickable */}
                    <Link href={`/servicios/${id}`} className="block relative h-64 overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent z-10"></div>
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-2000"
                        />
                        {isPopular && <div className="absolute top-4 right-4 z-20 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Popular</div>}
                    </Link>

                    {/* Content Section */}
                    <div className="p-8 flex flex-col grow">
                        <Link href={`/servicios/${id}`} className="block">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-[0_0_20px_rgba(244,114,182,0.15)] border border-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                {icon}
                            </div>
                            <h4 className="text-2xl font-bold text-white mb-4 font-display leading-tight group-hover:text-primary transition-colors">{title}</h4>
                            <p className="text-white/50 text-sm font-body mb-8 leading-relaxed h-20 overflow-hidden line-clamp-3">
                                {description}
                            </p>
                        </Link>

                        <div className="mt-auto flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-white font-display">
                                    {hasVariants ? `Desde $${displayPrice.toLocaleString('es-AR')}` : `$${displayPrice.toLocaleString('es-AR')}`}
                                </span>
                                <span className="text-xs text-secondary font-bold font-body uppercase tracking-wider">{duration}</span>
                            </div>

                            {isInCart && !hasVariants ? (
                                <button disabled className="w-full bg-green-500/20 text-green-400 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 cursor-default border border-green-500/50">
                                    <ShoppingBag className="w-5 h-5" />
                                    En tu Carrito
                                </button>
                            ) : hasVariants ? (
                                <Link
                                    href={`/servicios/${id}`}
                                    className="w-full bg-primary hover:bg-[#fa9acb] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 shadow-primary/20"
                                >
                                    <Plus className="w-5 h-5" />
                                    Ver Opciones
                                </Link>
                            ) : (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        setIsBookingOpen(true)
                                    }}
                                    disabled={isAdded}
                                    className={`w-full font-bold py-3 px-6 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${isAdded
                                        ? 'bg-green-500 text-white shadow-green-500/20'
                                        : 'bg-primary hover:bg-[#fa9acb] text-white shadow-primary/20'
                                        }`}
                                >
                                    {isAdded ? (
                                        <>
                                            <ShoppingBag className="w-5 h-5" />
                                            ¡Agregado!
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            Reservar Ahora
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                onConfirm={handleBookingConfirm}
                serviceName={title}
            />
        </>
    )
}
