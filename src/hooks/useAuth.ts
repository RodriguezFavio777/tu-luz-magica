'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
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

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    return {
        user,
        session,
        loading,
        signInWithGoogle,
        signInWithPassword,
        signUpWithPassword,
        signOut
    }
}
