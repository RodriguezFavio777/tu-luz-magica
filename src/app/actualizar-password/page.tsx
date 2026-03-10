'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { KeyRound, ArrowRight } from 'lucide-react'
import { useLoadingStore } from '@/store/useLoadingStore'

export default function UpdatePasswordPage() {
    const { showLoading, hideLoading } = useLoadingStore()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // Verificar si hay una sesión activa (el usuario llegó por el link de recuperación)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                // If there's no session, there might be a hash fragment from the email link that Supabase client will process automatically, let's wait a bit and recheck
                setTimeout(async () => {
                    const { data: { session: delayedSession } } = await supabase.auth.getSession()
                    if (!delayedSession) {
                        setError('El enlace de recuperación es inválido o ha expirado. Por favor, solicita uno nuevo.')
                    }
                }, 1000)
            }
        }

        checkSession()
    }, [supabase.auth])

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setMessage(null)

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            return
        }

        setLoading(true)
        showLoading('Actualizando tu contraseña...')

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            setMessage('Contraseña actualizada exitosamente. Redirigiendo...')

            setTimeout(() => {
                router.push('/ingresar')
            }, 2000)

        } catch (error: unknown) {
            console.error('Update password error:', error)
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError('Error al actualizar la contraseña')
            }
        } finally {
            setLoading(false)
            hideLoading()
        }
    }

    return (
        <main className="min-h-screen bg-[#0a080c] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="bg-[#1d1520] border border-white/5 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                            <KeyRound className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold text-white font-display">
                            Nueva Contraseña
                        </h2>
                        <p className="text-white/60 mt-2 text-sm">
                            Ingresa tu nueva contraseña para acceder a tu cuenta.
                        </p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                placeholder="Nueva contraseña"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#151018] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/40 focus:outline-hidden focus:border-primary/50 transition-colors"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Confirmar nueva contraseña"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-[#151018] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/40 focus:outline-hidden focus:border-primary/50 transition-colors"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Actualizar Contraseña
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-white/5 pt-6">
                        <Link href="/ingresar" className="text-white/60 hover:text-white transition-colors text-sm">
                            Volver a Iniciar Sesión
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}
