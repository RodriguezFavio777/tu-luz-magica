'use client'

import React from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'primary'
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger'
}: ConfirmModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#1a151b] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-white/30 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-4 rounded-2xl ${variant === 'danger' ? 'bg-red-500/10 text-red-400' : 'bg-primary/10 text-primary'}`}>
                        <AlertTriangle className="w-8 h-8" />
                    </div>

                    <h3 className="text-xl font-bold text-white font-display uppercase tracking-widest leading-tight">
                        {title}
                    </h3>

                    <p className="text-white/60 text-sm leading-relaxed">
                        {message}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm()
                                onClose()
                            }}
                            className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${variant === 'danger'
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-primary hover:bg-primary-hover text-white'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
