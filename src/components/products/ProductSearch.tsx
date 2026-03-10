'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

export function ProductSearch() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialQuery = searchParams.get('q') || ''

    const [query, setQuery] = useState(initialQuery)

    const handleSearch = () => {
        const currentParams = new URLSearchParams(searchParams.toString())
        const currentQ = searchParams.get('q') || ''

        if (query.trim() !== currentQ) {
            if (query.trim()) {
                currentParams.set('q', query.trim())
                currentParams.set('page', '1')
                currentParams.delete('category') // Clear category to search globally
            } else {
                currentParams.delete('q')
            }
            router.push(`/productos?${currentParams.toString()}`)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const clearSearch = () => {
        setQuery('')
        const currentParams = new URLSearchParams(searchParams.toString())
        currentParams.delete('q')
        router.push(`/productos?${currentParams.toString()}`)
    }

    return (
        <div className="relative w-full max-w-md">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar (Presiona Enter)..."
                className="w-full bg-[#1d1520] border border-white/10 rounded-full px-4 py-2 pl-10 text-sm text-white placeholder:text-white/30 focus:outline-hidden focus:border-primary/50 transition-colors"
                aria-label="Buscar productos"
            />
            <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 cursor-pointer hover:text-white"
                onClick={handleSearch}
            />

            {query && (
                <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    aria-label="Limpiar búsqueda"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    )
}
