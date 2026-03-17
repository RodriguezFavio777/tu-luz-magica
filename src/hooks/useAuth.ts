'use client'

import { useGlobalAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'

export function useAuth() {
    const { user, session, role, loading, signOut: contextSignOut } = useGlobalAuth()
    const supabase = createClient()

    const signInWithGoogle = async (next?: string) => {
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        const redirectTo = next
            ? `${origin}/auth/callback?next=${encodeURIComponent(next)}`
            : `${origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
            },
        })
        if (error) console.error('Google Auth Error:', error)
    }

    const signInWithPassword = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (error) throw error
    }

    const signUpWithPassword = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`
            }
        })
        if (error) throw error
    }

    return {
        user,
        session,
        role,
        loading,
        signInWithGoogle,
        signInWithPassword,
        signUpWithPassword,
        signOut: contextSignOut
    }
}
