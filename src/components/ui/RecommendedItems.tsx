'use client'

import React, { useEffect, useState } from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { ServiceCard } from '@/components/services/ServiceCard'
import { Sparkles, Hexagon } from 'lucide-react'

interface BaseItem {
    id: string
    name: string
    description?: string | null
    price: number
    image_url?: string | null
    // Let it intersect with what ProductCard needs roughly without using any
    [key: string]: unknown
}

interface RecommendedItemsProps {
    type: 'product' | 'service'
    items: BaseItem[]
}

export function RecommendedItems({ type, items }: RecommendedItemsProps) {
    const [selected, setSelected] = useState<BaseItem[]>([])

    useEffect(() => {
        if (items && items.length > 0) {
            // Pick 3 random items
            const shuffled = [...items].sort(() => 0.5 - Math.random())
            Promise.resolve().then(() => setSelected(shuffled.slice(0, 3)))
        }
    }, [items])

    if (!items || items.length === 0 || selected.length === 0) return null

    return (
        <section className="mt-24 pt-24 border-t border-white/5">
            <div className="flex flex-col items-center text-center mb-12">
                <span className="text-primary font-bold tracking-widest text-[10px] uppercase mb-4 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Sugerencias Místicas
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white font-display">
                    También te puede <span className="text-primary italic">interesar</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {selected.map((item) => (
                    type === 'product' ? (
                        <ProductCard key={item.id} product={item as unknown as React.ComponentProps<typeof ProductCard>['product']} />
                    ) : (
                        <ServiceCard
                            key={item.id}
                            id={item.id}
                            title={item.name}
                            description={item.description || ""}
                            price={item.price}
                            duration="Consultar"
                            image={item.image_url || "/placeholder.jpg"}
                            icon={<Hexagon className="w-6 h-6" />}
                        />
                    )
                ))}
            </div>
        </section>
    )
}
