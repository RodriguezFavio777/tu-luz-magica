'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function ProductGallery({ images }: { images: string[] }) {
    const validImages = images && images.length > 0 ? images : ['/placeholder.jpg'];
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % validImages.length)
    }

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Main Image */}
            <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#1d1520] group shadow-2xl">
                <Image
                    src={validImages[currentIndex]}
                    alt="Producto"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Navigation Arrows */}
                {validImages.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {validImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {validImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`relative h-20 w-20 shrink-0 rounded-xl border-2 transition-all duration-300 overflow-hidden ${currentIndex === idx ? 'border-[#f472b6] scale-105 shadow-[0_0_15px_rgba(244,114,182,0.4)]' : 'border-white/10 opacity-60 hover:opacity-100'}`}
                        >
                            <Image src={img} alt={`Vista ${idx + 1}`} fill sizes="80px" className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
