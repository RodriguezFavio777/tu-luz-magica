'use client'
export function VariantSelector({
    variants,
    selected,
    onSelect
}: {
    variants: any[],
    selected?: string | null,
    onSelect?: (val: string) => void
}) {
    if (!variants || variants.length === 0) return null;
    return (
        <div className="space-y-4 my-6">
            {variants.map((v, i) => (
                <div key={i}>
                    <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">{v.type}</h4>
                    <div className="flex flex-wrap gap-2">
                        {(Array.from(new Set(v.options)) as string[]).map((opt) => {
                            const isSelected = selected === opt;
                            return (
                                <button
                                    key={opt}
                                    onClick={() => onSelect && onSelect(opt)}
                                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${isSelected
                                        ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(244,114,182,0.5)]'
                                        : 'border-white/20 text-white hover:bg-primary hover:border-primary'
                                        }`}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}
