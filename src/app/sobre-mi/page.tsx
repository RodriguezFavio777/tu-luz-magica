import { AboutClient } from './AboutClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Sobre Mí | Tu Luz Mágica',
    description: 'Conoce a Camí, la guía espiritual detrás de Tu Luz Mágica. Aprende sobre su historia, filosofía y misión.',
}

export default async function AboutMePage() {
    // Artificial delay to show Loading transition (Magic Effect)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return <AboutClient />
}
