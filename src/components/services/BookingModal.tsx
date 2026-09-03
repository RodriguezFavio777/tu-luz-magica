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

        // Create a local Date object for the current slot time
        const slotDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), hours, minutes, 0);

        // Get the current time in Buenos Aires as a comparable local Date
        const baTimeStr = new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" });
        const nowBA = new Date(baTimeStr);

        // If the slot is in the past compared strictly to Buenos Aires time, mark as busy
        if (slotDate < nowBA) {
            return true;
        }

        // Check if the slot represents a specific time in Buenos Aires server slots
        const options: Intl.DateTimeFormatOptions = {
            timeZone: 'America/Argentina/Buenos_Aires',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false,
            hourCycle: 'h23'
        };
        const formatter = new Intl.DateTimeFormat('en-CA', options);

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
                        className="relative w-full max-w-4xl bg-surface border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)]"
                    >
                        {loadingAvailability && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-30 flex items-center justify-center rounded-3xl">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/40 hover:text-white transition-colors z-20 bg-black/20 p-2 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-4 sm:p-6 md:p-8 pb-4 border-b border-white/5 shrink-0 flex items-center gap-4 pr-14">
                            <div className="p-2.5 sm:p-3 bg-primary/20 rounded-xl shrink-0">
                                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xl sm:text-2xl font-bold text-white font-display truncate">Selecciona Fecha y Hora</h3>
                                <p className="text-primary text-xs sm:text-sm font-bold uppercase tracking-widest truncate">{serviceName}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                            <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
                                <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-stretch">
                                    <div className="flex-1 flex justify-center md:justify-start">
                                        <ModernCalendar
                                            selectedDate={selectedDate}
                                            onDateSelect={(d) => {
                                                setSelectedDate(d)
                                                setTime('')
                                            }}
                                        />
                                    </div>

                                    <div className="flex-1 flex flex-col justify-start">
                                        {enableTimeSelection ? (
                                            <div className="space-y-4 sm:space-y-6 flex-1">
                                                <label className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider font-display">
                                                    <Clock className="w-4 h-4 text-primary" />
                                                    HORARIOS DISPONIBLES
                                                </label>
                                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                                    {timeSlots.map((slot) => {
                                                        const busy = isSlotBusy(slot);
                                                        return (
                                                            <button
                                                                key={slot}
                                                                type="button"
                                                                disabled={busy}
                                                                onClick={() => setTime(slot)}
                                                                className={`py-3 sm:py-4 px-3 sm:px-6 rounded-full text-xs sm:text-sm font-bold transition-all border ${time === slot
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
                                                <p className="text-white/40 text-xs italic mt-4 sm:mt-6">
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
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 bg-surface/95 backdrop-blur-md border-t border-white/10 shrink-0 sticky bottom-0 z-20 pb-[max(1rem,env(safe-area-inset-bottom))]">
                                <button
                                    type="submit"
                                    disabled={!selectedDate || (enableTimeSelection && !time) || (!enableTimeSelection && isDayBusy())}
                                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 sm:py-5 rounded-full transition-all shadow-[0_10px_40px_-10px_rgba(244,114,182,0.4)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
                                >
                                    <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Confirmar Selección
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

