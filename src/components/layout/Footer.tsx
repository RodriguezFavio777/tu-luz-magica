'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Instagram, Youtube, Music2 } from 'lucide-react';
import { TriquetaLogo } from '@/components/ui/TriquetaLogo';
import { siteConfig } from '@/config/site';

export function Footer() {
    return (
        <footer className="bg-[#0a080c] pt-24 pb-12 border-t border-white/5">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid md:grid-cols-5 gap-8 mb-20">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-8">
                            <TriquetaLogo size={32} />
                            <h4 className="text-white text-xl font-bold font-display">Tu Luz Mágica</h4>
                        </div>
                        <p className="text-white/40 text-sm leading-relaxed mb-8 font-body">
                            Acompañándote a descubrir el poder sagrado que reside en ti a través de la sabiduría ancestral y el amor incondicional.
                        </p>
                        <div className="flex gap-4">
                            <Link
                                href={siteConfig.social.instagram_full}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-primary hover:text-white transition-all border border-white/5"
                            >
                                <Instagram className="w-5 h-5" />
                            </Link>
                            <Link
                                href={siteConfig.social.tiktok}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-primary hover:text-white transition-all border border-white/5 relative group"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-5 h-5"
                                >
                                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                                </svg>
                            </Link>
                            <Link
                                href={siteConfig.social.youtube}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-primary hover:text-white transition-all border border-white/5"
                            >
                                <Youtube className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                    <div>
                        <h5 className="font-bold mb-8 uppercase tracking-widest text-[10px] text-white/80">Navegación</h5>
                        <ul className="flex flex-col gap-4">
                            {[
                                { name: 'Inicio', href: '/' },
                                { name: 'Servicios', href: '/servicios' },
                                { name: 'Tienda Holística', href: '/productos' },
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-white/40 hover:text-primary transition-colors text-sm font-body">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="col-span-1">
                        <h5 className="font-bold mb-8 uppercase tracking-widest text-[10px] text-white/80">Soporte</h5>
                        <ul className="flex flex-col gap-4">
                            {[
                                { name: 'Contacto', href: '/sobre-mi#contacto' },
                                { name: 'Preguntas Frecuentes', href: '/preguntas-frecuentes' },
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-white/40 hover:text-primary transition-colors text-sm font-body">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="col-span-1">
                        <h5 className="font-bold mb-8 uppercase tracking-widest text-[10px] text-white/80">Legal</h5>
                        <ul className="flex flex-col gap-4">
                            {[
                                { name: 'Política de Privacidad', href: '/politica-privacidad' },
                                { name: 'Términos y Condiciones', href: '/terminos-condiciones' },
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-white/40 hover:text-primary transition-colors text-sm font-body">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="text-white/30 text-sm flex flex-col justify-end">
                        <p className="italic">"Donde la magia se encuentra con el alma."</p>
                    </div>
                </div>
                <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-center">
                    <p className="text-white/20 text-[10px] font-body">© 2026 Tu Luz Mágica by Camí. Todos los derechos reservados.</p>
                    <div className="flex items-center gap-4 text-white/20 text-[10px] font-body uppercase tracking-[0.2em]">
                        <span>Hecho con amor y magia</span>
                        <Heart className="w-3 h-3 text-primary fill-current" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
