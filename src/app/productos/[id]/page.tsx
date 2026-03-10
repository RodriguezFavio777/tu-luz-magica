import React from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductGallery } from '@/components/products/ProductGallery'
import ProductInfoClient from '@/components/products/ProductInfoClient'
import { BackToStoreButton } from '@/components/ui/BackToStoreButton'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();
    const { data: product } = await supabase
        .from('products')
        .select('name, description, image_url, images')
        .eq('id', id)
        .single();

    if (!product) return { title: 'Producto no encontrado | Tu Luz Mágica' };

    const ogImage = product.images?.[0] || product.image_url || '/placeholder.jpg';

    return {
        title: `${product.name} | Tu Luz Mágica`,
        description: product.description || `Compra ${product.name} en la tienda holística de Tu Luz Mágica.`,
        openGraph: {
            title: product.name,
            description: product.description,
            images: [ogImage],
        },
    }
}

// Force dynamic if we want real-time stock, OR use revalidate
export const revalidate = 60 // Revalidate every minute

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Await params for Next.js 15 compatibility
    const { id } = await params;
    const supabase = await createClient();

    // Fetch Product
    const { data: product, error } = await supabase
        .from('products')
        .select(`
            *,
            category:product_categories(name)
        `)
        .eq('id', id)
        .single()

    if (error || !product) {
        console.error('Product not found or error:', error)
        return notFound()
    }

    // Normalize Images
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

                {/* Recommended Products Section */}
                <ProductRecommendations currentId={product.id} />
            </div>
        </main>
    )
}

async function ProductRecommendations({ currentId }: { currentId: string }) {
    const supabase = await createClient();
    const { data: recommendedProducts } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .neq('id', currentId)
        .limit(10);

    const { RecommendedItems } = await import('@/components/ui/RecommendedItems');
    return <RecommendedItems type="product" items={recommendedProducts || []} />;
}
