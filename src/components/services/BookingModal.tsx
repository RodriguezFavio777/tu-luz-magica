'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, Check } from 'lucide-react'
import { ModernCalendar } from '@/components/ui/ModernCalendar'

interface BookingModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (date: string, time: string) => void
    serviceName: string
    enableTimeSelection?: boolean
}

export function BookingModal({ isOpen, onClose, onConfirm, serviceName, enableTimeSelection = true }: BookingModalProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [time, setTime] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const textTime = enableTimeSelection ? time : "Todo el día";

        if (selectedDate && (textTime)) {
            // Formateamos mes/dia
            const isoDate = selectedDate.toISOString().split('T')[0]
            onConfirm(isoDate, textTime)
            onClose()
        }
    }

    const timeSlots = [
        "09:00 AM", "10:30 AM", "01:00 PM", "03:30 PM", "05:00 PM", "06:30 PM"
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-4xl bg-surface border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors z-10 bg-black/20 p-2 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-8 flex items-center gap-4">
                            <div className="p-3 bg-primary/20 rounded-xl">
                                <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white font-display">Selecciona Fecha y Hora</h3>
                                <p className="text-primary text-sm font-bold uppercase tracking-widest">{serviceName}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-10 items-stretch">
                            {/* Left Side: Custom Calendar */}
                            <div className="flex-1">
                                <ModernCalendar
                                    selectedDate={selectedDate}
                                    onDateSelect={setSelectedDate}
                                />
                            </div>

                            {/* Right Side: Times */}
                            <div className="flex-1 flex flex-col justify-between">
                                {enableTimeSelection ? (
                                    <div className="space-y-6 flex-1">
                                        <label className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider font-display">
                                            <Clock className="w-4 h-4 text-primary" />
                                            HORARIOS DISPONIBLES
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {timeSlots.map((slot) => (
                                                <button
                                                    key={slot}
                                                    type="button"
                                                    onClick={() => setTime(slot)}
                                                    className={`py-4 px-6 rounded-full text-sm font-bold transition-all border ${time === slot
                                                        ? 'bg-primary text-white border-primary shadow-[0_0_20px_rgba(244,114,182,0.4)] scale-105'
                                                        : 'bg-black/20 text-white/70 border-white/10 hover:bg-white/5 hover:text-white'
                                                        }`}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-white/40 text-xs italic mt-6">
                                            Zona horaria: Buenos Aires (GMT-3)
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 flex flex-col justify-center items-center gap-4 h-full text-center">
                                        <Clock className="w-8 h-8 text-primary" />
                                        <h4 className="text-white font-bold text-lg">Servicio de Día Completo</h4>
                                        <p className="text-sm text-white/70 leading-relaxed max-w-xs">
                                            Este servicio (ritual/limpieza) requiere que se coordine por fuera una vez seleccionado el día, ya que consume energía a lo largo de varias horas. Me pondré en contacto contigo por WhatsApp.
                                        </p>
                                    </div>
                                )}

                                <div className="mt-8 pt-8 border-t border-white/10">
                                    <button
                                        type="submit"
                                        disabled={!selectedDate || (enableTimeSelection && !time)}
                                        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-5 rounded-full transition-all shadow-[0_10px_40px_-10px_rgba(244,114,182,0.4)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
                                    >
                                        <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        Confirmar Selección
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

