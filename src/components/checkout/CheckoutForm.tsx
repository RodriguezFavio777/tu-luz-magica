'use client'

import React, { useState } from 'react'
import { useCheckout, useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, Truck, CreditCard, User, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function CheckoutForm() {
    const { items, subtotal, shippingCost, total, requiresShipping, hasMixedCart } = useCheckout()
    const { clearCart } = useCart()
    const { user, signInWithGoogle, signInWithPassword, signUpWithPassword } = useAuth()
    const router = useRouter()
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
    const [authData, setAuthData] = useState({ email: '', password: '' })
    const [authError, setAuthError] = useState('')
    const [isGuest, setIsGuest] = useState(false)

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setAuthError('')
        try {
            if (authMode === 'login') {
                await signInWithPassword(authData.email, authData.password)
            } else {
                await signUpWithPassword(authData.email, authData.password)
                // If sign up successful but no auto-login (email confirm needed), prompt user
                if (!user) {
                    alert('Cuenta creada. Por favor verifica tu correo o inicia sesión.')
                    setAuthMode('login')
                }
            }
        } catch (err: any) {
            setAuthError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGuestCheckout = () => {
        setIsGuest(true)
        setStep(requiresShipping ? 'shipping' : 'payment')
    }

    const [step, setStep] = useState<'auth' | 'shipping' | 'payment' | 'success'>('auth')
    const [loading, setLoading] = useState(false)
    const [shippingData, setShippingData] = useState({
        fullName: '',
        address: '',
        city: '',
        zip: '',
        phone: ''
    })

    // Fetch profile data if user logs in
    React.useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return

            const supabase = createClient()
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profile) {
                setShippingData(prev => ({
                    ...prev,
                    fullName: profile.full_name || '',
                    phone: profile.phone || '',
                    address: profile.shipping_address || '',
                    city: profile.shipping_city || '',
                    zip: profile.shipping_zip || ''
                }))
            }
        }

        fetchProfile()
    }, [user])

    // Skip auth step if user already logged in, or determine initial step
    React.useEffect(() => {
        if (user && step === 'auth') {
            setStep(requiresShipping ? 'shipping' : 'payment')
        }
    }, [user, requiresShipping, step])

    const handleShippingSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setStep('payment')
    }

    const handlePayment = async () => {
        setLoading(true)

        try {
            // Call the API endpoint
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user?.id || null,
                    items,
                    subtotal,
                    shipping_cost: requiresShipping ? shippingCost : 0,
                    total,
                    requires_shipping: requiresShipping,
                    shipping_address: shippingData.address,
                    shipping_city: shippingData.city,
                    shipping_postal_code: shippingData.zip,
                    fullName: shippingData.fullName,
                    email: user?.email, // Send email for Calendar Invite (if logged in)
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al procesar el pedido')
            }

            // Success
            setStep('success')

            // WhatsApp Logic
            const orderId = data.orderId || 'PENDIENTE'

            const message = encodeURIComponent(`Hola Camí! ✨ Nuevo pedido #${orderId.slice(0, 8)}.
            
Nombre: ${shippingData.fullName || user?.email || 'Anónimo'}
Total: $${total.toLocaleString('es-AR')}
            
Detalle:
${items.map(i => `- ${i.quantity}x ${i.name} ${i.variantName ? `(${i.variantName})` : ''}`).join('\n')}
            
${requiresShipping ? `Envío a: ${shippingData.city}` : 'Pedido Digital'}
            `)

            const waLink = `https://wa.me/5491137017109?text=${message}`

            setTimeout(() => {
                clearCart()
                window.open(waLink, '_blank')
            }, 1000)

        } catch (error: any) {
            console.error('Error creating order:', error)
            alert(error.message || 'Hubo un error al procesar el pedido. Por favor intenta nuevamente.')
        } finally {
            setLoading(false)
        }
    }

    if (items.length === 0 && step !== 'success') {
        return <div className="text-white">Tu carrito está vacío.</div>
    }

    return (
        <div className="bg-[#1d1520] border border-white/5 rounded-3xl p-8 relative overflow-hidden">
            {/* Progress Steps */}
            <div className="flex justify-between mb-8 relative z-10">
                {['auth', 'shipping', 'payment'].map((s, i) => {
                    const isActive = step === s
                    const isCompleted = ['auth', 'shipping', 'payment', 'success'].indexOf(step) > i

                    if (s === 'shipping' && !requiresShipping) return null

                    return (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isActive ? 'bg-primary text-white' :
                                isCompleted ? 'bg-green-500 text-white' : 'bg-white/10 text-white/50'
                                }`}>
                                {isCompleted ? <CheckCircle className="w-4 h-4" /> : i + 1}
                            </div>
                            <span className={`text-sm uppercase font-bold ${isActive ? 'text-white' : 'text-white/40'}`}>
                                {s === 'auth' ? 'Cuenta' : s === 'shipping' ? 'Envío' : 'Pago'}
                            </span>
                        </div>
                    )
                })}
            </div>

            <div className="h-px w-full bg-white/5 mb-8" />

            <AnimatePresence mode="wait">

                {/* Step 1: Auth */}
                {step === 'auth' && (
                    <motion.div
                        key="auth"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="text-center py-10"
                    >
                        <User className="w-16 h-16 text-primary mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Bienvenida</h3>
                        <p className="text-white/60 mb-8 max-w-md mx-auto">
                            Inicia sesión o regístrate para continuar.
                        </p>

                        <div className="max-w-md mx-auto bg-white/5 p-6 rounded-2xl">
                            <div className="flex gap-4 mb-6 border-b border-white/10">
                                <button
                                    className={`pb-2 text-sm font-bold flex-1 ${authMode === 'login' ? 'text-primary border-b-2 border-primary' : 'text-white/40'}`}
                                    onClick={() => setAuthMode('login')}
                                >
                                    Iniciar Sesión
                                </button>
                                <button
                                    className={`pb-2 text-sm font-bold flex-1 ${authMode === 'register' ? 'text-primary border-b-2 border-primary' : 'text-white/40'}`}
                                    onClick={() => setAuthMode('register')}
                                >
                                    Registrarse
                                </button>
                            </div>

                            <form onSubmit={handleAuthSubmit} className="space-y-4 mb-6">
                                <input
                                    type="email"
                                    placeholder="Correo Electrónico"
                                    required
                                    value={authData.email}
                                    onChange={e => setAuthData({ ...authData, email: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary/50 outline-hidden"
                                />
                                <input
                                    type="password"
                                    placeholder="Contraseña"
                                    required
                                    value={authData.password}
                                    onChange={e => setAuthData({ ...authData, password: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary/50 outline-hidden"
                                />

                                {authError && <p className="text-red-400 text-xs">{authError}</p>}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#f472b6] hover:bg-[#ec4899] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#f472b6]/20"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {authMode === 'login' ? 'Ingresar' : 'Crear Cuenta'}
                                </button>
                            </form>

                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#241a27] px-2 text-white/40">O continúa con</span></div>
                            </div>

                            <button
                                onClick={() => signInWithGoogle()}
                                className="w-full bg-white text-black hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
                            >
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                                Google
                            </button>

                            <button
                                onClick={handleGuestCheckout}
                                className="w-full text-white/40 hover:text-white text-sm hover:underline transition-colors"
                            >
                                Continuar como Invitado
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Shipping */}
                {step === 'shipping' && (
                    <motion.div
                        key="shipping"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <Truck className="text-primary" />
                            Datos de Envío
                        </h3>

                        <form onSubmit={handleShippingSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Nombre Completo</label>
                                    <input
                                        required
                                        type="text"
                                        value={shippingData.fullName}
                                        onChange={e => setShippingData({ ...shippingData, fullName: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 transition-colors"
                                        placeholder="Ej: Juan Pérez"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Teléfono</label>
                                    <input
                                        required
                                        type="tel"
                                        value={shippingData.phone}
                                        onChange={e => setShippingData({ ...shippingData, phone: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 transition-colors"
                                        placeholder="+54 11 ..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Dirección</label>
                                <input
                                    required
                                    type="text"
                                    value={shippingData.address}
                                    onChange={e => setShippingData({ ...shippingData, address: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 transition-colors"
                                    placeholder="Calle 123, Piso 4..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Ciudad</label>
                                    <input
                                        required
                                        type="text"
                                        value={shippingData.city}
                                        onChange={e => setShippingData({ ...shippingData, city: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 transition-colors"
                                        placeholder="Buenos Aires"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Código Postal</label>
                                    <input
                                        required
                                        type="text"
                                        value={shippingData.zip}
                                        onChange={e => setShippingData({ ...shippingData, zip: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 transition-colors"
                                        placeholder="1234"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl mt-6 transition-colors shadow-lg shadow-primary/20"
                            >
                                Continuar al Pago
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* Step 3: Payment */}
                {step === 'payment' && (
                    <motion.div
                        key="payment"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <CreditCard className="text-primary" />
                            Confirmar y Pagar
                        </h3>

                        <div className="bg-white/5 rounded-xl p-6 mb-6">
                            <h4 className="font-bold text-white mb-4">Resumen</h4>
                            <div className="flex justify-between text-white/60 mb-2">
                                <span>Subtotal</span>
                                <span>${subtotal.toLocaleString('es-AR')}</span>
                            </div>
                            {requiresShipping && (
                                <div className="flex justify-between text-white/60 mb-2">
                                    <span>Envío</span>
                                    <span>${shippingCost.toLocaleString('es-AR')}</span>
                                </div>
                            )}
                            <div className="h-px bg-white/10 my-4" />
                            <div className="flex justify-between text-xl font-bold text-white">
                                <span>Total</span>
                                <span>${total.toLocaleString('es-AR')}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-green-500/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png" className="h-6 w-6" alt="WA" />
                                    Confirmar Pedido por WhatsApp
                                </>
                            )}
                        </button>
                        <p className="text-center text-white/30 text-xs mt-4">
                            Se abrirá WhatsApp para enviar los detalles de tu pedido a Camí.
                        </p>
                    </motion.div>
                )}

                {/* Step 4: Success */}
                {step === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-10"
                    >
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-4">¡Pago Exitoso!</h3>
                        <p className="text-white/60 mb-8 max-w-md mx-auto">
                            Gracias por tu compra. Te hemos enviado un correo con los detalles de tu pedido.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-xl transition-colors"
                        >
                            Volver al Inicio
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    )
}
