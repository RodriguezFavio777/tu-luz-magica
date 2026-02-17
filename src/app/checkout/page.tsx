import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { Sparkles } from 'lucide-react'

export default function CheckoutPage() {
    return (
        <main className="min-h-screen bg-background pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-4xl">
                <header className="mb-12 text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Sparkles className="text-secondary w-6 h-6" />
                        <span className="text-secondary text-xs font-black uppercase tracking-[0.4em]">Finalizar Compra</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold">Confirma tu <span className="text-primary italic">Pedido</span></h1>
                </header>

                <CheckoutForm />
            </div>
        </main>
    )
}
