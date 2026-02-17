'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    HelpCircle, ChevronDown, Sparkles, BookOpen, Clock, ShoppingBag, CreditCard, MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { siteConfig } from '@/config/site'

// FAQ Data Structure
const faqs = [
    {
        category: "Lecturas y Consultas",
        icon: <BookOpen className="w-6 h-6 text-[#f472b6]" />,
        questions: [
            {
                q: "¿Cómo debo prepararme para una lectura de tarot?",
                a: "Busca un lugar tranquilo donde no seas interrumpida. Ten a mano un vaso de agua y, si lo deseas, enciende una vela blanca o sahumerio. Lo más importante es que vengas con el corazón abierto y una intención clara."
            },
            {
                q: "¿Las lecturas son online o presenciales?",
                a: "Actualmente todas mis sesiones son 100% online (videollamada por Zoom o WhatsApp), lo que permite conectar contigo sin importar en qué parte del mundo te encuentres. La energía no conoce distancias."
            },
            {
                q: "¿Puedo grabar la sesión?",
                a: "¡Sí! Siempre recomiendo grabar la lectura para que puedas volver a escuchar los mensajes con calma y descubrir nuevos matices con el tiempo."
            }
        ]
    },
    {
        category: "Rituales y Tiempos",
        icon: <Clock className="w-6 h-6 text-[#f472b6]" />,
        questions: [
            {
                q: "¿Cuánto tiempo tardan en verse los resultados de un ritual?",
                a: "Los tiempos del universo no son lineales. Algunos movimientos energéticos se sienten de inmediato (paz, claridad), mientras que la manifestación física puede tomar desde un ciclo lunar (28 días) hasta 3 meses. La paciencia y el desapego son claves."
            },
            {
                q: "¿Puedo pedir un ritual para otra persona?",
                a: "Solo realizo trabajos para terceros si es para su sanación o protección y bajo la guía de mis maestros. Nunca realizo amarres ni trabajos que interfieran con el libre albedrío de nadie. Eso es magia negra y aquí solo trabajamos con Luz."
            }
        ]
    },
    {
        category: "Tienda y Envíos",
        icon: <ShoppingBag className="w-6 h-6 text-[#f472b6]" />,
        questions: [
            {
                q: "¿Hacen envíos internacionales?",
                a: "Por el momento, la tienda de productos físicos (velas, cristales, kits) solo realiza envíos dentro del territorio nacional. Sin embargo, todos mis servicios digitales (lecturas, e-books) están disponibles para todo el mundo."
            },
            {
                q: "¿Los cristales vienen energizados?",
                a: "Absolutamente. Cada cristal, mazo o vela que sale de mi tienda pasa por un proceso de limpieza y consagración en mi altar personal antes de ser empaquetado para ti."
            },
            {
                q: "¿Qué hago si mi pedido llega dañado?",
                a: "Escríbeme inmediatamente a hola@tuluzmagica.com con fotos del estado del paquete y del producto. Me encargaré de reponerlo o gestionarte una solución mágica."
            }
        ]
    },
    {
        category: "Métodos de Pago",
        icon: <CreditCard className="w-6 h-6 text-[#f472b6]" />,
        questions: [
            {
                q: "¿Qué métodos de pago aceptan?",
                a: "Aceptamos todas las tarjetas de crédito y débito a través de Mercado Pago, así como transferencias bancarias. Para clientes internacionales, el pago es vía PayPal."
            },
            {
                q: "¿Puedo cancelar o reprogramar una sesión?",
                a: "Puedes reprogramar tu sesión con hasta 24 horas de anticipación sin costo. Las cancelaciones con menos de 24hs no tienen reembolso, ya que ese tiempo fue reservado exclusivamente para ti."
            }
        ]
    }
]

export default function FAQPage() {
    return (
        <main className="min-h-screen bg-[#0a080c] pt-32 pb-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>

            {/* Header */}
            <div className="container mx-auto px-6 max-w-4xl text-center relative z-10 mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#f472b6]/30 bg-[#f472b6]/5 mb-8 backdrop-blur-md">
                    <HelpCircle className="w-4 h-4 text-[#f472b6]" />
                    <span className="text-[#f472b6] text-[10px] font-bold uppercase tracking-[0.2em] glow-text">Centro de Ayuda</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-black text-white mb-6 font-display drop-shadow-[0_0_25px_rgba(244,114,182,0.5)]">
                    Preguntas <span className="text-transparent bg-clip-text bg-linear-to-r from-[#f472b6] to-[#d63384]">Frecuentes</span>
                </h1>
                <p className="text-white/60 text-lg md:text-xl font-body max-w-2xl mx-auto leading-relaxed">
                    Encuentra respuestas a tus dudas sobre lecturas de tarot, rituales sagrados y tus pedidos en la tienda mística.
                </p>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 max-w-3xl relative z-10 space-y-12">
                {faqs.map((section, idx) => (
                    <div key={idx} className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-[#f472b6]/20 flex items-center justify-center border border-[#f472b6]/30">
                                {section.icon}
                            </div>
                            <h2 className="text-2xl font-bold text-white font-display">{section.category}</h2>
                        </div>

                        <div className="space-y-4">
                            {section.questions.map((item, qIdx) => (
                                <AccordionItem key={qIdx} question={item.q} answer={item.a} />
                            ))}
                        </div>
                    </div>
                ))}

                {/* CTA Box */}
                <div className="mt-20 bg-[#120d14] rounded-3xl p-8 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 relative overflow-hidden group hover:border-[#f472b6]/30 transition-colors duration-500">
                    <div className="absolute inset-0 bg-linear-to-r from-[#f472b6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#f472b6]/50 shadow-[0_0_20px_rgba(244,114,182,0.4)]">
                            {/* Camí Avatar Placeholder - Ideally pass prop */}
                            <div className="w-full h-full bg-[#f472b6] flex items-center justify-center text-white font-bold text-xl">C</div>
                        </div>
                        <div className="text-left">
                            <h3 className="text-white font-bold text-lg mb-1">¿Aún tienes dudas?</h3>
                            <p className="text-white/50 text-sm">Escríbeme directamente y te ayudaré con gusto.</p>
                        </div>
                    </div>
                    <Link href={siteConfig.links.whatsapp} target="_blank" rel="noopener noreferrer" className="relative z-10 px-8 py-3 rounded-full bg-[#f472b6] text-white font-bold text-sm hover:bg-[#fa9acb] transition-all shadow-lg flex items-center gap-2 group/btn">
                        <MessageSquare className="w-4 h-4" />
                        Contactar con Camí
                    </Link>
                </div>
            </div>
        </main>
    )
}

function AccordionItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border border-white/5 rounded-2xl bg-[#18121a] overflow-hidden transition-all duration-300 hover:border-white/10">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-hidden"
            >
                <span className={`font-semibold text-lg transition-colors ${isOpen ? 'text-[#f472b6]' : 'text-white/90'}`}>
                    {question}
                </span>
                <ChevronDown className={`w-5 h-5 text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#f472b6]' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="px-6 pb-6 text-white/60 leading-relaxed text-base font-body border-t border-white/5 pt-4">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
