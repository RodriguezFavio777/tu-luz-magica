import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ShoppingBag, Search, Package } from 'lucide-react'
import { AddToCartButton } from '@/components/cart/CartComponents'
import { createClient } from '@/lib/supabase/server'
import { ProductFilterSidebar } from '@/components/products/FilterSidebar'
import { PaginationControls } from '@/components/ui/PaginationControls'
import { ProductSearch } from '@/components/products/ProductSearch'
import { ProductCard } from '@/components/products/ProductCard'
import { AnimatedHero } from '@/components/ui/AnimatedHero'

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

    // Database Fetch
    const supabase = await createClient()

    // 1. Fetch Categories for Sidebar
    const { data: categories } = await supabase
        .from('service_categories')
        .select('id, name, slug, parent_id')
        .eq('is_active', true)
        .eq('scope', 'physical')
        .order('name')

    // ... (Categories logic unchanged) ...

    // 2. Build Product Query
    let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('type', 'physical')
        .eq('is_active', true)

    // Search Filter
    if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`)
    }

    if (categorySlug && categories) {
        const matchingCat = categories.find(c => c.slug === categorySlug)
        if (matchingCat) {
            // Check if it's a parent
            const childIds = categories.filter(c => c.parent_id === matchingCat.id).map(c => c.id)

            if (childIds.length > 0) {
                // It's a parent, fetch its products AND children's products
                // Syntax: category_id.in.(id1,id2,...)
                const allIds = [matchingCat.id, ...childIds]
                query = query.in('category_id', allIds)
            } else {
                // It's a leaf
                query = query.eq('category_id', matchingCat.id)
            }
        }
    }

    // Sort Logic
    switch (sort) {
        case 'price_asc':
            query = query.order('price', { ascending: true })
            break
        case 'price_desc':
            query = query.order('price', { ascending: false })
            break
        default:
            query = query.order('created_at', { ascending: false })
    }

    // Pagination Logic
    const from = (currentPage - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    const { data: products, count } = await query.range(from, to)

    const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0

    return (
        <main className="min-h-screen bg-background">
            {/* Hero Section - Centered like Sobre Mí */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/crystals_holistic_bg.png"
                        alt="Tienda Holística de Herramientas Sagradas"
                        fill
                        className="object-cover opacity-60 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a080c]/80 to-[#0a080c]" />
                </div>

                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20">
                    <AnimatedHero>
                        <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white/90 mb-6">
                            <Package className="w-3 h-3" />
                            SANTUARIO DE OBJETOS
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-display drop-shadow-2xl">
                            Tienda <span className="bg-linear-to-r from-[#f472b6] via-[#d63384] to-[#fa9acb] bg-clip-text text-transparent italic drop-shadow-[0_0_25px_rgba(244,114,182,0.6)]">Holística</span>
                        </h1>
                        <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                            Herramientas consagradas, cristales y elementos rituales para elevar la vibración de tu hogar y tu ser.
                        </p>

                        {/* Búsqueda centrada */}
                        <div className="flex justify-center w-full">
                            <ProductSearch />
                        </div>
                    </AnimatedHero>
                </div>
            </section>

            <div className="container mx-auto px-6 max-w-7xl pb-20 pt-8">

                <div className="flex flex-col md:flex-row gap-12">
                    {/* Sidebar */}
                    <ProductFilterSidebar categories={categories || []} />

                    {/* Grid */}
                    <div className="flex-1">
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
                    </div>
                </div>
            </div>

        </main >
    )
}
