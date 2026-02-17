'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export function MysticalLoader({ size = "md" }: { size?: "sm" | "md" | "lg" | "fullscreen" }) {
    const containerClasses = {
        sm: "w-8 h-8",
        md: "w-16 h-16",
        lg: "w-24 h-24",
        fullscreen: "fixed inset-0 z-50 flex items-center justify-center bg-[#0a0510]/80 backdrop-blur-md"
    }

    const iconSizes = {
        sm: 16,
        md: 32,
        lg: 48,
        fullscreen: 64
    }

    const content = (
        <div className={`relative flex items-center justify-center ${size !== 'fullscreen' ? containerClasses[size] : ''}`}>
            {/* Outer Ring */}
            <motion.div
                className="absolute inset-0 border-2 border-primary/30 rounded-full"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.8, 0.3],
                    rotate: 360
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Inner Ring */}
            <motion.div
                className="absolute inset-2 border-2 border-secondary/30 rounded-full"
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.3, 0.8, 0.3],
                    rotate: -360
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Center Icon */}
            <motion.div
                animate={{
                    filter: [
                        "drop-shadow(0 0 0px var(--color-primary))",
                        "drop-shadow(0 0 10px var(--color-primary))",
                        "drop-shadow(0 0 0px var(--color-primary))"
                    ]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <Sparkles
                    size={size === 'fullscreen' ? iconSizes.fullscreen : iconSizes[size]}
                    className="text-primary"
                />
            </motion.div>
        </div>
    )

    if (size === 'fullscreen') {
        return <div className={containerClasses.fullscreen}>{content}</div>
    }

    return content
}
