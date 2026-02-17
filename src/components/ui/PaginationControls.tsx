'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

interface PaginationControlsProps {
    currentPage: number
    totalPages: number
    siblingCount?: number
}

// Helper to generate page range
function generatePagination(currentPage: number, totalPages: number, siblingCount: number = 1) {
    const totalPageNumbers = siblingCount * 2 + 5; // siblingCount + siblingCount + firstPage + lastPage + currentPage + 2*dots
    if (totalPageNumbers >= totalPages) {
        // Show 1 to totalPages
        return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
        const leftItemCount = 3 + 2 * siblingCount;
        const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
        return [...leftRange, 'DOTS', lastPageIndex];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
        const rightItemCount = 3 + 2 * siblingCount;
        const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
        return [firstPageIndex, 'DOTS', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
        const middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
        return [firstPageIndex, 'DOTS', ...middleRange, 'DOTS', lastPageIndex];
    }

    return [];
}

export function PaginationControls({ currentPage, totalPages, siblingCount = 1 }: PaginationControlsProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', page.toString())
        router.push(`/productos?${params.toString()}`)
    }

    if (totalPages <= 1) return null

    const paginationRange = generatePagination(currentPage, totalPages, siblingCount);

    return (
        <div className="flex items-center justify-center gap-2 mt-12 select-none">
            {/* Previous */}
            <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 hover:bg-white/5 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white/60 hover:text-white"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-2">
                {paginationRange.map((pageNumber, idx) => {
                    if (pageNumber === 'DOTS') {
                        return (
                            <div key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-white/30">
                                <MoreHorizontal className="w-5 h-5" />
                            </div>
                        )
                    }

                    const isActive = pageNumber === currentPage
                    return (
                        <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber as number)}
                            className={`
                                w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all border
                                ${isActive
                                    ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-110'
                                    : 'bg-transparent text-white/60 border-transparent hover:bg-white/5 hover:border-white/10 hover:text-white'}
                            `}
                        >
                            {pageNumber}
                        </button>
                    )
                })}
            </div>

            {/* Next */}
            <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 hover:bg-white/5 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white/60 hover:text-white"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    )
}
