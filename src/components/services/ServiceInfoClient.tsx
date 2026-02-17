'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Check, Clock, Calendar, Star, ShieldCheck, Zap } from 'lucide-react';
import { BookingModal } from '@/components/services/BookingModal';
import { useCart } from '@/hooks/useCart';
import { SERVICE_DETAILS, ServiceDetail } from '@/data/serviceVariants';
import * as motion from 'framer-motion/client';

interface ServiceInfoClientProps {
    service: any;
    details: ServiceDetail | undefined;
}

export default function ServiceInfoClient({ service, details }: ServiceInfoClientProps) {
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const { addItem } = useCart();

    // Initialize variant from SERVICE_DETAILS or fallback to legacy service.variants if needed
    const variants = details?.variants || [];

    const [selectedVariant, setSelectedVariant] = useState(variants.length > 0 ? variants[0] : null);

    const currentPrice = selectedVariant ? selectedVariant.price : service.price;
    const currentDuration = selectedVariant ? selectedVariant.duration : (details?.preparationTime || 'Consultar');

    // Determine if time selection is needed based on category (Rituals = Date only, Readings = Date & Time)
    const categoryName = service.category?.name?.toLowerCase() || '';
    const isRitual = categoryName.includes('ritual') || categoryName.includes('limpieza');
    const enableTimeSelection = !isRitual;

    const handleBookingConfirm = (date: string, time: string) => {
        const variantName = selectedVariant ? selectedVariant.name : undefined;

        addItem({
            id: `service-${service.id}${selectedVariant ? `-${selectedVariant.id}` : ''}`,
            productId: service.id,
            name: `${service.name} ${variantName ? `(${variantName})` : ''}`,
            type: 'service',
            price: currentPrice,
            quantity: 1,
            imageUrl: service.image_url,
            variantName: variantName,
            bookingData: { startTime: `${date} ${time}` }
        });
        setIsBookingOpen(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">

            {/* Sticky Header: Price & Duration */}
            <div className="sticky top-[74px] z-30 bg-[#120d14]/95 backdrop-blur-xl py-4 border-b border-white/5 rounded-b-2xl -mx-4 px-4 shadow-2xl transition-all duration-300">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface p-4 rounded-xl border border-white/5 shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-2 mb-1 text-primary">
                            <Zap className="w-3 h-3" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Inversión</span>
                        </div>
                        <span className="text-2xl lg:text-3xl font-bold text-white font-display block">
                            ${currentPrice.toLocaleString('es-AR')}
                        </span>
                    </div>

                    <div className="bg-surface p-4 rounded-xl border border-white/5 shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-linear-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-2 mb-1 text-secondary">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">{variants.length > 0 ? 'Duración' : 'Preparación'}</span>
                        </div>
                        <span className="text-lg lg:text-xl font-bold text-white block mt-1">
                            {currentDuration}
                        </span>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="space-y-8 px-2">
                {/* Variant Selector */}
                {variants.length > 0 && (
                    <div className="bg-surface border border-white/10 rounded-2xl p-6">
                        <label className="text-white/50 text-xs uppercase font-bold tracking-wider mb-4 flex items-center gap-2">
                            <Star className="w-3 h-3 text-primary" />
                            Selecciona tu Experiencia
                        </label>
                        <div className="grid gap-3">
                            {variants.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVariant(v)}
                                    className={`relative text-left p-4 rounded-xl border transition-all duration-300 group ${selectedVariant?.id === v.id
                                        ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(244,114,182,0.15)]'
                                        : 'bg-black/20 border-white/5 hover:border-white/20 hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`font-bold transition-colors ${selectedVariant?.id === v.id ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                                            {v.name}
                                        </span>
                                        {selectedVariant?.id === v.id && <Check className="w-5 h-5 text-primary drop-shadow-[0_0_5px_rgba(244,114,182,0.8)]" />}
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-white/40 font-medium">{v.duration}</span>
                                        <span className={`font-bold ${selectedVariant?.id === v.id ? 'text-primary' : 'text-white/50'}`}>
                                            ${v.price.toLocaleString('es-AR')}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Includes Section */}
                {details?.features && (
                    <div className="bg-surface border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3 font-display">
                            <SparklesIcon />
                            ¿Qué incluye este servicio?
                        </h3>
                        <ul className="grid gap-4">
                            {details.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-3 text-white/70 text-sm leading-relaxed">
                                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_#f472b6]" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Conditions Section */}
                {details?.conditions && (
                    <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-red-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Condiciones Importantes
                        </h3>
                        <p className="text-white/60 text-sm leading-relaxed italic">
                            "{details.conditions}"
                        </p>
                        {details.modality?.includes('Online') && (
                            <div className="mt-4 flex items-center gap-2 text-xs text-white/40 bg-white/5 p-3 rounded-lg">
                                <Calendar className="w-4 h-4" />
                                <span>Servicio vinculado a Google Calendar. Recibirás invitación.</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Final Booking Button (Static) */}
                <div className="pt-8 pb-4">
                    <button
                        onClick={() => setIsBookingOpen(true)}
                        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-5 rounded-2xl transition-all shadow-[0_10px_40px_-10px_rgba(244,114,182,0.4)] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 border-t border-white/20 group"
                    >
                        <ShoppingBag className="w-6 h-6 group-hover:animate-bounce" />
                        <span className="text-xl">Reservar Ahora</span>
                    </button>
                    <p className="text-center text-[10px] text-white/30 mt-3 uppercase tracking-widest">
                        Pago 100% Seguro y Encriptado
                    </p>
                </div>
            </div>

            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                onConfirm={handleBookingConfirm}
                serviceName={selectedVariant ? `${service.name} - ${selectedVariant.name}` : service.name}
                enableTimeSelection={enableTimeSelection}
            />
        </div>
    );
}

function SparklesIcon() {
    return (
        <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L14.39 9.61L22 12L14.39 14.39L12 22L9.61 14.39L2 12L9.61 9.61L12 2Z" fill="currentColor" />
        </svg>
    )
}
