'use client'

import { useLoadingStore } from '@/store/useLoadingStore'
import { useEffect } from 'react'

export function GlobalLoader() {
    const { isLoading, message } = useLoadingStore()

    // Prevent scrolling when loading
    useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isLoading])

    if (!isLoading) return null

    return (
        <div className="fixed inset-0 z-9999 bg-[#0a080c]/90 backdrop-blur-sm flex flex-col items-center justify-center min-h-screen w-full transition-all animate-in fade-in duration-300">
            {/* Custom Spinner - Matching loading.tsx */}
            <div className="relative w-20 h-20 mb-8">
                {/* Outer Ring */}
                <div
                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"
                    style={{ animationDuration: '1.5s' }}
                />

                {/* Middle Ring */}
                <div
                    className="absolute inset-3 rounded-full border-2 border-transparent border-r-[#d63384] animate-spin"
                    style={{ animationDuration: '2s', animationDirection: 'reverse' }}
                />

                {/* Inner Ring */}
                <div
                    className="absolute inset-6 rounded-full border-2 border-transparent border-b-[#ffd700] animate-spin"
                    style={{ animationDuration: '1s' }}
                />

                {/* Center Glow */}
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            </div>

            <p className="text-white/80 font-display uppercase tracking-[0.4em] text-xs animate-pulse">
                {message}
            </p>
        </div>
    )
}
