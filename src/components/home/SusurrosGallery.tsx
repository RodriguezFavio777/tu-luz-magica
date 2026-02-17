'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, PlayCircle, Quote } from 'lucide-react'

// Mock Data
const SUSURROS = [
    {
        id: 1,
        type: 'whatsapp',
        user: 'Ana Laura',
        content: '/tarot_card_reading_close_up_mystical_1770752736602.png',
        text: "¡Hola Camí! No puedo creer lo que pasó después de la limpieza. Me llamaron del trabajo que quería...",
        preview: "/tarot_card_reading_close_up_mystical_1770752736602.png"
    },
    {
        id: 2,
        type: 'video',
        user: 'Sofía M.',
        content: '/lit_candles_ritual_mystical_atmosphere_1770752768490.png', // Using image as placeholder for video thumbnail
        text: "Video Testimonio: Ritual de Amor Propio",
        preview: "/lit_candles_ritual_mystical_atmosphere_1770752768490.png"
    },
    {
        id: 3,
        type: 'whatsapp',
        user: 'Carla G.',
        content: '/healing_crystals_amethyst_quartz_altar_1770752752291.png',
        text: "Gracias infinitas por el Tarot. Fue demasiado exacto, me dejaste helada.",
        preview: "/healing_crystals_amethyst_quartz_altar_1770752752291.png"
    }
]

export function SusurrosGallery() {
    const [selectedItem, setSelectedItem] = useState<typeof SUSURROS[0] | null>(null)

    return (
        <section className="py-24 bg-background relative" id="susurros">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Quote className="text-primary w-6 h-6 rotate-180" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display">Susurros de <span className="text-primary italic">Luz</span></h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto">
                        Historias reales de almas que han transformado su vibración. Testimonios que llegan al corazón.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {SUSURROS.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group cursor-pointer"
                            onClick={() => setSelectedItem(item)}
                        >
                            <div className="relative aspect-4/5 rounded-3xl overflow-hidden border border-white/5 hover:border-primary/40 transition-all duration-500 shadow-lg group-hover:shadow-[0_0_30px_rgba(244,114,182,0.1)]">
                                <Image
                                    src={item.preview}
                                    alt={item.user}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                                <div className="absolute inset-0 flex flex-col justify-end p-8">
                                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        {item.type === 'video' ? <PlayCircle className="text-white w-6 h-6" /> : <MessageCircle className="text-white w-6 h-6" />}
                                    </div>
                                    <h4 className="text-white font-bold text-lg mb-2">{item.user}</h4>
                                    <p className="text-white/70 text-sm line-clamp-2">{item.text}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-xl p-6"
                        onClick={() => setSelectedItem(null)}
                    >
                        <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
                            <X className="w-8 h-8" />
                        </button>

                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="max-w-4xl w-full max-h-[90vh] relative rounded-2xl overflow-hidden bg-[#1d1520] border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Content Placeholder - In a real app this would render the actual image/video */}
                            <div className="aspect-video bg-black flex items-center justify-center relative">
                                <Image
                                    src={selectedItem.preview}
                                    alt="Content"
                                    fill
                                    className="object-contain opacity-50"
                                />
                                <div className="absolute z-10 text-center p-8 bg-black/50 rounded-xl backdrop-blur-md">
                                    <h3 className="text-2xl font-bold text-white mb-4">{selectedItem.type === 'video' ? 'Video Player' : 'Captura WhatsApp'}</h3>
                                    <p className="text-white/60">Aquí se mostraría el contenido real: {selectedItem.content}</p>
                                </div>
                            </div>
                            <div className="p-8 bg-[#1d1520]">
                                <h3 className="text-xl font-bold text-white mb-2">{selectedItem.user}</h3>
                                <p className="text-white/60 italic">"{selectedItem.text}"</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}
