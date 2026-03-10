'use server'

import { createClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Send email notification to Admin
    try {
        const { sendContactNotification } = await import('@/lib/actions/sendMail')
        await sendContactNotification(name, email, message)
    } catch (e) {
        console.error('Error sending email notification:', e)
        // We don't return error here because the message was already saved to DB
    }

    return { success: true, message: '¡Gracias! Tu mensaje ha sido recibido con energía positiva.' }
}
