'use client'

import React from 'react'
import Image from 'next/image'

/**
 * Triqueta Isologo Component
 * Uses the professional gradient isotype (logo.png) with transparent background.
 */
export const TriquetaLogo: React.FC<{ size?: number; className?: string; animate?: boolean }> = ({ size = 40, className = "", animate = false }) => {
    return (
        <div
            className={`relative flex items-center justify-center ${className} ${animate ? 'animate-spin-slow' : ''}`}
            style={{
                width: size,
                height: size,
                animationDuration: '8s'
            }}
        >
            <Image
                src="/logo-new.png"
                alt="Tu Luz Mágica Isotipo"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain drop-shadow-[0_0_15px_rgba(244,114,182,0.4)]"
                priority
            />
        </div>
    )
}
