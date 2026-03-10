import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProfileDashboard } from '@/components/profile/ProfileDashboard'

export default async function ProfilePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/ingresar')
    }

    // Fetch Profile
    let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // If profile doesn't exist (legacy user or race condition), create it.
    if (!profile) {
        const { data: newProfile, error } = await supabase
            .from('profiles')
            .insert([
                {
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || '',
                    role: 'customer'
                }
            ])
            .select()
            .single()

        if (!error && newProfile) {
            profile = newProfile
        }
    }

    // Fetch Orders
    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
            *,
            items:order_items (
                *,
                product:products (
                    name,
                    image_url,
                    images,
                    description
                ),
                service:services (
                    name,
                    image_url,
                    description
                )
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (ordersError) {
        console.error('❌ Error fetching orders for profile:', ordersError)
    }

    const safeOrders = orders || []

    return (
        <main className="min-h-screen bg-[#0a080c] pt-32 pb-20 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Volver al inicio</span>
                </Link>

                <h1 className="text-4xl font-bold text-white font-display mb-8">Mi Cuenta</h1>

                <ProfileDashboard user={user} profile={profile} orders={safeOrders} />
            </div>
        </main>
    )
}
