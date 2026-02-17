'use client'

import React from 'react'

/**
 * Triqueta Isologo Component
 * Classic 3-pointed Trinity Knot (Triquetra) with interlaced circle.
 * Mathematically balanced for a premium aesthetic.
 */
export const TriquetaLogo: React.FC<{ size?: number; className?: string; animate?: boolean }> = ({ size = 40, className = "", animate = false }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${className} ${animate ? 'animate-spin-slow' : ''}`}
            style={{ animationDuration: '3s' }}
        >
            <defs>
                <filter id="glow-logo" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="triqueta-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f472b6" /> {/* Primary Pink */}
                    <stop offset="100%" stopColor="#D4AF37" /> {/* Secondary Gold */}
                </linearGradient>
            </defs>

            <g filter="url(#glow-logo)">
                {/* The 3 Loops of the Triquetra */}
                {/* Top Loop */}
                <path
                    d="M50 15 C60 35 85 55 50 85 C15 55 40 35 50 15 Z"
                    stroke="url(#triqueta-grad)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Left Loop - Rotated 120 deg around center (50,55) */}
                <path
                    d="M50 15 C60 35 85 55 50 85 C15 55 40 35 50 15 Z"
                    stroke="url(#triqueta-grad)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform="rotate(120, 50, 55)"
                />
                {/* Right Loop - Rotated 240 deg around center (50,55) */}
                <path
                    d="M50 15 C60 35 85 55 50 85 C15 55 40 35 50 15 Z"
                    stroke="url(#triqueta-grad)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform="rotate(240, 50, 55)"
                />

                {/* Interlaced Circle */}
                <circle
                    cx="50"
                    cy="55"
                    r="23"
                    stroke="url(#triqueta-grad)"
                    strokeWidth="2.5"
                    strokeDasharray="1 4"
                    opacity="0.8"
                />
            </g>
        </svg>
    )
}
