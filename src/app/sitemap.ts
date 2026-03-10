import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://tuluzmagica.com.ar'

    // Fetch all products and services to generate dynamic routes
    const supabase = await createClient()

    const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('is_active', true)

    const { data: services } = await supabase
        .from('services')
        .select('id')
        .eq('is_active', true)

    const productEntries = (products || []).map((product) => ({
        url: `${baseUrl}/productos/${product.id}`,
        lastModified: new Date(),
    }))

    const serviceEntries = (services || []).map((service) => ({
        url: `${baseUrl}/servicios/${service.id}`,
        lastModified: new Date(),
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: `${baseUrl}/servicios`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/productos`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/sobre-mi`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...productEntries,
        ...serviceEntries,
    ]
}
