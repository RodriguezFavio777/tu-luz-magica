import React, { Suspense } from 'react'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { ProductService } from '@/services/ProductService'
import { CategoryService } from '@/services/CategoryService'
import { ProductFilterSidebar } from '@/components/products/FilterSidebar'
import { PaginationControls } from '@/components/ui/PaginationControls'
import { ProductSearch } from '@/components/products/ProductSearch'
import { ProductCard } from '@/components/products/ProductCard'
import { AnimatedHero } from '@/components/ui/AnimatedHero'
import { DataGridSwitcher } from '@/components/ui/DataGridSwitcher'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Tienda Holística | Cristales, Sahumerios y Magia | Tu Luz Mágica',
    description: 'Descubre nuestra colección de herramientas sagradas, cristales energéticos y elementos rituales para elevar la vibración de tu hogar.',
    openGraph: {
        title: 'Tienda Holística | Tu Luz Mágica',
        description: 'Herramientas sagradas, cristales y elementos rituales para tu bienestar.',
        images: ['/crystals_holistic_bg.png'],
    },
}

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const ITEMS_PER_PAGE = 12

    // Filters
    const categorySlug = params.category as string | undefined
    const sort = params.sort as string | undefined
    const searchQuery = params.q as string | undefined

    // 1. Fetch Categories for Sidebar via Service
    const categories = await CategoryService.getAll()

    // 2. Fetch Paginated Products via Service
    const { products, count } = await ProductService.search({
        searchQuery,
        categorySlug,
        sort,
        page: currentPage,
        pageSize: ITEMS_PER_PAGE
    })

    const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0

    return (
        <main className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/crystals_holistic_bg.png"
                        alt="Tienda Holística de Herramientas Sagradas"
                        fill
                        priority
                        className="object-cover opacity-60 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0a080c]/80 to-[#0a080c]" />
                </div>

                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20">
                    <AnimatedHero>
                        <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white/90 mb-6">
                            <Package className="w-3 h-3" />
                            SANTUARIO DE OBJETOS
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-display drop-shadow-2xl">
                            Tienda <span className="bg-linear-to-r from-primary via-[#d63384] to-[#fa9acb] bg-clip-text text-transparent italic drop-shadow-[0_0_25px_rgba(244,114,182,0.6)]">Holística</span>
                        </h1>
                        <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                            Herramientas consagradas, cristales y elementos rituales para elevar la vibración de tu hogar y tu ser.
                        </p>

                        <div className="flex justify-center w-full">
                            <ProductSearch />
                        </div>
                    </AnimatedHero>
                </div>
            </section>

            <div className="container mx-auto px-6 max-w-7xl pb-20 pt-8">
                <div className="flex flex-col md:flex-row gap-12">
                    <ProductFilterSidebar categories={categories || []} />

                    <div className="flex-1 min-h-[400px]">
                        <Suspense fallback={<div className="min-h-[400px] animate-pulse bg-white/5 rounded-3xl" />}>
                            <DataGridSwitcher>
                                {!products || products.length === 0 ? (
                                    <div className="text-center py-20 border border-white/5 rounded-3xl bg-surface/50">
                                        <p className="text-white/40">No se encontraron productos con estos filtros.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {products.map((product) => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>
                                )}

                                <PaginationControls currentPage={currentPage} totalPages={totalPages} />
                            </DataGridSwitcher>
                        </Suspense>
                    </div>
                </div>
            </div>
        </main>
    )
}
