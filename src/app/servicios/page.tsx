import React, { Suspense } from 'react'
import Image from 'next/image'
import { Sparkles, Hexagon } from 'lucide-react'
import { ServiceService } from '@/services/ServiceService'
import { ServiceFilterSidebar } from '@/components/services/ServiceFilterSidebar'
import { AnimatedHero } from '@/components/ui/AnimatedHero'
import { ServiceCard } from '@/components/services/ServiceCard'
import { DataGridSwitcher } from '@/components/ui/DataGridSwitcher'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Servicios de Sanación y Tarot | Tu Luz Mágica',
    description: 'Explora nuestras lecturas de tarot, rituales energéticos y sesiones de sanación holística diseñadas para tu evolución espiritual.',
    openGraph: {
        title: 'Servicios de Sanación y Tarot | Tu Luz Mágica',
        description: 'Explora nuestras lecturas de tarot, rituales energéticos y sesiones de sanación holística.',
        images: ['/tarot_mystical_bg.png'],
    },
}

export default async function ServicesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const categorySlug = params.category as string | undefined

    // 1. Fetch Categories via Service Layer
    const categories = await ServiceService.getCategories()

    // 2. Fetch Filtered Services via Service Layer
    const services = await ServiceService.getActiveServices(categorySlug)

    return (
        <main className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/tarot_mystical_bg.png"
                        alt="Portal Sagrado de Servicios Espirituales"
                        fill
                        priority
                        className="object-cover opacity-60 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0a080c]/80 to-[#0a080c]" />
                </div>

                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20">
                    <AnimatedHero>
                        <span className="text-primary font-bold tracking-widest text-xs uppercase mb-4 block">
                            <Sparkles className="inline w-4 h-4 mr-2" />
                            PORTAL SAGRADO
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-display drop-shadow-2xl">
                            Nuestros <span className="bg-linear-to-r from-primary via-secondary to-primary/80 bg-clip-text text-transparent italic drop-shadow-[0_0_25px_rgba(244,114,182,0.6)]">Servicios</span>
                        </h1>
                        <p className="text-white/70 text-lg md:text-xl font-body max-w-2xl mx-auto leading-relaxed">
                            Explora las herramientas de sanación y autoconocimiento que he diseñado para acompañarte en tu evolución espiritual.
                        </p>
                    </AnimatedHero>
                </div>
            </section>

            <div className="container mx-auto px-6 max-w-7xl pb-20 pt-8">
                <div className="flex flex-col md:flex-row gap-12">
                    <ServiceFilterSidebar categories={categories || []} />

                    <div className="flex-1 min-h-[400px]">
                        <Suspense fallback={<div className="min-h-[400px] animate-pulse bg-white/5 rounded-3xl" />}>
                            <DataGridSwitcher>
                                <div className="grid md:grid-cols-2 gap-8 h-fit">
                                    {services?.map((service) => (
                                        <ServiceCard
                                            key={service.id}
                                            id={service.id}
                                            title={service.name}
                                            description={service.description || ""}
                                            price={service.price}
                                            duration={"Consultar"}
                                            image={service.image_url || "/placeholder-service.jpg"}
                                            icon={<Hexagon className="w-6 h-6" />}
                                            variants={service.variants}
                                            isPopular={false}
                                        />
                                    ))}

                                    {(!services || services.length === 0) && (
                                        <div className="col-span-full py-20 text-center border dashed border-white/10 rounded-3xl">
                                            <p className="text-white/40">No hay servicios disponibles con estos filtros.</p>
                                        </div>
                                    )}
                                </div>
                            </DataGridSwitcher>
                        </Suspense>
                    </div>
                </div>
            </div>
        </main>
    )
}
