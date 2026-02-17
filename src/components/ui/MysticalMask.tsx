'use client'

import React from 'react'

interface MysticalMaskProps {
    children: React.ReactNode
    className?: string
    intensity?: 'light' | 'medium' | 'deep'
}

/**
 * MysticalMask Component
 * Applies a blurred darkness gradient mask to children (usually images)
 * to ensure text readability and mystical atmosphere.
 */
export const MysticalMask: React.FC<MysticalMaskProps> = ({
    children,
    className = "",
    intensity = 'medium'
}) => {
    const maskClasses = {
        light: "bg-linear-to-t from-background/60 via-background/20 to-transparent backdrop-blur-[1px]",
        medium: "bg-linear-to-t from-background/80 via-background/40 to-transparent backdrop-blur-[2px]",
        deep: "bg-linear-to-t from-background via-background/60 to-transparent backdrop-blur-[4px]"
    }

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {children}
            <div className={`absolute inset-0 z-10 transition-opacity duration-700 ${maskClasses[intensity]}`} />

            {/* Decorative inner glow for depth */}
            <div className="absolute inset-0 z-10 bg-linear-to-b from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        </div>
    )
}
