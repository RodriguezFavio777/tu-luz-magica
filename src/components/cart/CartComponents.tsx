'use client'

import React from 'react'
import Image from 'next/image'
import { ShoppingCart, ShoppingBag, Trash2, Plus, Minus, X, CreditCard, Truck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCart, useCartBadge, useCheckout } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { CartItem } from '@/store/useCartStore'

/**
 * CartBadge Component
 * Displays the number of items in the cart, intended for the Navbar.
 */
export const CartBadge: React.FC = () => {
    const { itemCount } = useCartBadge()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted || itemCount === 0) return null

    return (
        <div className="relative">
            <ShoppingCart className="w-6 h-6 text-white" />
            <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                {itemCount}
            </span>
        </div>
    )
}

/**
 * AddToCartButton Component
 * Reusable button to add products or services to the cart.
 */
interface AddToCartProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    product: any // We use any here for simplicity in the example, but it should be Product | ServiceCategory
    type: 'physical' | 'service'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bookingData?: any
    disabled?: boolean
}

export const AddToCartButton: React.FC<AddToCartProps> = ({ product, type, bookingData, disabled }) => {
    const { addItem, updateQuantity, removeItem, items } = useCart()
    const { user } = useAuth()
    const router = useRouter()
    const [isAdded, setIsAdded] = React.useState(false)

    // Check if item is already in cart - consider variant if present
    const existingItem = items.find(i =>
        i.productId === product.id &&
        (product.variant ? i.variantName === product.variant : !i.variantName)
    )
    const quantity = existingItem?.quantity || 0

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation if inside a Link
        e.stopPropagation()

        if (!user) {
            // Require login to add to cart, save return path
            const returnUrl = encodeURIComponent(window.location.pathname)
            router.push(`/ingresar?redirect=${returnUrl}`)
            return
        }

        addItem({
            id: `${type}-${product.id}${product.variant ? `-${product.variant}` : ''}`,
            productId: product.id,
            name: product.name,
            type: type,
            price: product.price,
            quantity: 1,
            imageUrl: product.image_url || product.imageUrl,
            bookingData: bookingData,
            variantName: product.variant
        })

        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 2000)
    }

    const handleUpdateQuantity = (e: React.MouseEvent, change: number) => {
        e.preventDefault()
        e.stopPropagation()
        if (!existingItem) return

        const newQuantity = quantity + change
        if (newQuantity <= 0) {
            removeItem(existingItem.id)
        } else {
            updateQuantity(existingItem.id, newQuantity)
        }
    }

    if (existingItem) {
        return (
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-1 border border-primary/20" onClick={(e) => e.preventDefault()}>
                <button
                    onClick={(e) => handleUpdateQuantity(e, -1)}
                    className="p-3 hover:bg-white/10 rounded-lg text-white transition-colors"
                >
                    {quantity === 1 ? <Trash2 className="w-4 h-4 text-red-400" /> : <Minus className="w-4 h-4" />}
                </button>
                <span className="font-bold text-white flex-1 text-center">{quantity}</span>
                {type !== 'service' ? (
                    <button
                        onClick={(e) => handleUpdateQuantity(e, 1)}
                        className="p-3 hover:bg-white/10 rounded-lg text-white transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                ) : (
                    <div className="p-3 w-10"></div>
                )}
            </div>
        )
    }

    return (
        <button
            onClick={handleAdd}
            disabled={isAdded || disabled}
            className={`w-full font-bold py-3 px-6 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${isAdded
                ? 'bg-green-500 text-white shadow-green-500/20 opacity-100'
                : disabled
                    ? 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed shadow-none'
                    : 'bg-primary hover:bg-[#fa9acb] text-white shadow-primary/20'
                }`}
        >
            {isAdded ? (
                <>
                    <ShoppingBag className="w-5 h-5" />
                    ¡Agregado!
                </>
            ) : (
                <>
                    <Plus className="w-5 h-5" />
                    Añadir al Carrito
                </>
            )}
        </button>
    )
}

/**
 * CartSummary Component
 * Shows totals and conditional checkout messages.
 */
export const CartSummary: React.FC = () => {
    const { subtotal, itemCount } = useCart()
    const { requiresShipping, hasMixedCart } = useCheckout()

    if (itemCount === 0) return null

    return (
        <div className="bg-surface p-6 rounded-3xl border border-white/5 space-y-6">
            <h3 className="text-xl font-bold text-white">Resumen del Pedido</h3>

            <div className="space-y-3">
                <div className="flex justify-between text-white/60">
                    <span>Subtotal ({itemCount} productos)</span>
                    <span>${subtotal.toLocaleString('es-AR')}</span>
                </div>

                {requiresShipping && (
                    <div className="flex items-center gap-2 text-primary text-sm bg-primary/5 p-3 rounded-lg border border-primary/10">
                        <Truck className="w-4 h-4" />
                        <span>Incluye productos físicos. Requiere envío.</span>
                    </div>
                )}

                {hasMixedCart && (
                    <div className="text-secondary text-xs italic">
                        * Tu carrito contiene servicios y productos. El envío solo aplica a los productos físicos.
                    </div>
                )}
            </div>

            <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between text-xl font-bold text-white mb-6">
                    <span>Total</span>
                    <span>${subtotal.toLocaleString('es-AR')}</span>
                </div>

                <button className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95">
                    <CreditCard className="w-5 h-5" />
                    Finalizar Compra
                </button>
            </div>
        </div>
    )
}

/**
 * CartItemCard Component
 * Individual line item in the cart.
 */
export const CartItemCard: React.FC<{ item: CartItem }> = ({ item }) => {
    const { removeItem, updateQuantity } = useCart()

    return (
        <div className="flex gap-4 p-4 bg-surface rounded-2xl border border-white/5 group transition-colors hover:border-white/10">
            {/* Product Image Placeholder */}
            {/* Product Image */}
            <div className="w-24 h-24 bg-background rounded-xl overflow-hidden shrink-0 relative">
                {item.imageUrl ? (
                    <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/10 italic text-[10px]">
                        Sin Imagen
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="grow space-y-1">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white leading-tight">{item.name}</h4>
                    <button
                        onClick={() => removeItem(item.id)}
                        className="text-white/20 hover:text-red-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-primary text-sm font-bold">
                    ${item.price.toLocaleString('es-AR')}
                </p>

                {item.variantName && (
                    <div className="text-[10px] text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 inline-block">
                        Opción: {item.variantName}
                    </div>
                )}

                {item.type === 'service' && item.bookingData && (
                    <div className="text-[10px] text-secondary bg-secondary/5 px-2 py-1 rounded inline-block">
                        Reserva para: {item.bookingData.startTime}
                    </div>
                )}

                {/* Quantity Controls (Only for physical products) */}
                <div className="flex justify-between items-center pt-2">
                    {item.type === 'physical' ? (
                        <div className="flex items-center gap-3 bg-background rounded-lg p-1 border border-white/5">
                            <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:text-primary transition-colors disabled:opacity-30"
                                disabled={item.quantity <= 1}
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:text-primary transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="text-white/40 text-xs italic">Servicio único</div>
                    )}

                    <div className="text-right">
                        <span className="text-xs text-white/40 block">Subtotal</span>
                        <span className="font-bold text-white">
                            ${(item.price * item.quantity).toLocaleString('es-AR')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
