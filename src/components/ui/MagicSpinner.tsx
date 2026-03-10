'use client'

import React from 'react'

interface MagicSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
    message?: string
}

export function MagicSpinner({ size = 'md', className = '', message }: MagicSpinnerProps) {
    const sizeClasses = {
        sm: 'w-10 h-10',
        md: 'w-16 h-16',
        lg: 'w-24 h-24'
    }

    const ringInset = {
        sm: { mid: 'inset-2', inner: 'inset-4' },
        md: { mid: 'inset-3', inner: 'inset-6' },
        lg: { mid: 'inset-4', inner: 'inset-8' }
    }

    return (
        <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
            <div className={`relative ${sizeClasses[size]} mb-4`}>
                {/* Outer Ring */}
                <div
                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"
                    style={{ animationDuration: '1.5s' }}
                />

                {/* Middle Ring */}
                <div
                    className={`absolute ${ringInset[size].mid} rounded-full border-2 border-transparent border-r-[#d63384] animate-spin`}
                    style={{ animationDuration: '2s', animationDirection: 'reverse' }}
                />

                {/* Inner Ring */}
                <div
                    className={`absolute ${ringInset[size].inner} rounded-full border-2 border-transparent border-b-[#ffd700] animate-spin`}
                    style={{ animationDuration: '1s' }}
                />

                {/* Center Glow */}
                <div className="absolute inset-0 bg-primary/15 blur-xl rounded-full animate-pulse" />
            </div>

            {message && (
                <p className="text-white/50 font-display uppercase tracking-[0.4em] text-[10px] animate-pulse">
                    {message}
                </p>
            )}
        </div>
    )
}
