'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lock, Mail, User, Loader, ArrowLeft } from 'lucide-react'
import { TriquetaLogo } from '@/components/ui/TriquetaLogo'

export default function RegisterPage() {
    const router = useRouter()
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const supabase = createClient()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        })

        if (error) {
            if (error.message === 'Failed to fetch') {
                setError('Error de conexión. Tu base de datos puede estar pausada por inactividad. Inicia sesión en Supabase para restaurarla.')
            } else if (error.message.includes('User already registered')) {
                setError('Este correo ya está registrado. Por favor, inicia sesión.')
            } else {
                setError(error.message)
            }
            setLoading(false)
        } else {
            setSuccess(true)
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
        if (error) {
            setError(error.message)
            setLoading(false)
        }
    }

    if (success) {
        return (
            <main className="min-h-screen bg-[#0a080c] flex items-center justify-center p-4 relative overflow-hidden pt-32">
                <div className="relative z-10 w-full max-w-md bg-[#1d1520] border border-white/10 p-8 rounded-3xl shadow-2xl text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">¡Te hemos enviado un correo!</h2>
                    <p className="text-white/60 mb-8">
                        Por favor revisa tu bandeja de entrada (y spam) para confirmar tu cuenta mágica.
                    </p>
                    <Link href="/ingresar" className="text-primary hover:underline font-bold">
                        Volver a iniciar sesión
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-[#0a080c] flex items-center justify-center p-4 relative overflow-hidden pt-32">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>

            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md bg-[#1d1520] border border-white/10 p-8 rounded-3xl shadow-2xl">
                <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Volver</span>
                </Link>

                <div className="text-center mb-8">
                    <div className="inline-flex justify-center mb-4">
                        <TriquetaLogo size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-white font-display mb-2">Únete a la Magia</h1>
                    <p className="text-white/50 text-sm">Crea tu cuenta para comenzar tu viaje espiritual.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">Nombre Completo</label>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 w-5 h-5 text-white/30" />
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-[#151018] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-hidden focus:border-primary/50 transition-colors"
                                placeholder="Tu Nombre Mágico"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-white/30" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#151018] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-hidden focus:border-primary/50 transition-colors"
                                placeholder="tu@email.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-white/30" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#151018] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-hidden focus:border-primary/50 transition-colors"
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Registrarse'}
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wider">
                        <span className="bg-[#1d1520] px-4 text-white/30 font-bold">O regístrate con</span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-3"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
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

                <div className="mt-8 text-center">
                    <p className="text-white/40 text-sm">
                        ¿Ya tienes cuenta? {' '}
                        <Link href="/ingresar" className="text-primary hover:underline font-bold">
                            Ingresa aquí
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    )
}
