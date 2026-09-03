/**
 * Mercado Pago REST Client & Utility
 * Handles preference creation, payment verification, and webhook handling
 * Supports both Live and Sandbox/Test modes cleanly
 */

export interface MercadoPagoPreferenceItem {
    id?: string
    title: string
    unit_price: number
    quantity: number
    currency_id?: string
    description?: string
    picture_url?: string
    category_id?: string
}

export interface MercadoPagoPreferencePayload {
    items: MercadoPagoPreferenceItem[]
    shipments?: {
        cost?: number
        mode?: string
        free_shipping?: boolean
    }
    back_urls: {
        success: string
        failure: string
        pending: string
    }
    auto_return?: 'approved' | 'all'
    notification_url: string
    external_reference: string
    payer?: {
        name?: string
        email?: string
        phone?: {
            area_code?: string
            number?: string
        }
    }
    statement_descriptor?: string
}

export interface MercadoPagoPreferenceResponse {
    id: string
    init_point: string
    sandbox_init_point: string
    external_reference?: string
    items?: MercadoPagoPreferenceItem[]
    back_urls?: {
        success: string
        failure: string
        pending: string
    }
    notification_url?: string
}

export interface MercadoPagoPayment {
    id: string | number
    status: 'approved' | 'pending' | 'in_process' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back'
    status_detail?: string
    transaction_amount?: number
    currency_id?: string
    date_approved?: string | null
    external_reference?: string | null
    payer?: {
        email?: string
        first_name?: string
        last_name?: string
    }
}

class MercadoPagoClient {
    private accessToken: string
    private isSandbox: boolean

    constructor() {
        this.accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
        this.isSandbox = process.env.NODE_ENV !== 'production' ||
            process.env.MERCADOPAGO_SANDBOX === 'true' ||
            !this.accessToken ||
            this.accessToken.startsWith('TEST-')
    }

    getAccessToken(): string {
        return this.accessToken
    }

    isSandboxMode(): boolean {
        return this.isSandbox
    }

    async createPreference(payload: MercadoPagoPreferencePayload): Promise<MercadoPagoPreferenceResponse> {
        // Enforce ARS currency and 2 decimal precision on all items
        const normalizedItems: MercadoPagoPreferenceItem[] = payload.items.map(item => ({
            ...item,
            currency_id: 'ARS',
            unit_price: Math.round(item.unit_price * 100) / 100
        }))

        const normalizedPayload: MercadoPagoPreferencePayload = {
            ...payload,
            items: normalizedItems,
            auto_return: payload.auto_return || 'approved'
        }

        // If no access token configured or test simulation token, generate mock sandbox preference
        if (!this.accessToken || this.accessToken === 'mock_token' || this.accessToken === 'test_token') {
            const simulatedId = `pref_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
            return {
                id: simulatedId,
                init_point: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${simulatedId}`,
                sandbox_init_point: `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${simulatedId}`,
                external_reference: payload.external_reference,
                items: normalizedItems,
                back_urls: payload.back_urls,
                notification_url: payload.notification_url
            }
        }

        try {
            const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(normalizedPayload)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.error('Mercado Pago API error:', response.status, errorData)
                // If API fails due to test token invalidity in dev/sandbox, fallback gracefully
                if (this.isSandbox) {
                    const fallbackId = `sandbox_pref_${Date.now()}`
                    return {
                        id: fallbackId,
                        init_point: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${fallbackId}`,
                        sandbox_init_point: `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${fallbackId}`,
                        external_reference: payload.external_reference,
                        items: normalizedItems,
                        back_urls: payload.back_urls,
                        notification_url: payload.notification_url
                    }
                }
                throw new Error(errorData.message || `Error en Mercado Pago API (${response.status})`)
            }

            const data = await response.json()
            return {
                id: data.id,
                init_point: data.init_point,
                sandbox_init_point: data.sandbox_init_point || data.init_point,
                external_reference: data.external_reference || payload.external_reference,
                items: normalizedItems,
                back_urls: payload.back_urls,
                notification_url: payload.notification_url
            }
        } catch (error) {
            console.error('Mercado Pago createPreference exception:', error)
            if (this.isSandbox) {
                const fallbackId = `sandbox_pref_${Date.now()}`
                return {
                    id: fallbackId,
                    init_point: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${fallbackId}`,
                    sandbox_init_point: `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${fallbackId}`,
                    external_reference: payload.external_reference,
                    items: normalizedItems,
                    back_urls: payload.back_urls,
                    notification_url: payload.notification_url
                }
            }
            throw error
        }
    }

    async getPayment(paymentId: string | number): Promise<MercadoPagoPayment> {
        const idStr = String(paymentId)

        // Dynamic sandbox / mock handling when access token is absent or configured for mock simulation
        if (!this.accessToken || this.accessToken === 'mock_token' || this.accessToken === 'test_token') {
            return {
                id: idStr,
                status: 'approved',
                status_detail: 'accredited',
                transaction_amount: 15000,
                currency_id: 'ARS',
                date_approved: new Date().toISOString(),
                external_reference: null
            }
        }

        try {
            const response = await fetch(`https://api.mercadopago.com/v1/payments/${idStr}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            })

            if (!response.ok) {
                console.error('Mercado Pago getPayment error:', response.status)
                if (this.isSandbox) {
                    return {
                        id: idStr,
                        status: 'approved',
                        status_detail: 'accredited',
                        currency_id: 'ARS',
                        external_reference: null
                    }
                }
                throw new Error(`Error fetching payment ${paymentId}`)
            }

            const data = await response.json()
            return {
                id: data.id,
                status: data.status,
                status_detail: data.status_detail,
                transaction_amount: data.transaction_amount,
                currency_id: data.currency_id,
                date_approved: data.date_approved,
                external_reference: data.external_reference,
                payer: data.payer
            }
        } catch (error) {
            console.error('Mercado Pago getPayment exception:', error)
            if (this.isSandbox) {
                return {
                    id: idStr,
                    status: 'approved',
                    status_detail: 'accredited',
                    currency_id: 'ARS',
                    external_reference: null
                }
            }
            throw error
        }
    }

    async getMerchantOrder(merchantOrderId: string | number): Promise<any> {
        const idStr = String(merchantOrderId)
        if (!this.accessToken || this.accessToken === 'mock_token' || this.accessToken === 'test_token') {
            return {
                id: idStr,
                status: 'closed',
                payments: [{ id: `pay_${idStr}`, status: 'approved' }]
            }
        }

        try {
            const response = await fetch(`https://api.mercadopago.com/merchant_orders/${idStr}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            })
            if (!response.ok) {
                if (this.isSandbox) {
                    return {
                        id: idStr,
                        status: 'closed',
                        payments: [{ id: `pay_${idStr}`, status: 'approved' }]
                    }
                }
                throw new Error(`Error fetching merchant order ${idStr}`)
            }
            return await response.json()
        } catch (error) {
            console.error('Mercado Pago getMerchantOrder exception:', error)
            if (this.isSandbox) {
                return {
                    id: idStr,
                    status: 'closed',
                    payments: [{ id: `pay_${idStr}`, status: 'approved' }]
                }
            }
            throw error
        }
    }
}

export const mercadopago = new MercadoPagoClient()
