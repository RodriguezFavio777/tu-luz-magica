import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, Check, Loader2 } from 'lucide-react'
import { ModernCalendar } from '@/components/ui/ModernCalendar'

interface BusySlot {
    start: string
    end: string
}

interface BookingModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (date: string, time: string) => void
    serviceName: string
    serviceId: string
    enableTimeSelection?: boolean
    isRitual?: boolean
}

export function BookingModal({ isOpen, onClose, onConfirm, serviceName, serviceId, enableTimeSelection = true, isRitual = false }: BookingModalProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [time, setTime] = useState('')
    const [busySlots, setBusySlots] = useState<BusySlot[]>([])
    const [loadingAvailability, setLoadingAvailability] = useState(false)

    const checkAvailability = React.useCallback(async () => {
        if (!selectedDate) return
        setLoadingAvailability(true)
        try {
            const dateStr = selectedDate.toISOString().split('T')[0]
            const res = await fetch(`/api/availability?date=${dateStr}&serviceId=${serviceId}`)
            const data = await res.json()
            setBusySlots(data.busy || [])
        } catch (error) {
            console.error("Error checking availability:", error)
        } finally {
            setLoadingAvailability(false)
        }
    }, [selectedDate, serviceId])

    useEffect(() => {
        if (selectedDate && isOpen) {
            checkAvailability()
        }
    }, [selectedDate, isOpen, checkAvailability])

    const isSlotBusy = (slot: string) => {
        if (!selectedDate || !busySlots.length) return false;

        // Create a date string for the slot in YYYY-MM-DD
        const datePart = selectedDate.toISOString().split('T')[0];

        // Parse slot "09:00 AM" to "HH:mm:ss"
        const [timePart, modifier] = slot.split(' ');
        const timeParts = timePart.split(':').map(Number);
        let hours = timeParts[0];
        const minutes = timeParts[1];
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const hoursStr = String(hours).padStart(2, '0');
        const minutesStr = String(minutes).padStart(2, '0');

        const currentSlotLocal = `${datePart}T${hoursStr}:${minutesStr}:00`;

        // Check if the slot is in the past for today's date
        const options: Intl.DateTimeFormatOptions = {
            timeZone: 'America/Argentina/Buenos_Aires',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        };
        const formatter = new Intl.DateTimeFormat('en-CA', options);

        const now = new Date();
        const nowParts = formatter.formatToParts(now);
        const nYear = nowParts.find(p => p.type === 'year')?.value;
        const nMonth = nowParts.find(p => p.type === 'month')?.value;
        const nDay = nowParts.find(p => p.type === 'day')?.value;
        const nHour = nowParts.find(p => p.type === 'hour')?.value;
        const nMin = nowParts.find(p => p.type === 'minute')?.value;
        const nowLocal = `${nYear}-${nMonth}-${nDay}T${nHour}:${nMin}:00`;

        if (currentSlotLocal < nowLocal) {
            return true;
        }

        // The slot represents a specific time in Buenos Aires
        // We compare it by formatting each busy slot to Buenos Aires time
        return busySlots.some(busy => {
            const start = new Date(busy.start);
            const end = new Date(busy.end);

            // Format busy start/end to Buenos Aires ISO-like string for easier comparison
            const parts = formatter.formatToParts(start);
            const bYear = parts.find(p => p.type === 'year')?.value;
            const bMonth = parts.find(p => p.type === 'month')?.value;
            const bDay = parts.find(p => p.type === 'day')?.value;
            const bHour = parts.find(p => p.type === 'hour')?.value;
            const bMin = parts.find(p => p.type === 'minute')?.value;

            const busyStartLocal = `${bYear}-${bMonth}-${bDay}T${bHour}:${bMin}:00`;

            // Also need to handle the duration (end time)
            const endParts = formatter.formatToParts(end);
            const eHour = endParts.find(p => p.type === 'hour')?.value;
            const eMin = endParts.find(p => p.type === 'minute')?.value;
            const busyEndLocal = `${bYear}-${bMonth}-${bDay}T${eHour}:${eMin}:00`;

            return currentSlotLocal >= busyStartLocal && currentSlotLocal < busyEndLocal;
        });
    }

    const isDayBusy = () => {
        if (isRitual) return false; // Rituals don't block the day
        return busySlots.length > 0;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const textTime = enableTimeSelection ? time : "Todo el día";

        if (selectedDate && (textTime)) {
            const isoDate = selectedDate.toISOString().split('T')[0]
            onConfirm(isoDate, textTime)
            onClose()
        }
    }

    const timeSlots = [
        "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
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
                        {loadingAvailability && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-3xl">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        )}

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
                            <div className="flex-1">
                                <ModernCalendar
                                    selectedDate={selectedDate}
                                    onDateSelect={(d) => {
                                        setSelectedDate(d)
                                        setTime('')
                                    }}
                                />
                            </div>

                            <div className="flex-1 flex flex-col justify-between">
                                {enableTimeSelection ? (
                                    <div className="space-y-6 flex-1">
                                        <label className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider font-display">
                                            <Clock className="w-4 h-4 text-primary" />
                                            HORARIOS DISPONIBLES
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {timeSlots.map((slot) => {
                                                const busy = isSlotBusy(slot);
                                                return (
                                                    <button
                                                        key={slot}
                                                        type="button"
                                                        disabled={busy}
                                                        onClick={() => setTime(slot)}
                                                        className={`py-4 px-6 rounded-full text-sm font-bold transition-all border ${time === slot
                                                            ? 'bg-primary text-white border-primary shadow-[0_0_20px_rgba(244,114,182,0.4)] scale-105'
                                                            : busy
                                                                ? 'bg-black/40 text-white/20 border-white/5 cursor-not-allowed opacity-50'
                                                                : 'bg-black/20 text-white/70 border-white/10 hover:bg-white/5 hover:text-white'
                                                            }`}
                                                    >
                                                        {slot}
                                                        {busy && <span className="block text-[8px] opacity-60">OCUPADO</span>}
                                                    </button>
                                                )
                                            })}
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
                                            {isDayBusy()
                                                ? "Lamentablemente este día ya tiene reservas y no se puede agendar un servicio de día completo."
                                                : "Este servicio requiere que se coordine por fuera una vez seleccionado el día, ya que consume energía a lo largo de varias horas."
                                            }
                                        </p>
                                    </div>
                                )}

                                <div className="mt-8 pt-8 border-t border-white/10">
                                    <button
                                        type="submit"
                                        disabled={!selectedDate || (enableTimeSelection && !time) || (!enableTimeSelection && isDayBusy())}
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

