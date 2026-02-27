import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import * as motion from 'framer-motion/client'
import {
  Sparkles,
  Flame,
  Wind,
  Heart,
  Hexagon,
  ShoppingBag,
  Calendar,
  ArrowRight,
  Star
} from 'lucide-react'
import { TriquetaLogo } from '@/components/ui/TriquetaLogo'
import { AddToCartButton } from '@/components/cart/CartComponents'
import { NewsCarousel } from '@/components/home/NewsCarousel'
import { SusurrosGallery } from '@/components/home/SusurrosGallery'

import { ServiceCard } from '@/components/services/ServiceCard'
import { createClient } from '@/lib/supabase/server'

// Reference images
const REFERENCE_HERO_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuDC8q67O81k9lwpZ5wtZdSJJiwGLnXK946JcUM0P0JINvIL0tl0UbzsVqS2lA7fP7eaTBBD8ttN1UvOiT_LuCnDScEcxIxWEOxciwHPFEecMeQvq4Rz0fypMd1ANYtsiY1c5KUUyc-m82zlMmC52yi8zkVqEh262U5cgNjjIUzMIDpcgA9UQuRGLJdfnW8WHinGasIfFfUqBTC6icoBsyqEI3_Drlnpu_tQkqEzkWhbLVJ33aILwAZ0Hr1lGCiLHyQH5_eid0iN7kA"
const REFERENCE_CAMI_IMAGE = "/cami-profile.jpg"

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch Services
  const { data: services } = await supabase
    .from('products')
    .select('*')
    .eq('type', 'service')
    .eq('is_active', true)
    .limit(3)

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Image - Full Screen & Centered */}
        <div className="absolute inset-0 z-0 h-full w-full">
          <div className="absolute inset-0 bg-background/20 z-10" />
          <div className="absolute inset-0 bg-linear-to-b from-background/30 via-transparent to-background z-10" />
          <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent z-10" />
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDC8q67O81k9lwpZ5wtZdSJJiwGLnXK946JcUM0P0JINvIL0tl0UbzsVqS2lA7fP7eaTBBD8ttN1UvOiT_LuCnDScEcxIxWEOxciwHPFEecMeQvq4Rz0fypMd1ANYtsiY1c5KUUyc-m82zlMmC52yi8zkVqEh262U5cgNjjIUzMIDpcgA9UQuRGLJdfnW8WHinGasIfFfUqBTC6icoBsyqEI3_Drlnpu_tQkqEzkWhbLVJ33aILwAZ0Hr1lGCiLHyQH5_eid0iN7kA"
            alt="Tu Luz Mágica"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-center scale-100"
          />
        </div>

        {/* Content */}
        <div className="relative z-20 container mx-auto px-6 lg:px-12 max-w-7xl flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 mb-8 backdrop-blur-sm self-center">
              <TriquetaLogo size={14} animate className="text-primary" />
              <span className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] glow-text">Bienvenida a tu despertar</span>
            </div>

            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tighter text-white mb-8 font-sans drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
              Ilumina tu <br />
              <span className="font-display bg-linear-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent italic pr-3 drop-shadow-[0_0_25px_rgba(244,114,182,0.5)]">Esencia</span>
              <span className="font-display bg-linear-to-r from-accent via-[#fcd34d] to-accent bg-clip-text text-transparent pl-3 drop-shadow-[0_0_25px_rgba(255,215,0,0.5)]">Sagrada</span>
            </h2>


            <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed mb-10 max-w-2xl mx-auto font-body text-balance">
              Lecturas de tarot, rituales energéticos y herramientas místicas diseñadas por Camí para acompañarte en tu evolución espiritual.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/servicios" className="h-16 px-10 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-base hover:scale-105 transition-all shadow-[0_0_30px_rgba(244,114,182,0.6)] flex items-center justify-center gap-3 active:scale-95">
                <span>Reservar Sesión</span>
                <Calendar className="w-5 h-5" />
              </Link>
              <Link href="/productos" className="h-16 px-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white font-bold text-base hover:bg-white/20 transition-all flex items-center justify-center gap-3 active:scale-95">
                <ShoppingBag className="w-5 h-5" />
                <span>Tienda Esotérica</span>
              </Link>
            </div>
          </motion.div>
        </div>

      </section>


      {/* About Me Section */}
      <section className="py-32 relative bg-background" id="sobre-mi">
        <div className="absolute inset-0 bg-star-pattern"></div>
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: -50 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-linear-to-tr from-primary/30 to-secondary/30 rounded-4xl opacity-30 blur-2xl group-hover:opacity-50 transition-opacity duration-700"></div>
              <div className="relative rounded-4xl overflow-hidden border border-white/10 aspect-4/5 shadow-[0_0_30px_rgba(244,114,182,0.6)] hover:shadow-[0_0_50px_rgba(244,114,182,0.8)] transition-shadow duration-500">
                <Image
                  src="/cami-profile.jpg"
                  alt="Camí - Guía Espiritual"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-8 left-8 right-8 glass-panel p-6 rounded-2xl">
                  <div className="flex items-center gap-1 text-secondary mb-2">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                  </div>
                  <p className="text-white/90 italic text-sm leading-relaxed font-body">
                    "Mi misión es recordarte que el universo entero conspira a tu favor cuando aprendes a escuchar tu propia luz."
                  </p>
                  <p className="text-primary font-bold text-xs mt-3 uppercase tracking-widest">— Camí</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: 50 }}
              viewport={{ once: true }}
              className="flex flex-col gap-8"
            >
              <div>
                <h3 className="text-secondary text-sm font-bold uppercase tracking-[0.25em] mb-4 glow-text">La Guía Detrás de la Magia</h3>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight font-display">Canalizando Luz para tu <span className="italic bg-linear-to-r from-primary via-secondary to-primary/80 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(244,114,182,0.5)]">Evolución</span></h2>
                <p className="text-white/60 text-lg leading-relaxed font-body mb-6">
                  Soy Camí, terapeuta holística y guía espiritual. Mi camino comenzó con la búsqueda de respuestas en lo invisible, encontrando en el tarot y los rituales las herramientas perfectas para transformar realidades.
                </p>
                <p className="text-white/60 text-lg leading-relaxed font-body">
                  En este santuario digital, te ofrezco un puente entre lo terrenal y lo divino, ayudándote a sanar bloqueos y manifestar la vida que tu alma anhela.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 border-y border-white/5 py-8">
                <div>
                  <span className="text-3xl font-bold text-white block">+800</span>
                  <span className="text-white/40 text-[10px] uppercase tracking-widest">Almas conectadas</span>
                </div>
                <div>
                  <span className="text-3xl font-bold text-white block">7+</span>
                  <span className="text-white/40 text-[10px] uppercase tracking-widest">Años de experiencia</span>
                </div>
              </div>

              <Link href="/sobre-mi" className="inline-flex items-center gap-4 text-secondary hover:text-primary font-black uppercase tracking-[0.3em] text-[10px] transition-all group">
                Conoce mi camino espiritual
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 bg-surface" id="servicios">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h3 className="text-secondary text-sm font-bold uppercase tracking-[0.2em] mb-3 glow-text">Servicios Destacados</h3>
              <h2 className="text-4xl font-bold text-white font-display">Portal de Sanación</h2>
            </div>
            <Link href="/servicios" className="text-primary hover:text-primary-hover font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-3 group border-b border-primary/20 pb-2">
              Explorar todos los servicios
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services && services.length > 0 ? (
              services.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  title={service.name}
                  description={service.description || ""}
                  price={service.price}
                  duration={"Consultar"}
                  image={service.image_url || "https://ui.shadcn.com/placeholder.svg"}
                  icon={<Hexagon className="w-6 h-6" />}
                  isPopular
                />
              ))
            ) : (
              <div className="text-white/40 col-span-3 text-center">Cargando servicios divinos...</div>
            )}
          </div>
        </div>
      </section>

      {/* New: News Carousel */}
      <NewsCarousel />

      {/* New: Susurros de Luz Gallery */}
      <SusurrosGallery />

      {/* Call to Action */}
      <section className="py-32 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.9 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-5xl md:text-6xl font-black text-white mb-8 font-display drop-shadow-[0_2px_10px_rgba(0,0,0,0.1)]">¿Lista para comenzar tu viaje?</h2>
            <p className="text-white/90 text-xl max-w-2xl mx-auto mb-12 font-body font-light">
              No dejes para mañana la sanación que tu alma necesita hoy. Encuentra tu luz en este espacio sagrado.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/servicios" className="bg-background text-white px-10 py-5 rounded-full font-bold text-sm hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 group">
                <Calendar className="w-5 h-5 group-hover:text-primary transition-colors" />
                Agendar mi Sesión
              </Link>
              <Link href="/productos" className="bg-transparent border-2 border-white text-white px-10 py-5 rounded-full font-bold text-sm hover:bg-white/20 transition-all active:scale-95">
                Explorar la Tienda
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </main>
  )
}
