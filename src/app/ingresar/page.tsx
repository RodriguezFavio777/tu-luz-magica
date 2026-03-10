'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lock, Mail, Loader } from 'lucide-react'
import { TriquetaLogo } from '@/components/ui/TriquetaLogo'
import { useAuth } from '@/hooks/useAuth'
import { useLoadingStore } from '@/store/useLoadingStore'

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user, loading: authLoading } = useAuth()
    const { showLoading, hideLoading } = useLoadingStore()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [localLoading, setLocalLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isRecovering, setIsRecovering] = useState(false)
    const [recoverSuccess, setRecoverSuccess] = useState(false)

    const supabase = createClient()

    // 1. Auto-redirect if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            hideLoading() // Ensure loader is hidden before redirecting
            const redirectUrl = searchParams.get('redirect') || '/'
            router.push(redirectUrl)
        }
    }, [user, authLoading, router, searchParams, hideLoading])

    // 2. Extra safety: hide loader if component unmounts
    useEffect(() => {
        return () => hideLoading()
    }, [hideLoading])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLocalLoading(true)
        setError(null)
        showLoading('Validando tus credenciales...')

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                if (error.message === 'Failed to fetch') {
                    setError('Error de conexión. Tu base de datos puede estar pausada. Por favor, reintenta en unos momentos.')
                } else if (error.message.includes('Invalid login credentials')) {
                    setError('Credenciales incorrectas. Verifica tu correo y contraseña.')
                } else {
                    setError(error.message)
                }
                setLocalLoading(false)
                hideLoading()
            } else {
                // We don't hideLoading() here because the useEffect will handle redirection
                // and we want the loader to stay until the new page is ready.
                // UNLESS the redirect is to the same page, which shouldn't happen.
                // Actually, let's refresh to ensure state is clean
                router.refresh()
            }
        } catch (err) {
            console.error('Login error:', err)
            setError('Ocurrió un error inesperado.')
            setLocalLoading(false)
            hideLoading()
        }
    }

    const handleRecoverPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLocalLoading(true)
        setError(null)
        showLoading('Enviando enlace mágico...')

        if (!email) {
            setError('Por favor ingresa tu correo electrónico.')
            setLocalLoading(false)
            hideLoading()
            return
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/actualizar-password`,
            })

            if (error) {
                setError(error.message)
            } else {
                setRecoverSuccess(true)
            }
        } catch (err) {
            console.error('Recover password error:', err)
            setError('Error al enviar el correo.')
        } finally {
            setLocalLoading(false)
            hideLoading()
        }
    }

    const handleGoogleLogin = async () => {
        setLocalLoading(true)
        showLoading('Conectando con Google...')
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        if (error) {
            setError(error.message)
            setLocalLoading(false)
            hideLoading()
        }
    }

    // While auth is loading from session, we show nothing or a small spinner
    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    // If already logged in, show nothing (redirecting)
    if (user) return null

    if (recoverSuccess) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden pt-32">
                <div className="relative z-10 w-full max-w-md bg-surface border border-white/10 p-8 rounded-3xl shadow-2xl text-center">
                    <h2 className="text-2xl font-bold text-white mb-4 italic font-display tracking-tight">Revisa tu correo</h2>
                    <p className="text-white/60 mb-8 font-light leading-relaxed">
                        Te hemos enviado un enlace mágico para restablecer tu contraseña. Revisa también tu carpeta de spam.
                    </p>
                    <button
                        onClick={() => { setRecoverSuccess(false); setIsRecovering(false) }}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(244,114,182,0.3)] transition-all active:scale-95 uppercase tracking-widest text-xs"
                    >
                        Volver a iniciar sesión
                    </button>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden pt-32">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>

            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

            <div className="relative z-10 w-full max-w-md bg-surface border border-white/10 p-8 rounded-3xl shadow-2xl overflow-hidden group">
                {/* Decorative border gradient */}
                <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                <div className="relative z-10 text-center mb-8">
                    <div className="inline-flex justify-center mb-6 relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                        <TriquetaLogo size={44} />
                    </div>
                    <h1 className="text-3xl font-bold text-white font-display mb-3 tracking-tight italic">
                        {isRecovering ? 'Recuperar Magia' : 'Bienvenida de nuevo'}
                    </h1>
                    <p className="text-white/50 text-sm font-light leading-relaxed px-4">
                        {isRecovering ? 'Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.' : 'Ingresa a tu cuenta para gestionar tus pedidos y citas mágicas.'}
                    </p>
                </div>

                {isRecovering ? (
                    <form onSubmit={handleRecoverPassword} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] pl-1">Correo Electrónico</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0a080c]/50 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-hidden focus:border-primary/30 focus:bg-[#0a080c]/80 transition-all text-sm"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl text-center animate-in fade-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={localLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(244,114,182,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
                        >
                            {localLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Enviar enlace mágico'}
                        </button>

                        <div className="mt-4 text-center">
                            <button type="button" onClick={() => { setIsRecovering(false); setError(null) }} className="text-white/30 hover:text-white text-xs transition-colors font-medium">
                                Volver a Iniciar Sesión
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] pl-1">Correo Electrónico</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-surface-accent/50 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-hidden focus:border-primary/30 focus:bg-surface-accent/80 transition-all text-sm"
                                        placeholder="tu@email.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center pr-1">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] pl-1">Contraseña</label>
                                    <button type="button" onClick={() => { setIsRecovering(true); setError(null) }} className="text-[10px] text-primary hover:text-primary/80 tracking-widest uppercase font-bold transition-colors">¿Olvidaste tu clave?</button>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-surface-accent/50 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-hidden focus:border-primary/30 focus:bg-surface-accent/80 transition-all text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl text-center animate-in fade-in slide-in-from-top-1">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={localLoading}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(244,114,182,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
                            >
                                {localLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Ingresar'}
                            </button>
                        </form>

                        <div className="relative my-10">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
                                <span className="bg-surface px-6 text-white/20 font-bold">O continúa con</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            type="button"
                            className="w-full bg-white hover:bg-white/90 text-black font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.15em] text-[10px]"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </button>

                        <div className="mt-10 text-center">
                            <p className="text-white/30 text-xs font-light tracking-wide">
                                ¿No tienes una cuenta? {' '}
                                <Link href="/registrarse" className="text-primary hover:text-primary/80 underline-offset-4 font-bold transition-colors">
                                    Regístrate aquí
                                </Link>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </main>
    )
}
