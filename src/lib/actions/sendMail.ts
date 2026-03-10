'use server'

import { resend, SENDER_EMAIL, ADMIN_EMAIL } from '@/lib/resend'
import { OrderConfirmationEmail, OrderItem } from '@/components/emails/OrderConfirmationEmail'
import { AdminNotificationEmail } from '@/components/emails/AdminNotificationEmail'
import { StatusUpdateEmail } from '@/components/emails/StatusUpdateEmail'

const statusTranslations: Record<string, string> = {
    'pending': 'Pendiente',
    'paid': 'Pagado',
    'shipped': 'Enviado',
    'completed': 'Finalizado',
    'cancelled': 'Cancelado',
    'confirmed': 'Confirmado',
    'rescheduled': 'Reprogramado'
}

function translateStatus(status: string) {
    const lower = status.toLowerCase()
    return statusTranslations[lower] || status.toUpperCase()
}

export async function sendOrderConfirmation(
    customerEmail: string,
    customerName: string,
    orderId: string,
    items: OrderItem[],
    totalAmount: number,
    shippingAddress?: string,
    isBooking: boolean = false,
    subtotal?: number,
    shippingCost?: number
) {
    if (!resend) {
        console.warn('Resend no está configurado. El email no se enviará.')
        return { success: false, error: 'Resend no configurado' }
    }

    try {
        const { data, error } = await resend.emails.send({
            from: `Tu Luz Mágica <${SENDER_EMAIL}>`,
            to: [customerEmail],
            subject: isBooking ? `Tu Luz Mágica - Reserva Confirmada #${orderId.slice(-6)}` : `Tu Luz Mágica - Pedido Confirmado #${orderId.slice(-6)}`,
            react: OrderConfirmationEmail({
                customerName,
                orderId,
                items,
                totalAmount,
                subtotal,
                shippingCost,
                shippingAddress,
                isBooking
            })
        })

        if (error) {
            console.error('Error enviando email al cliente:', error)
            return { success: false, error }
        }

        // Send Notification to Admin
        await resend.emails.send({
            from: `Plataforma Tu Luz Mágica <${SENDER_EMAIL}>`,
            to: [ADMIN_EMAIL],
            subject: `NUEVA ${isBooking ? 'RESERVA' : 'VENTA'} RECIBIDA - ${customerName}`,
            react: AdminNotificationEmail({
                orderType: isBooking ? 'Reserva' : 'Venta',
                customerName,
                customerEmail,
                totalAmount,
                items,
                shippingAddress,
                link: `https://tuluzmagica.com/admin/${isBooking ? 'bookings' : 'orders'}`
            })
        })

        return { success: true, data }
    } catch (error) {
        console.error('Exception occurred during sendMail:', error)
        return { success: false, error }
    }
}

export async function sendStatusUpdateEmail(
    customerEmail: string,
    customerName: string,
    orderId: string,
    newStatus: string,
    isBooking: boolean
) {
    if (!resend) return { success: false }

    const translatedStatus = translateStatus(newStatus)

    try {
        const { data, error } = await resend.emails.send({
            from: `Tu Luz Mágica <${SENDER_EMAIL}>`,
            to: [customerEmail],
            subject: isBooking ? `Actualización de Turno #${orderId.slice(-6)}: ${translatedStatus}` : `Actualización de Pedido #${orderId.slice(-6)}: ${translatedStatus}`,
            react: StatusUpdateEmail({
                customerName,
                orderId,
                newStatus: translatedStatus,
                isBooking
            })
        })
        return { success: !error, data, error }
    } catch (e) {
        return { success: false, error: e }
    }
}

export async function sendContactNotification(
    customerName: string,
    customerEmail: string,
    message: string
) {
    if (!resend) return { success: false }

    try {
        await resend.emails.send({
            from: `Consultas Tu Luz Mágica <${SENDER_EMAIL}>`,
            to: [ADMIN_EMAIL],
            replyTo: customerEmail,
            subject: `NUEVA CONSULTA - ${customerName}`,
            react: AdminNotificationEmail({
                orderType: 'Mensaje',
                customerName,
                customerEmail,
                details: message,
                link: `https://tuluzmagica.com/admin/messages`
            })
        })
        return { success: true }
    } catch (error) {
        console.error('Error sending contact notification:', error)
        return { success: false, error }
    }
}
