'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, role, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/ingresar')
            } else if (role !== 'admin') {
                router.push('/')
            }
        }
    }, [user, role, loading, router])


    if (loading || !user || role !== 'admin') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/70 animate-pulse font-medium tracking-widest uppercase">Verificando Acceso...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Content Area */}
            <div className="flex-1 lg:ml-64 h-screen overflow-y-auto">
                <main
                    key={pathname}
                    className="p-4 md:p-8 max-w-7xl mx-auto pt-24 lg:pt-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                    {children}
                </main>
            </div>
        </div>
    )
}
