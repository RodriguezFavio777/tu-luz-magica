import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Video } from 'lucide-react';
import ServiceInfoClient from '@/components/services/ServiceInfoClient';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();
    const { data: service } = await supabase
        .from('services')
        .select('name, description, image_url')
        .eq('id', id)
        .single();

    if (!service) return { title: 'Servicio no encontrado | Tu Luz Mágica' };

    return {
        title: `${service.name} | Tu Luz Mágica`,
        description: service.description || `Agenda tu sesión de ${service.name} en Tu Luz Mágica.`,
        openGraph: {
            title: service.name,
            description: service.description,
            images: [service.image_url || '/tarot_mystical_bg.png'],
        },
    };
}

// Server Component (assuming Next.js App Router)
export default async function ServicePage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch Service Data
    const { data: service, error } = await supabase
        .from('services')
        .select('*, category:service_categories(name)')
        .eq('id', id)
        .eq('is_active', true)
        .single();

    if (error || !service) {
        notFound();
    }



    // Default image if missing
    const displayImage = service.image_url || 'https://placehold.co/600x800/1a1a1a/f472b6?text=Servicio+Mistico';

    return (
        <main className="min-h-screen bg-background pt-40 md:pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-5xl">
                <Link href="/servicios" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Servicios
                </Link>

                <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Image Section */}
                    <div className="space-y-4 md:sticky top-32">
                        <div className="aspect-4/5 relative rounded-3xl overflow-hidden border border-white/10 bg-surface shadow-2xl shadow-primary/5">
                            <Image
                                src={displayImage}
                                alt={service.name}
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-700"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                            />
                        </div>
                    </div>

                    {/* Info Section */}
                    <div>
                        {/* Type Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                            <Video className="w-3 h-3" />
                            <span>{service.category?.name || 'Servicio Holístico'}</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display leading-tight text-balance">
                            {service.name}
                        </h1>

                        <div className="prose prose-invert text-white/70 text-base leading-relaxed mb-8 font-body">
                            {service.description}
                        </div>

                        {/* Interactive Client Component (Handles Price, Duration, Variants, Include List, Button) */}
                        <ServiceInfoClient service={service} />

                    </div>
                </div>

                {/* Recommended Services Section */}
                <ServiceRecomendations currentId={service.id} />
            </div>
        </main>
    );
}

// Side component to fetch and render recommendations within the same server action flow
async function ServiceRecomendations({ currentId }: { currentId: string }) {
    const supabase = await createClient();
    const { data: recommendedServices } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .neq('id', currentId)
        .limit(10);

    const { RecommendedItems } = await import('@/components/ui/RecommendedItems');
    return <RecommendedItems type="service" items={recommendedServices || []} />;
}
