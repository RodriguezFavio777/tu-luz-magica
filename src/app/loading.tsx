import { Sparkles } from 'lucide-react'

export default function Loading() {
    return (
        <div className="fixed inset-0 z-100 bg-[#0a080c] flex flex-col items-center justify-center min-h-[100dvh] w-full">
            {/* Custom Spinner - Professional Circular Ring */}
            <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
                {/* Background Track */}
                <svg className="absolute inset-0 w-full h-full text-white/5" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>

                {/* Animated Progress Ring */}
                <svg className="absolute inset-0 w-full h-full text-primary animate-spin" viewBox="0 0 100 100" style={{ animationDuration: '2s' }}>
                    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="80 200" strokeLinecap="round" />
                </svg>

                {/* Center Icon */}
                <div className="text-secondary/80 animate-pulse">
                    <Sparkles size={28} />
                </div>
            </div>

            <p className="text-white/60 font-display font-bold uppercase tracking-[0.2em] text-xs">
                CONECTANDO CON EL UNIVERSO...
            </p>
        </div>
    )
}
