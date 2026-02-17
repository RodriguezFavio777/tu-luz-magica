'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function BackToStoreButton() {
    const router = useRouter()

    const handleBack = () => {
        // Try to go back if we came from within the site
        if (typeof window !== 'undefined' && window.history.length > 1 && document.referrer.includes(window.location.host)) {
            router.back()
        } else {
            // Fallback to main store page
            router.push('/productos')
        }
    }

    return (
        <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors cursor-pointer"
        >
            <ArrowLeft className="w-4 h-4" />
            Volver a la Tienda
        </button>
    )
}
