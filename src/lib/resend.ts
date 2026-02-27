import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY

export const resend = resendApiKey ? new Resend(resendApiKey) : null

// El correo principal de envíos
export const SENDER_EMAIL = 'hola@tuluzmagica.com'
// El correo donde Camí recibirá notificaciones
export const ADMIN_EMAIL = 'garrocamilalorena@gmail.com'
