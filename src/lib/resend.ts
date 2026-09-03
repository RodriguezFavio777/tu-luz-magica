import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY

export const resend = resendApiKey ? new Resend(resendApiKey) : null

// El correo principal de envíos con fallback para desarrollo/sandbox
export const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || process.env.RESEND_SENDER_EMAIL || 'onboarding@resend.dev'
// El correo donde Camí recibirá notificaciones
export const ADMIN_EMAIL = process.env.EMAIL_ADMIN || process.env.ADMIN_EMAIL || 'garrocamilalorena@gmail.com'
