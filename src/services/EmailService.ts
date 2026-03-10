import { sendOrderConfirmation, sendStatusUpdateEmail, sendContactNotification } from '@/lib/actions/sendMail'

export interface EmailOrderItem {
    name: string
    quantity: number
    price: number
    variantName?: string | null
    bookingDate?: string
    bookingTime?: string | null
}

export class EmailService {
    static async sendOrderConfirmation(
        email: string,
        customerName: string,
        orderId: string,
        items: EmailOrderItem[],
        total: number,
        shippingAddress: string,
        isBooking: boolean,
        subtotal: number,
        shippingCost: number
    ) {
        return sendOrderConfirmation(
            email,
            customerName,
            orderId,
            items as unknown as Parameters<typeof sendOrderConfirmation>[3], // Cast strictly down the line
            total,
            shippingAddress,
            isBooking,
            subtotal,
            shippingCost
        )
    }

    static async sendStatusUpdate(
        email: string,
        customerName: string,
        orderId: string,
        newStatus: string,
        isBooking: boolean
    ) {
        return sendStatusUpdateEmail(email, customerName, orderId, newStatus, isBooking)
    }

    static async sendContactNotification(
        customerName: string,
        customerEmail: string,
        message: string
    ) {
        return sendContactNotification(customerName, customerEmail, message)
    }
}
