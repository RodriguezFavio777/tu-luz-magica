'use client'

import { useEffect, useTransition } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useLoadingStore } from '@/store/useLoadingStore'

export function NavigationLoader() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { hideLoading, showLoading } = useLoadingStore()

    // Clear loading state when pathname or searchParams change
    useEffect(() => {
        hideLoading()
    }, [pathname, searchParams, hideLoading])

    useEffect(() => {
        const handleAnchorClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            const anchor = target.closest('a')

            if (anchor && anchor instanceof HTMLAnchorElement) {
                const href = anchor.getAttribute('href')

                // Safety checks
                if (!href) return;

                const isExternal = anchor.getAttribute('target') === '_blank' ||
                    href.startsWith('http') ||
                    href.startsWith('mailto:') ||
                    href.startsWith('tel:');
                const isAnchor = href.startsWith('#');

                // Compare with current full URL to avoid loading on current page clicks
                const currentFullUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
                const isSamePage = href === currentFullUrl || href === pathname;

                if (!isExternal && !isAnchor && !isSamePage) {
                    // Start loading for internal navigation
                    showLoading('Conectando con la magia...')
                }
            }
        }

        window.addEventListener('click', handleAnchorClick)
        return () => window.removeEventListener('click', handleAnchorClick)
    }, [pathname, searchParams, showLoading])

    return null
}
