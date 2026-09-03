'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useCheckout, useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, Truck, CreditCard, User, AlertCircle, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLoadingStore } from '@/store/useLoadingStore'

const PROVINCIAS = [
    { id: 'C', nombre: 'Capital Federal' }, { id: 'B', nombre: 'Buenos Aires' },
    { id: 'K', nombre: 'Catamarca' }, { id: 'H', nombre: 'Chaco' },
    { id: 'U', nombre: 'Chubut' }, { id: 'X', nombre: 'Córdoba' },
    { id: 'W', nombre: 'Corrientes' }, { id: 'E', nombre: 'Entre Ríos' },
    { id: 'P', nombre: 'Formosa' }, { id: 'Y', nombre: 'Jujuy' },
    { id: 'L', nombre: 'La Pampa' }, { id: 'F', nombre: 'La Rioja' },
    { id: 'M', nombre: 'Mendoza' }, { id: 'N', nombre: 'Misiones' },
    { id: 'Q', nombre: 'Neuquén' }, { id: 'R', nombre: 'Río Negro' },
    { id: 'A', nombre: 'Salta' }, { id: 'J', nombre: 'San Juan' },
    { id: 'D', nombre: 'San Luis' }, { id: 'Z', nombre: 'Santa Cruz' },
    { id: 'S', nombre: 'Santa Fe' }, { id: 'G', nombre: 'Santiago del Estero' },
    { id: 'V', nombre: 'Tierra del Fuego' }, { id: 'T', nombre: 'Tucumán' }
]

interface ShippingOption {
    valor: number;
    correo: { nombre: string };
    modalidad: string;
    horas_entrega: number;
}

