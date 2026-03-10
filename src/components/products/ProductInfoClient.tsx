'use client';

import { useState } from 'react';
import { Star, Truck, ShieldCheck } from 'lucide-react';
import { AddToCartButton } from '@/components/cart/CartComponents';
import { VariantSelector } from './VariantSelector';

interface ProductInfoClientProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    product: any;
    displayImages: string[];
}

export default function ProductInfoClient({ product, displayImages }: ProductInfoClientProps) {
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

    // Initial variant selection if only one exists (optional)
    // useEffect(() => { if (product.variants?.length === 1) setSelectedVariant(product.variants[0].name) }, []);

    return (
        <div>
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.category?.name || 'Producto'}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display leading-tight">
                {product.name}
            </h1>

            <div className="prose prose-invert max-w-none text-white/60 mb-8 font-body leading-relaxed whitespace-pre-wrap">
                {product.description}
            </div>

            <div className="flex flex-col mb-8 bg-surface/50 p-6 rounded-2xl border border-white/5">
                <div className="flex items-end gap-4 mb-2">
                    <span className="text-4xl font-bold text-white font-display">
                        ${product.price.toLocaleString('es-AR')}
                    </span>
                </div>
                <span className="text-xs text-primary/80 uppercase tracking-widest font-semibold ml-1">
                    Valor sin impuestos
                </span>
            </div>

            {/* VARIANT SELECTOR */}
            {product.variants && product.variants.length > 0 && (
                <VariantSelector
                    variants={product.variants}
                    selected={selectedVariant}
                    onSelect={setSelectedVariant}
                />
            )}

            <div className="h-px w-full bg-white/10 mb-8" />

            <div className="space-y-6 mb-8">
                <AddToCartButton
                    type="physical"
                    product={{
                        ...product,
                        image: displayImages[0], // Adapter for cart
                        category: product.category?.name || 'General',
                        variant: selectedVariant // Pass selected variant to cart
                    }}
                    disabled={product.variants?.length > 0 && !selectedVariant} // Disable if variants exist but none selected
                />

                {product.variants?.length > 0 && !selectedVariant && (
                    <p className="text-amber-400 text-sm font-medium animate-pulse">
                        ⚠️ Por favor selecciona una opción para agregar al carrito
                    </p>
                )}

                <div className="flex flex-col gap-3 text-sm text-white/50">
                    <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-primary" />
                        <span>Envío a todo el país (Calculado en checkout)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <span>Garantía de calidad energética</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
