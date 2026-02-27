'use server'

import { resend, SENDER_EMAIL, ADMIN_EMAIL } from '@/lib/resend'
import { OrderConfirmationEmail, OrderItem } from '@/components/emails/OrderConfirmationEmail'
import { AdminNotificationEmail } from '@/components/emails/AdminNotificationEmail'
import { StatusUpdateEmail } from '@/components/emails/StatusUpdateEmail'

export async function sendOrderConfirmation(
    customerEmail: string,
    customerName: string,
    orderId: string,
    items: OrderItem[],
    totalAmount: number,
    shippingAddress?: string,
    isBooking: boolean = false
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

    try {
        const { data, error } = await resend.emails.send({
            from: `Tu Luz Mágica <${SENDER_EMAIL}>`,
            to: [customerEmail],
            subject: isBooking ? `Actualización de Turno #${orderId.slice(-6)}: ${newStatus}` : `Actualización de Pedido #${orderId.slice(-6)}: ${newStatus}`,
            react: StatusUpdateEmail({
                customerName,
                orderId,
                newStatus,
                isBooking
            })
        })
        return { success: !error, data, error }
    } catch (e) {
        return { success: false, error: e }
    }
}
