'use server'

import { createClient } from '@supabase/supabase-js'

export async function submitContactForm(prevState: any, formData: FormData) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    if (!name || !email || !message) {
        return { success: false, message: 'Faltan campos requeridos.' }
    }

    const { error } = await supabase
        .from('contact_messages')
        .insert({ name, email, subject, message })

    if (error) {
        console.error('Error submitting form:', error)
        return { success: false, message: 'Hubo un error al enviar tu mensaje. Intenta nuevamente.' }
    }

    return { success: true, message: '¡Gracias! Tu mensaje ha sido recibido con energía positiva.' }
}
