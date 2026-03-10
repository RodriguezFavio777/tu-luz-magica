'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import { startSessionTimer, clearSessionTimer } from '@/lib/supabase'

interface AuthContextType {
    user: User | null
    session: Session | null
    role: string | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [role, setRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // Using a memoized client to avoid multi-init within this component
    const [supabase] = useState(() => createClient())

    const handleSessionExpiry = useCallback(() => {
        console.warn('🔑 Session expired, signing out and cleaning cookies...')
        setUser(null)
        setSession(null)
        setRole(null)
        // Attempt to sign out silently
        supabase.auth.signOut().catch(() => { })

        if (typeof window !== 'undefined') {
            // Force clear cookies and storage manually for Next.js 13+ safety
            document.cookie.split(";").forEach(function (c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('sb-')) localStorage.removeItem(key)
            })
            window.location.href = '/ingresar'
        }
    }, [supabase])

    const fetchRole = useCallback(async (userId: string, email?: string) => {
        // 1. Instant check for hardcoded admins to avoid DB hang/RLS recursion
        const adminEmails = ['garrocamilalorena@gmail.com', 'rodriguezfavio5@gmail.com']
        if (email && adminEmails.includes(email)) {
            setRole('admin')
            return
        }

        try {
            // 2. Normal check for others
            const { data, error } = await Promise.race([
                supabase.from('profiles').select('role').eq('id', userId).single(),
                new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Fetch Role timeout')), 5000))
            ])

            if (error) {
                console.error('Fetch role error:', error)
                setRole('user')
            } else {
                setRole(data?.role || 'user')
            }
        } catch (err) {
            console.error('Error fetching role (timeout or failure):', err)
            setRole('user')
        }
    }, [supabase])

    useEffect(() => {
        let mounted = true

        const loadSession = async () => {
            try {
                const { data: { session: currentSession }, error } = await supabase.auth.getSession()
                if (error) console.error('Get initial session error:', error)

                if (mounted) {
                    setSession(currentSession)
                    setUser(currentSession?.user ?? null)

                    if (currentSession?.user) {
                        // Pass email to skip DB query if it's a known admin
                        await fetchRole(currentSession.user.id, currentSession.user.email)
                        startSessionTimer(handleSessionExpiry)
                    } else {
                        setRole(null)
                        clearSessionTimer()
                    }
                }
            } catch (err) {
                console.error('Session loading failed:', err)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        loadSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {

                if (!mounted) return

                try {
                    // Safety check: ensure currentSession is an object, not a string from corrupted storage
                    const validSession = typeof currentSession === 'object' && currentSession !== null ? currentSession : null

                    setSession(validSession)
                    setUser(validSession?.user ?? null)

                    if (validSession?.user) {
                        await fetchRole(validSession.user.id, validSession.user.email)
                        startSessionTimer(handleSessionExpiry)
                    } else {
                        setRole(null)
                        setSession(null)
                        setUser(null)
                        clearSessionTimer()
                    }
                } catch (e) {
                    console.error('Error in onAuthStateChange:', e)
                } finally {
                    setLoading(false)
                }
            }
        )

        return () => {
            mounted = false
            subscription.unsubscribe()
            clearSessionTimer()
        }
    }, [supabase, handleSessionExpiry, fetchRole])

    const signOut = async () => {
        setLoading(true) // Show loading during logout
        try {
            // 1. Force clear local storage first
            if (typeof window !== 'undefined') {
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('sb-')) localStorage.removeItem(key)
                })
                // 2. Clear known cookies (sb-token etc)
                document.cookie.split(";").forEach(function (c) {
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });
            }

            // 3. Attempt to sign out from Supabase with a realistic timeout
            await Promise.race([
                supabase.auth.signOut(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('SignOut timeout')), 5000))
            ]).catch(e => {
                console.warn('SignOut API failed, proceeding with local cleanup:', e)
            })

        } catch (e) {
            console.error('SignOut critical error:', e)
        } finally {
            // 4. Force state reset
            setUser(null)
            setSession(null)
            setRole(null)
            setLoading(false)

            // 5. CRITICAL: Forzar recarga total de la ventana para limpiar el cache del cliente y servidor
            if (typeof window !== 'undefined') {
                window.location.href = '/'
            }
        }
    }

    return (
        <AuthContext.Provider value={{ user, session, role, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useGlobalAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useGlobalAuth must be used within an AuthProvider')
    }
    return context
}
