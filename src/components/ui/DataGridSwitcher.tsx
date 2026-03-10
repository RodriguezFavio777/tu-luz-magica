'use client'

import React, { useEffect } from 'react'
import { useLoadingStore } from '@/store/useLoadingStore'
import { MagicSpinner } from './MagicSpinner'
import { useSearchParams } from 'next/navigation'

interface DataGridSwitcherProps {
    children: React.ReactNode
}

/**
 * Wraps product or service grids to show a localized loading state when filters change.
 * It uses the global loading store and search params to coordinate the transition.
 */
export function DataGridSwitcher({ children }: DataGridSwitcherProps) {
    const { isFiltering, setIsFiltering } = useLoadingStore()
    const searchParams = useSearchParams()

    // When search parameters change, hide the localized loader as new content arrives
    useEffect(() => {
        setIsFiltering(false)
    }, [searchParams, setIsFiltering])

    return (
        <div className="relative min-h-[400px] w-full">
            {isFiltering && (
                <div className="absolute inset-0 z-40 bg-[#0a080c]/60 backdrop-blur-sm flex items-center justify-center p-20 rounded-3xl animate-in fade-in zoom-in duration-300">
                    <MagicSpinner size="lg" message="Buscando Magia..." />
                </div>
            )}

            <div className={`transition-all duration-500 ${isFiltering ? 'opacity-20 blur-xs pointer-events-none translate-y-4' : 'opacity-100 blur-none translate-y-0'}`}>
                {children}
            </div>
        </div>
    )
}
