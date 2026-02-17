export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] bg-[#0a080c] flex flex-col items-center justify-center min-h-screen w-full">
            {/* Custom Spinner */}
            <div className="relative w-20 h-20 mb-8">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#f472b6] animate-spin" style={{ animationDuration: '1.5s' }}></div>

                {/* Middle Ring */}
                <div className="absolute inset-3 rounded-full border-2 border-transparent border-r-[#d63384] animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>

                {/* Inner Ring */}
                <div className="absolute inset-6 rounded-full border-2 border-transparent border-b-[#ffd700] animate-spin" style={{ animationDuration: '1s' }}></div>

                {/* Center Glow */}
                <div className="absolute inset-0 bg-[#f472b6]/10 blur-xl rounded-full animate-pulse"></div>
            </div>

            <p className="text-white/60 font-display uppercase tracking-[0.4em] text-xs animate-pulse">
                Cargando Magia...
            </p>
        </div>
    )
}
