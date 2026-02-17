'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, Check } from 'lucide-react'

interface BookingModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (date: string, time: string) => void
    serviceName: string
    enableTimeSelection?: boolean
}

export function BookingModal({ isOpen, onClose, onConfirm, serviceName, enableTimeSelection = true }: BookingModalProps) {
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // If time selection is disabled, use a default time (e.g., "00:00") or handle as date-only
        const textTime = enableTimeSelection ? time : "Todo el día";

        if (date && (textTime)) {
            onConfirm(date, textTime)
            onClose()
        }
    }

    // Generate time slots (10:00 to 18:00)
    const timeSlots = [
        "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
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
                        className="relative w-full max-w-md bg-surface border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-1">Agendar Sesión</h3>
                            <p className="text-primary text-sm font-bold">{serviceName}</p>
                        </div>


                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-white/60 uppercase tracking-wider">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    Fecha de Inicio
                                </label>
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 transition-colors scheme-dark"
                                />
                            </div>

                            {enableTimeSelection ? (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-white/60 uppercase tracking-wider">
                                        <Clock className="w-4 h-4 text-primary" />
                                        Horario Disponible
                                    </label>
                                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                        {timeSlots.map((slot) => (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => setTime(slot)}
                                                className={`py-2 px-3 rounded-lg text-sm font-bold transition-all border ${time === slot
                                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                    : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-primary" />
                                    <p className="text-xs text-white/80 leading-relaxed">
                                        Este servicio se agenda por día completo. La hora de inicio será coordinada post-reserva vía WhatsApp.
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={!date || (enableTimeSelection && !time)}
                                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Confirmar Reserva
                            </button>

                            <p className="text-center text-white/30 text-[10px] uppercase tracking-wider">
                                * Horarios de Buenos Aires (GMT-3)
                            </p>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
