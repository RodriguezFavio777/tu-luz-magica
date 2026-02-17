import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Sparkles, Calendar, Clock, Hexagon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ServiceFilterSidebar } from '@/components/services/ServiceFilterSidebar'
import { AnimatedHero } from '@/components/ui/AnimatedHero'
import { ServiceCard } from '@/components/services/ServiceCard'

export default async function ServicesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const categorySnake = params.category as string | undefined
    const duration = params.duration as string | undefined

    const supabase = await createClient()

    // 1. Fetch ALL active services (products of type service) to determine used categories
    const { data: allActiveServices } = await supabase
        .from('products')
        .select('category_id')
        .eq('type', 'service')
        .eq('is_active', true)

    // Extract unique category IDs that have at least one service
    const usedCategoryIds = new Set(allActiveServices?.map(s => s.category_id).filter(Boolean));

    // 2. Fetch Categories for Sidebar, filtering by those that are used
    let { data: categories } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .eq('scope', 'service') // Strict Filter
        .order('display_order', { ascending: true })

    // Filter categories in memory to only show those with services
    if (categories) {
        categories = categories.filter(cat => usedCategoryIds.has(cat.id));
    }

    // 3. Build Query for displayed services based on filters
    let query = supabase
        .from('products')
        .select('*') // Removed service_categories join to prevent errors if relationship is broken
        .eq('type', 'service')
        .eq('is_active', true)

    if (categorySnake) {
        // First resolve the category ID from the slug to avoid complex inner join issues
        const { data: categoryData } = await supabase
            .from('service_categories')
            .select('id')
            .eq('slug', categorySnake)
            .single();

        if (categoryData) {
            query = query.eq('category_id', categoryData.id)
        } else {
            // Valid category slug but not found in DB? Return empty or handle gracefully
            // For now, let's just make the query impossible to match so it returns empty
            query = query.eq('id', '00000000-0000-0000-0000-000000000000')
        }
    }

    if (duration) {
        query = query.eq('duration_minutes', parseInt(duration))
    }

    const { data: services, error } = await query

    if (error) {
        console.error("Error fetching services:", error);
    }

    return (
        <main className="min-h-screen bg-background">
            {/* Hero Section - Centered like Sobre Mí */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/tarot_mystical_bg.png"
                        alt="Portal Sagrado de Servicios Espirituales"
                        fill
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

                    <div className="flex-1 grid md:grid-cols-2 gap-8 h-fit">
                        {services?.map((service) => (
                            <ServiceCard
                                key={service.id}
                                id={service.id}
                                title={service.name}
                                description={service.description || ""}
                                price={service.price}
                                duration={service.duration_minutes ? `${service.duration_minutes} min` : "Consultar"}
                                image={service.image_url || "/placeholder-service.jpg"}
                                icon={<Hexagon className="w-6 h-6" />}
                                isPopular={false} // logic could be added here
                            />
                        ))}

                        {(!services || services.length === 0) && (
                            <div className="col-span-full py-20 text-center border dashed border-white/10 rounded-3xl">
                                <p className="text-white/40">No hay servicios disponibles con estos filtros.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </main >
    )
}
