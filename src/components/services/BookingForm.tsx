'use client'

import React, { useState } from 'react'
import { AddToCartButton } from '@/components/cart/CartComponents'
import { Calendar, Clock, Flame } from 'lucide-react'

interface BookingFormProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    product: any
}

export function BookingForm({ product }: BookingFormProps) {
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')

    // Ritual Specific Logic
    const isRitual = product.service_categories?.name?.toLowerCase().includes('ritual') || product.name.toLowerCase().includes('ritual')
    const [velacionDays, setVelacionDays] = useState(1)

    // Price Logic (Hardcoded for specific requirement: 1 day = base, 14 days = 1,000,000 or 4x base?)
    // User requested: 1 day = 250.000 (example base), 14 days = 1.000.000.
    // We will assume base price is for 1 day.
    const basePrice = product.price
    const finalPrice = isRitual && velacionDays === 14 ? 1000000 : basePrice

    const isComplete = date && time

    // Simulate booking data
    const bookingData = isComplete ? {
        date,
        time,
        startTime: `${date} ${time}`
    } : undefined

    // Create a modified product object for the cart if a variant is selected
    const cartProduct = {
        ...product,
        price: finalPrice,
        name: isRitual ? `${product.name} (${velacionDays} días de Velación)` : product.name
    }

    return (
        <div className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Agenda tu Sesión</h3>
                {isRitual && (
                    <div className="text-right">
                        <span className="block text-[10px] text-white/40 uppercase tracking-widest">Precio Final</span>
                        <span className="text-xl font-bold text-primary">${finalPrice.toLocaleString('es-AR')}</span>
                    </div>
                )}
            </div>

            {/* Ritual Duration Selector */}
            {isRitual && (
                <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 space-y-3">
                    <label className="text-xs uppercase font-bold text-primary flex items-center gap-2">
                        <Flame className="w-3 h-3" />
                        Intensidad de la Velación
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setVelacionDays(1)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${velacionDays === 1
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'
                                }`}
                        >
                            1 Día (Estándar)
                            <span className="block text-[10px] opacity-60 mt-0.5">${basePrice.toLocaleString()}</span>
                        </button>
                        <button
                            onClick={() => setVelacionDays(14)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${velacionDays === 14
                                ? 'bg-secondary text-black border-secondary shadow-lg shadow-secondary/20'
                                : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'
                                }`}
                        >
                            14 Días (Profundo)
                            <span className="block text-[10px] opacity-60 mt-0.5">$1.000.000</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-white/60 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Fecha Preferida
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 transition-colors"
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-white/60 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Hora Preferida
                    </label>
                    <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 transition-colors appearance-none"
                    >
                        <option value="">Seleccionar Hora</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="15:00">03:00 PM</option>
                        <option value="16:00">04:00 PM</option>
                        <option value="17:00">05:00 PM</option>
                        <option value="18:00">06:00 PM</option>
                        <option value="19:00">07:00 PM</option>
                    </select>
                </div>
            </div>

            <div className="pt-4">
                {isComplete ? (
                    <AddToCartButton
                        type="service"
                        product={cartProduct}
                        bookingData={bookingData}
                    />
                ) : (
                    <button disabled className="w-full bg-white/5 text-white/30 font-bold py-3 px-6 rounded-xl cursor-not-allowed">
                        Completar Datos
                    </button>
                )}
                <p className="text-center text-[10px] text-white/40 mt-3">
                    La reserva se confirmará una vez realizado el pago.
                </p>
            </div>
        </div>
    )
}
