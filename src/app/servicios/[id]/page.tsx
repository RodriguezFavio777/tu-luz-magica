import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Clock, ShoppingBag, Check, Video, MapPin } from 'lucide-react';
import ServiceInfoClient from '@/components/services/ServiceInfoClient';

// Server Component (assuming Next.js App Router)
export default async function ServicePage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const supabase = createClient();

    // Fetch Service Data
    const { data: service, error } = await supabase
        .from('products')
        .select('*, category:service_categories(name)')
        .eq('id', id)
        // .eq('is_active', true) // Removed strict active check just in case, or keep it if desired. User said stock 0 issue?
        // Let's keep is_active=true but ensure we don't check stock. A service usually doesn't have stock or it's null.
        .eq('is_active', true)
        .single();

    if (error || !service) {
        notFound();
    }

    // Import details
    const { SERVICE_DETAILS } = await import('@/data/serviceVariants');
    const details = SERVICE_DETAILS[service.name];

    // Default image if missing
    const displayImage = service.image_url || 'https://placehold.co/600x800/1a1a1a/f472b6?text=Servicio+Mistico';

    return (
        <main className="min-h-screen bg-background pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-5xl">
                <Link href="/servicios" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Servicios
                </Link>

                <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Image Section */}
                    <div className="space-y-4 sticky top-32">
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
                            {details?.shortDescription || service.description}
                        </div>

                        {/* Interactive Client Component (Handles Price, Duration, Variants, Include List, Button) */}
                        <ServiceInfoClient service={service} details={details} />

                    </div>
                </div>
            </div>
        </main>
    );
}