export function CheckoutForm() {
    const { items, subtotal, requiresShipping } = useCheckout()
    const { clearCart } = useCart()
    const { user, signInWithGoogle, signInWithPassword, signUpWithPassword } = useAuth()
    const { showLoading, hideLoading } = useLoadingStore()
    const router = useRouter()

    // Auth States
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
    const [authData, setAuthData] = useState({ email: '', password: '' })
    const [authError, setAuthError] = useState('')

    // Flow States
    const [step, setStep] = useState<'auth' | 'shipping' | 'payment' | 'success'>('auth')
    const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'transfer'>('transfer')
    const [loading, setLoading] = useState(false)
    const [globalError, setGlobalError] = useState('')

    // Shipping Data with LocalStorage Persistence
    const [shippingData, setShippingData] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('checkout_shipping_data')
            if (saved) return JSON.parse(saved)
        }
        return {
            fullName: '',
            address: '',
            city: '',
            province: 'C',
            zip: '',
            phone: '',
            email: ''
        }
    })

    // Form Validation 
    const [formErrors, setFormErrors] = useState<Record<string, boolean>>({})

    // Shipping Options API
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
    const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null)
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false)

    // Custom Select Province Interface
    const [isProvinceSelectOpen, setIsProvinceSelectOpen] = useState(false)
    const selectRef = useRef<HTMLDivElement>(null)

    // Sync LocalStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('checkout_shipping_data', JSON.stringify(shippingData))
        }
    }, [shippingData])

    // Detect click outside for Custom Select
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsProvinceSelectOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setAuthError('')
        setGlobalError('')
        showLoading(authMode === 'login' ? 'Iniciando sesión...' : 'Registrando cuenta...')

        try {
            if (authMode === 'login') {
                await signInWithPassword(authData.email, authData.password)
            } else {
                await signUpWithPassword(authData.email, authData.password)
                if (!user) {
                    setGlobalError('Cuenta creada. Por favor verifica tu correo o inicia sesión.')
                    setAuthMode('login')
                }
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err)
            if (errorMessage === 'Failed to fetch') {
                setAuthError('Error de conexión. La base de datos puede estar pausada. Actívala en el panel de Supabase.')
            } else if (errorMessage.includes('Invalid login credentials')) {
                setAuthError('Credenciales incorrectas. Verifica tu correo y contraseña.')
            } else if (errorMessage.includes('User already registered')) {
                setAuthError('Este correo ya está registrado. Por favor, inicia sesión.')
            } else {
                setAuthError(errorMessage)
            }
        } finally {
            setLoading(false)
            hideLoading()
        }
    }

    const handleGuestCheckout = () => {
        setStep('shipping')
    }

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return

            const supabase = createClient()
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profile) {
                setShippingData((prev: { fullName: string, address: string, city: string, province: string, zip: string, phone: string, email: string }) => ({
                    ...prev,
                    fullName: prev.fullName || profile.full_name || '',
                    phone: prev.phone || profile.phone || '',
                    email: prev.email || profile.email || user.email || '',
                    address: prev.address || profile.shipping_address || '',
                    city: prev.city || profile.shipping_city || '',
                    zip: prev.zip || profile.shipping_zip || ''
                }))
            }
        }

        fetchProfile()
    }, [user])

    useEffect(() => {
        if (user && step === 'auth') {
            setStep('shipping')
        }
    }, [user, step])

    const validateForm = () => {
        const errors: Record<string, boolean> = {}
        if (!shippingData.fullName.trim()) errors.fullName = true
        if (!shippingData.phone.trim()) errors.phone = true
        if (!shippingData.email.trim() || !shippingData.email.includes('@')) errors.email = true

        if (requiresShipping) {
            if (!shippingData.address.trim()) errors.address = true
            if (!shippingData.city.trim()) errors.city = true
            if (!shippingData.zip.trim()) errors.zip = true
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleShippingSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setGlobalError('')

        if (!validateForm()) {
            setGlobalError('Por favor completa todos los campos requeridos marcados en rojo.')
            return
        }

        if (requiresShipping) {
            setIsCalculatingShipping(true)
            showLoading('Cotizando tu envío...')
            try {
                const response = await fetch('/api/shipping', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        province: shippingData.province,
                        zipcode: shippingData.zip,
                        weight: items.reduce((acc, item) => acc + (item.quantity * 1), 0) // Basic weight estimation
                    })
                })

                const data = await response.json()
                if (!response.ok) throw new Error(data.error || 'Error cotizando envío')

                // Filter valid options and sort by price
                const validOptions = (data as ShippingOption[]).filter(opt => opt.valor > 0).sort((a, b) => a.valor - b.valor)

                if (validOptions.length === 0) {
                    throw new Error('No hay opciones de envío disponibles para este código postal. Selecciona "Coordinar envío".')
                }

                setShippingOptions(validOptions)
                setSelectedShipping(validOptions[0]) // Select cheapest by default

            } catch (err: unknown) {
                console.error('Shipping quote error:', err)
                const errorMessage = err instanceof Error ? err.message : String(err)
                setGlobalError(errorMessage || 'Error calculando el costo de envío. Por favor, verifica tu código postal.')

                // Allow fallback if Enviopack fails
                setShippingOptions([{
                    valor: 0,
                    correo: { nombre: 'Coordinar con Cami' },
                    modalidad: 'S',
                    horas_entrega: 0
                }])
                setSelectedShipping({
                    valor: 0,
                    correo: { nombre: 'Coordinar con Cami' },
                    modalidad: 'S',
                    horas_entrega: 0
                })
            } finally {
                setIsCalculatingShipping(false)
                hideLoading()
            }
        }

        setStep('payment')
    }

    const handlePayment = async () => {
        setLoading(true)
        showLoading(paymentMethod === 'mercadopago' ? 'Iniciando pago con Mercado Pago...' : 'Confirmando tu pedido...')

        try {
            const shippingCost = requiresShipping && selectedShipping ? selectedShipping.valor : 0
            const calculatedTotal = subtotal + shippingCost

            // 1. Call the API endpoint to create order and preference
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user?.id || null,
                    items,
                    subtotal,
                    shipping_cost: shippingCost,
                    total: calculatedTotal,
                    requires_shipping: requiresShipping,
                    shipping_address: shippingData.address,
                    shipping_city: shippingData.city,
                    shipping_province: shippingData.province,
                    shipping_postal_code: shippingData.zip,
                    fullName: shippingData.fullName,
                    email: shippingData.email,
                    phone: shippingData.phone,
                    payment_method: paymentMethod
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al procesar el pedido')
            }

            const orderId = data.orderId || 'PENDIENTE'

            if (paymentMethod === 'mercadopago') {
                // If preference was returned by /api/checkout, or fallback to /api/checkout/mercadopago
                let redirectUrl = data.sandbox_init_point || data.init_point
                if (!redirectUrl) {
                    const mpRes = await fetch('/api/checkout/mercadopago', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            orderId,
                            items,
                            shipping_cost: shippingCost,
                            customer: {
                                fullName: shippingData.fullName,
                                email: shippingData.email,
                                phone: shippingData.phone
                            }
                        })
                    })
                    if (!mpRes.ok) {
                        const mpErr = await mpRes.json().catch(() => ({}))
                        throw new Error(mpErr.error || 'No se pudo generar el enlace de pago de Mercado Pago. Por favor reintenta.')
                    }
                    const mpData = await mpRes.json()
                    redirectUrl = mpData.sandbox_init_point || mpData.init_point
                }

                if (!redirectUrl) {
                    throw new Error('No se pudo generar el enlace de pago de Mercado Pago. Por favor reintenta.')
                }

                // Preserve cart before redirect (recovery supported via /checkout/failure; /checkout/success clears cart on arrival)
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('checkout_shipping_data')
                    window.location.assign(redirectUrl)
                    return
                }
            } else {
                // WhatsApp Transfer Flow
                setStep('success')

                const message = encodeURIComponent(`✨ ¡Hola Camí! ✨
Te escribo porque quiero avanzar con mi pedido #${orderId.slice(0, 8)}.

👤 Nombre: ${shippingData.fullName || user?.email || 'Anónimo'}
💰 Monto a Pagar: $${calculatedTotal.toLocaleString('es-AR')}

¿Me pasas los datos para realizar la transferencia? ¡Gracias!`)

                const waLink = `https://wa.me/5491137017109?text=${message}`

                setTimeout(() => {
                    clearCart()
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('checkout_shipping_data')
                        window.location.assign(waLink)
                    }
                }, 1000)
            }
        } catch (error: unknown) {
            console.error('Error creating order:', error)
            const errorMessage = error instanceof Error ? error.message : String(error)
            setGlobalError(errorMessage || 'Hubo un error al procesar el pedido. Por favor intenta nuevamente.')
        } finally {
            setLoading(false)
            hideLoading()
        }
    }

    if (items.length === 0 && step !== 'success') {
        return <div className="text-white">Tu carrito está vacío.</div>
    }

    return (
        <div className="bg-surface border border-white/5 rounded-3xl p-8 relative overflow-hidden">
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

            {globalError && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{globalError}</p>
                </div>
            )}

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
                                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20"
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
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                </svg>
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
                            {requiresShipping ? 'Datos de Envío' : 'Tus Datos'}
                        </h3>

                        <form onSubmit={handleShippingSubmit} className="space-y-4" noValidate>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Nombre Completo</label>
                                    <input
                                        type="text"
                                        value={shippingData.fullName}
                                        onChange={e => {
                                            setShippingData({ ...shippingData, fullName: e.target.value })
                                            if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: false })
                                        }}
                                        className={`w-full bg-white/5 border ${formErrors.fullName ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary/50'} rounded-xl px-4 py-3 text-white focus:outline-hidden transition-colors`}
                                        placeholder="Ej: Juan Pérez"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Teléfono</label>
                                    <input
                                        type="tel"
                                        value={shippingData.phone}
                                        onChange={e => {
                                            setShippingData({ ...shippingData, phone: e.target.value })
                                            if (formErrors.phone) setFormErrors({ ...formErrors, phone: false })
                                        }}
                                        className={`w-full bg-white/5 border ${formErrors.phone ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary/50'} rounded-xl px-4 py-3 text-white focus:outline-hidden transition-colors`}
                                        placeholder="+54 11 ..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Email</label>
                                <input
                                    type="email"
                                    value={shippingData.email}
                                    onChange={e => {
                                        setShippingData({ ...shippingData, email: e.target.value })
                                        if (formErrors.email) setFormErrors({ ...formErrors, email: false })
                                    }}
                                    className={`w-full bg-white/5 border ${formErrors.email ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary/50'} rounded-xl px-4 py-3 text-white focus:outline-hidden transition-colors`}
                                    placeholder="Ej: juan@gmail.com"
                                />
                            </div>

                            {requiresShipping && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Dirección</label>
                                        <input
                                            type="text"
                                            value={shippingData.address}
                                            onChange={e => {
                                                setShippingData({ ...shippingData, address: e.target.value })
                                                if (formErrors.address) setFormErrors({ ...formErrors, address: false })
                                            }}
                                            className={`w-full bg-white/5 border ${formErrors.address ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary/50'} rounded-xl px-4 py-3 text-white focus:outline-hidden transition-colors`}
                                            placeholder="Calle 123, Piso 4..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 relative" ref={selectRef}>
                                            <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Provincia</label>

                                            <div
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white flex justify-between items-center cursor-pointer hover:border-white/20 transition-colors"
                                                onClick={() => setIsProvinceSelectOpen(!isProvinceSelectOpen)}
                                            >
                                                <span className="truncate">{PROVINCIAS.find(p => p.id === shippingData.province)?.nombre || 'Seleccionar...'}</span>
                                                <ChevronDown className="w-5 h-5 text-white/50" />
                                            </div>

                                            <AnimatePresence>
                                                {isProvinceSelectOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="absolute top-full left-0 w-full mt-2 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto"
                                                    >
                                                        {PROVINCIAS.map((prov) => (
                                                            <div
                                                                key={prov.id}
                                                                className="px-4 py-3 hover:bg-white/5 text-white cursor-pointer transition-colors text-sm"
                                                                onClick={() => {
                                                                    setShippingData({ ...shippingData, province: prov.id })
                                                                    setIsProvinceSelectOpen(false)
                                                                }}
                                                            >
                                                                {prov.nombre}
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Ciudad</label>
                                            <input
                                                type="text"
                                                value={shippingData.city}
                                                onChange={e => {
                                                    setShippingData({ ...shippingData, city: e.target.value })
                                                    if (formErrors.city) setFormErrors({ ...formErrors, city: false })
                                                }}
                                                className={`w-full bg-white/5 border ${formErrors.city ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary/50'} rounded-xl px-4 py-3 text-white focus:outline-hidden transition-colors`}
                                                placeholder="Buenos Aires"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Código Postal</label>
                                            <input
                                                type="text"
                                                value={shippingData.zip}
                                                onChange={e => {
                                                    setShippingData({ ...shippingData, zip: e.target.value })
                                                    if (formErrors.zip) setFormErrors({ ...formErrors, zip: false })
                                                }}
                                                className={`w-full bg-white/5 border ${formErrors.zip ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary/50'} rounded-xl px-4 py-3 text-white focus:outline-hidden transition-colors`}
                                                placeholder="1234"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <button
                                type="submit"
                                disabled={isCalculatingShipping}
                                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl mt-6 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                {isCalculatingShipping && <Loader2 className="w-5 h-5 animate-spin" />}
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

                            {requiresShipping && shippingOptions.length > 0 && (
                                <div className="mt-6 mb-4">
                                    <h5 className="font-bold text-white mb-3 text-sm">Opciones de Envío</h5>
                                    <div className="space-y-2">
                                        {shippingOptions.map((opt, i) => (
                                            <label key={i} className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${selectedShipping === opt ? 'bg-primary/10 border-primary' : 'bg-black/20 border-white/10 hover:border-white/20'}`}>
                                                <input
                                                    type="radio"
                                                    name="shipping_option"
                                                    className="mt-1"
                                                    checked={selectedShipping === opt}
                                                    onChange={() => setSelectedShipping(opt)}
                                                />
                                                <div className="ml-3 flex-1">
                                                    <div className="flex justify-between">
                                                        <span className="font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis mr-2 max-w-[150px]">{opt.correo.nombre}</span>
                                                        <span className="font-bold text-primary">${opt.valor.toLocaleString('es-AR')}</span>
                                                    </div>
                                                    <div className="text-xs text-white/50 flex flex-col gap-0.5 mt-1">
                                                        <span>{opt.modalidad === 'S' ? 'Retiro en Sucursal' : 'Envío a Domicilio'}</span>
                                                        {opt.horas_entrega > 0 && (
                                                            <span>Llega aprox. en {Math.ceil(opt.horas_entrega / 24)} días hábiles</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="h-px bg-white/10 my-4" />
                            <div className="flex justify-between text-xl font-bold text-white">
                                <span>Total</span>
                                <span>${(subtotal + (requiresShipping && selectedShipping ? selectedShipping.valor : 0)).toLocaleString('es-AR')}</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="font-bold text-white mb-3 text-sm">Método de Pago</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div
                                    onClick={() => setPaymentMethod('mercadopago')}
                                    className={`p-4 rounded-xl border flex flex-col text-left transition-all cursor-pointer ${paymentMethod === 'mercadopago'
                                        ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10'
                                        : 'bg-black/20 border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-center justify-between w-full mb-2">
                                        <span className="font-bold text-white flex items-center gap-2">
                                            <CreditCard className="w-5 h-5 text-primary" />
                                            Mercado Pago
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                                            Sandbox / Test
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/50">
                                        Tarjetas de crédito/débito y dinero en cuenta.
                                    </p>
                                </div>

                                <div
                                    onClick={() => setPaymentMethod('transfer')}
                                    className={`p-4 rounded-xl border flex flex-col text-left transition-all cursor-pointer ${paymentMethod === 'transfer'
                                        ? 'bg-green-500/10 border-green-500 shadow-lg shadow-green-500/10'
                                        : 'bg-black/20 border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-center justify-between w-full mb-2">
                                        <span className="font-bold text-white flex items-center gap-2">
                                            <svg className="w-5 h-5 fill-current text-green-400" viewBox="0 0 24 24">
                                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                                            </svg>
                                            Transferencia / WhatsApp
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/50">
                                        Coordinación directa y datos bancarios por WhatsApp.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {paymentMethod === 'mercadopago' ? (
                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Redirigiendo a Mercado Pago...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        Pagar con Mercado Pago (Modo Prueba)
                                    </>
                                )}
                            </button>
                        ) : (
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
                                        <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                                        </svg>
                                        Confirmar Pedido por WhatsApp
                                    </>
                                )}
                            </button>
                        )}
                        <p className="text-center text-white/30 text-xs mt-4">
                            {paymentMethod === 'mercadopago'
                                ? 'Serás redirigido al portal seguro de Mercado Pago en modo prueba.'
                                : 'Se abrirá WhatsApp para enviar los detalles de tu pedido a Camí.'}
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