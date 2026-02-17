'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedHeroProps {
    children: ReactNode
}

export function AnimatedHero({ children }: AnimatedHeroProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            {children}
        </motion.div>
    )
}
