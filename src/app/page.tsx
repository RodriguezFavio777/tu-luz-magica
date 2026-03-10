import Link from 'next/link'
import { Hexagon, ArrowRight } from 'lucide-react'
import { NewsCarousel } from '@/components/home/NewsCarousel'
import { SusurrosGallery } from '@/components/home/SusurrosGallery'
import { ServiceCard } from '@/components/services/ServiceCard'
import { ServiceService } from '@/services/ServiceService'
import { Metadata } from 'next'

// New modular components
import { HeroSection } from '@/components/home/HeroSection'
import { AboutMeSection } from '@/components/home/AboutMeSection'
import { HomeCTA } from '@/components/home/HomeCTA'

export const metadata: Metadata = {
  title: 'Tu Luz Mágica | Lecturas de Tarot y Sanación Energética',
  description: 'Acompañamiento espiritual con lecturas de tarot, rituales y herramientas sagradas diseñado por Camí. Bienvenidos a tu guía en el despertar de la consciencia.',
  keywords: ['tarot online', 'sanación energética', 'espiritualidad', 'rituales', 'holístico', 'bienestar'],
  openGraph: {
    title: 'Tu Luz Mágica | Ilumina tu Esencia Sagrada',
    description: 'Acompañamiento espiritual con lecturas de tarot, rituales y herramientas sagradas.',
    images: ['/cami-profile.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default async function HomePage() {
  // Fetch Services via Service Layer
  const services = await ServiceService.getAll().then(s => s.slice(0, 3)).catch(() => [])

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section - Extracted */}
      <HeroSection />

      {/* About Me Section - Extracted */}
      <AboutMeSection />

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

      {/* News Carousel */}
      <NewsCarousel />

      {/* Susurros de Luz Gallery */}
      <SusurrosGallery />

      {/* Call to Action - Extracted */}
      <HomeCTA />
    </main>
  )
}
