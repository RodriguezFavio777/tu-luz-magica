import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { ProductGallery } from '@/components/products/ProductGallery'
import ProductInfoClient from '@/components/products/ProductInfoClient'
import { BackToStoreButton } from '@/components/ui/BackToStoreButton'

// Direct client for Server Side Fetching (Static/ISR)
const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Force dynamic if we want real-time stock, OR use revalidate
export const revalidate = 60 // Revalidate every minute

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Await params for Next.js 15 compatibility
    const { id } = await params;

    // Fetch Product
    const { data: product, error } = await supabase
        .from('products')
        .select(`
            *,
            category:service_categories(name)
        `)
        .eq('id', id)
        .single()

    if (error || !product) {
        console.error('Product not found or error:', error)
        return notFound()
    }

    // Normalize Images
    // Legacy support: use image_url if images array is empty
    let displayImages: string[] = []
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        displayImages = product.images
    } else if (product.image_url) {
        displayImages = [product.image_url]
    } else {
        displayImages = ['/placeholder.jpg']
    }

    return (
        <main className="min-h-screen bg-background pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-6xl">
                <BackToStoreButton />

                <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
                    {/* Image Gallery */}
                    <ProductGallery images={displayImages} />

                    {/* Product Info Client Component */}
                    <ProductInfoClient product={product} displayImages={displayImages} />
                </div>
            </div>
        </main>
    )
}
