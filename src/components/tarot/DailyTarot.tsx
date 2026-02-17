'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

// Tarot Cards Data (Simplified for MVP, can be expanded or moved to a separate file)
const tarotCards = [
    { id: 1, name: 'El Loco', message: 'Un nuevo comienzo te espera. Confía en el salto de fe.', image: '/tarot/the-fool.jpg' },
    { id: 2, name: 'El Mago', message: 'Tienes todas las herramientas necesarias para manifestar tus deseos.', image: '/tarot/the-magician.jpg' },
    { id: 3, name: 'La Sacerdotisa', message: 'Confía en tu intuición. Las respuestas están en tu interior.', image: '/tarot/high-priestess.jpg' },
    { id: 4, name: 'La Emperatriz', message: 'Abundancia y creatividad florecen en tu vida.', image: '/tarot/the-empress.jpg' },
    { id: 5, name: 'El Emperador', message: 'Es momento de poner orden y estructura a tus planes.', image: '/tarot/the-emperor.jpg' },
    { id: 6, name: 'Los Enamorados', message: 'Decisiones importantes desde el corazón. Armonía en las relaciones.', image: '/tarot/the-lovers.jpg' },
    { id: 7, name: 'La Fuerza', message: 'Tu verdadera fuerza radica en tu compasión y coraje interior.', image: '/tarot/strength.jpg' },
    { id: 8, name: 'El Ermitaño', message: 'Tómate un tiempo para la introspección y la soledad sagrada.', image: '/tarot/the-hermit.jpg' },
    { id: 9, name: 'La Rueda de la Fortuna', message: 'El cambio es inevitable. Fluye con los ciclos de la vida.', image: '/tarot/wheel-of-fortune.jpg' },
    { id: 10, name: 'La Estrella', message: 'Mantén la esperanza. Estás siendo guiada por una luz superior.', image: '/tarot/the-star.jpg' },
    { id: 11, name: 'El Sol', message: 'Alegría, vitalidad y éxito. ¡Brilla con tu propia luz!', image: '/tarot/the-sun.jpg' },
    { id: 12, name: 'El Mundo', message: 'Cierre de un ciclo importante. Celebración y plenitud.', image: '/tarot/the-world.jpg' }
]

export function DailyTarot() {
    const [card, setCard] = useState<typeof tarotCards[0] | null>(null)
    const [isFlipped, setIsFlipped] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Check local storage for today's card
        const today = new Date().toDateString()
        const savedData = localStorage.getItem('dailyTarot')

        if (savedData) {
            const { date, cardId } = JSON.parse(savedData)
            if (date === today) {
                const savedCard = tarotCards.find(c => c.id === cardId)
                if (savedCard) {
                    setCard(savedCard)
                    setIsFlipped(true)
                }
            }
        }
    }, [])

    const drawCard = () => {
        if (card && isFlipped) return // Already drew today

        setLoading(true)
        // Simulate shuffling/drawing delay
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * tarotCards.length)
            const newCard = tarotCards[randomIndex]

            setCard(newCard)
            setIsFlipped(true)

            // Save to local storage
            const today = new Date().toDateString()
            localStorage.setItem('dailyTarot', JSON.stringify({ date: today, cardId: newCard.id }))

            setLoading(false)
        }, 1500)
    }

    return (
        <section className="py-20 relative overflow-hidden bg-[#0d0a10]">
            {/* Background Decorations */}
            <div className="absolute inset-0 bg-[#0a080c] z-0 opacity-50" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#f472b6]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#f472b6]/30 bg-[#f472b6]/5 mb-8 backdrop-blur-md">
                    <Sparkles className="w-4 h-4 text-[#f472b6]" />
                    <span className="text-[#f472b6] text-[10px] font-bold uppercase tracking-[0.2em]">Mensaje del Universo</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display">Tu Carta del Día</h2>
                <p className="text-white/60 max-w-2xl mx-auto mb-12">
                    Conecta con tu intuición y descubre el mensaje que el universo tiene para ti hoy.
                </p>

                <div className="flex justify-center perspective-1000 h-[450px]">
                    <div
                        className={`relative w-72 h-[420px] cursor-pointer transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : 'hover:scale-105'}`}
                        onClick={!isFlipped ? drawCard : undefined}
                    >
                        {/* Card Back */}
                        <div className={`absolute inset-0 w-full h-full backface-hidden rounded-2xl border-2 border-[#f472b6]/30 bg-[#120d14] flex flex-col items-center justify-center p-6 shadow-[0_0_30px_rgba(244,114,182,0.15)] transition-all ${isFlipped ? 'invisible' : 'visible'}`}>
                            <div className="border border-white/10 w-full h-full rounded-xl flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-80">
                                <div className="text-[#f472b6] flex flex-col items-center gap-4">
                                    <Sparkles className={`w-12 h-12 ${loading ? 'animate-spin' : 'animate-pulse'}`} />
                                    <span className="font-display font-bold text-xl tracking-widest uppercase">{loading ? 'Mezclando...' : 'Tocar para Revelar'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Card Front */}
                        <div className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl bg-[#1d1520] border border-[#f472b6]/30 overflow-hidden shadow-[0_0_50px_rgba(244,114,182,0.3)] flex flex-col ${isFlipped ? 'visible' : 'invisible'}`}>
                            {card && (
                                <>
                                    <div className="h-full flex flex-col relative">
                                        {/* Placeholder Image Gradient since we don't have real images yet */}
                                        <div className="h-2/3 bg-linear-to-b from-[#f472b6]/20 to-[#1d1520] relative flex items-center justify-center overflow-hidden">
                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                                            <div className="text-center z-10 px-4">
                                                <h3 className="text-3xl font-display font-bold text-white/90 mb-2">{card.name}</h3>
                                                <div className="w-16 h-1 bg-[#f472b6]/50 mx-auto rounded-full"></div>
                                            </div>
                                        </div>

                                        <div className="h-1/3 p-6 flex flex-col justify-center items-center text-center bg-[#1d1520] relative z-20 border-t border-white/5">
                                            <p className="text-white/80 font-body text-sm leading-relaxed italic">"{card.message}"</p>
                                        </div>

                                        {/* Shine Effect */}
                                        <div className="absolute inset-0 bg-linear-to-tr from-white/5 to-transparent pointer-events-none"></div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {isFlipped && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4"
                        >
                            <p className="text-white/40 text-xs">Vuelve mañana para un nuevo mensaje.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    )
}
