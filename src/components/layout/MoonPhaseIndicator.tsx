'use client'

import React, { useState } from 'react'
import { getMoonPhase } from '@/utils/moonPhase'
import { motion, AnimatePresence } from 'framer-motion'

import { useHydrated } from '@/hooks/useHydrated'

export function MoonPhaseIndicator() {
    const [showTooltip, setShowTooltip] = useState(false)
    const isMounted = useHydrated()

    const phaseData = isMounted ? getMoonPhase() : null

    if (!phaseData) return null

    return (
        <div
            className="relative flex items-center gap-2 cursor-pointer group"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <span className="text-xl md:text-2xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] group-hover:scale-110 transition-transform duration-300">
                {phaseData.icon}
            </span>
            <span className="hidden lg:block text-[10px] items-center font-bold uppercase tracking-widest text-white/50 group-hover:text-white/80 transition-colors">
                {phaseData.phase}
            </span>

            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-surface/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl z-50 text-center pointer-events-none"
                    >
                        <p className="text-primary font-bold text-xs uppercase mb-1">{phaseData.phase}</p>
                        <p className="text-white/70 text-[10px] leading-tight">{phaseData.description}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
