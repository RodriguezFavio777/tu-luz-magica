
export default function Loading() {
    return (
        <div className="min-h-screen bg-background pt-32 pb-20 flex flex-col items-center justify-center">
            <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-spin-slow"></div>
                <div className="absolute inset-3 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl animate-pulse">✨</span>
                </div>
            </div>
            <h2 className="text-secondary font-display text-xl animate-pulse tracking-widest uppercase">
                Conectando con el Universo...
            </h2>
        </div>
    )
}
