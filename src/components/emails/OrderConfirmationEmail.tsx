import * as React from 'react'
import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Heading,
    Hr,
    Row,
    Column,
    Tailwind
} from '@react-email/components'

export interface OrderItem {
    name: string
    quantity: number
    price: number
    type: string
    variantName?: string
    bookingDate?: string
    bookingTime?: string
}

interface OrderConfirmationEmailProps {
    customerName: string
    orderId: string
    items: OrderItem[]
    totalAmount: number
    subtotal?: number
    shippingCost?: number
    shippingAddress?: string
    isBooking: boolean
}

export function OrderConfirmationEmail({
    customerName,
    orderId,
    items,
    totalAmount,
    subtotal,
    shippingCost,
    shippingAddress,
    isBooking
}: OrderConfirmationEmailProps) {
    return (
        <Tailwind>
            <Html>
                <Head />
                <Body className="bg-[#120d14] font-sans text-white my-auto mx-auto px-2">
                    <Container className="border border-solid border-[#3a2f3d] rounded-2xl my-[40px] mx-auto p-[30px] w-[600px] bg-[#1d1520] shadow-2xl">
                        <Section className="text-center">
                            <Text className="text-[#f472b6] text-2xl font-bold uppercase tracking-[0.2em] text-center mt-2 font-serif">
                                Tu Luz Mágica
                            </Text>
                        </Section>

                        <Heading className="text-white text-[26px] font-bold text-center mt-6 mb-10">
                            ¡Gracias por tu {isBooking ? 'Reserva' : 'Compra'}!
                        </Heading>

                        <Text className="text-[#e2e8f0] text-[16px] leading-[24px]">
                            Hola <strong>{customerName}</strong>,
                        </Text>

                        <Text className="text-[#a0aec0] text-[15px] leading-[24px] mb-[30px]">
                            Hemos recibido exitosamente tu {isBooking ? 'solicitud de turno' : 'pedido'}. A continuación, verás el detalle de lo que has adquirido:
                        </Text>

                        <Section className="bg-[#2c1f30]/50 border border-white/5 p-6 rounded-2xl mb-[30px]">
                            <Row className="mb-4">
                                <Column>
                                    <Text className="text-primary font-bold text-[12px] uppercase tracking-widest m-0">
                                        DETALLE DEL PEDIDO
                                    </Text>
                                    <Text className="text-white/40 text-[10px] m-0">
                                        # {orderId}
                                    </Text>
                                </Column>
                            </Row>

                            <Hr className="border-t border-solid border-white/10 my-4" />

                            {/* Header Row */}
                            <Row className="mb-2">
                                <Column style={{ width: '55%' }}>
                                    <Text className="text-white/40 text-[10px] font-bold uppercase m-0">PRODUCTO</Text>
                                </Column>
                                <Column style={{ width: '15%' }} align="center">
                                    <Text className="text-white/40 text-[10px] font-bold uppercase m-0">CANT.</Text>
                                </Column>
                                <Column style={{ width: '15%' }} align="right">
                                    <Text className="text-white/40 text-[10px] font-bold uppercase m-0">UNID.</Text>
                                </Column>
                                <Column style={{ width: '15%' }} align="right">
                                    <Text className="text-white/40 text-[10px] font-bold uppercase m-0">TOTAL</Text>
                                </Column>
                            </Row>

                            {items.map((item, index) => (
                                <Section key={index} className="mb-3">
                                    <Row className="items-center">
                                        <Column style={{ width: '55%' }}>
                                            <Text className="text-white text-[13px] font-bold m-0 leading-tight">
                                                {item.name}
                                            </Text>
                                            {item.variantName && (
                                                <Text className="text-primary text-[10px] m-0 mt-0.5 italic">
                                                    Variante: {item.variantName}
                                                </Text>
                                            )}
                                            {item.bookingDate && (
                                                <Text className="text-secondary text-[10px] m-0 mt-1 font-bold">
                                                    ⏰ {item.bookingDate}{item.bookingTime ? `, ${item.bookingTime}` : ''}
                                                </Text>
                                            )}
                                        </Column>
                                        <Column style={{ width: '15%' }} align="center">
                                            <Text className="text-white/60 text-[13px] m-0">{item.quantity}</Text>
                                        </Column>
                                        <Column style={{ width: '15%' }} align="right">
                                            <Text className="text-white/60 text-[13px] m-0">${item.price.toLocaleString('es-AR')}</Text>
                                        </Column>
                                        <Column style={{ width: '15%' }} align="right">
                                            <Text className="text-white text-[13px] font-bold m-0">
                                                ${(item.quantity * item.price).toLocaleString('es-AR')}
                                            </Text>
                                        </Column>
                                    </Row>
                                    {index < items.length - 1 && <Hr className="border-t border-solid border-white/5 my-3" />}
                                </Section>
                            ))}

                            <Hr className="border-t border-solid border-white/10 my-6" />

                            <Section>
                                {/* Subtotal Row */}
                                <Row className="mb-2">
                                    <Column align="right" style={{ paddingRight: '10px' }}>
                                        <Text className="text-white/40 text-[14px] m-0">Subtotal</Text>
                                    </Column>
                                    <Column style={{ width: '15%' }} align="right">
                                        <Text className="text-white/80 text-[14px] m-0">
                                            ${(subtotal || 0).toLocaleString('es-AR')}
                                        </Text>
                                    </Column>
                                </Row>

                                {/* Shipping Cost Row */}
                                {shippingCost != null && shippingCost > 0 && (
                                    <Row className="mb-2">
                                        <Column align="right" style={{ paddingRight: '10px' }}>
                                            <Text className="text-white/40 text-[14px] m-0">Envío (EnvíoPack)</Text>
                                        </Column>
                                        <Column style={{ width: '15%' }} align="right">
                                            <Text className="text-white/80 text-[14px] m-0">
                                                $ {shippingCost.toLocaleString('es-AR')}
                                            </Text>
                                        </Column>
                                    </Row>
                                )}

                                {/* Total Price Row */}
                                <Row className="mt-4">
                                    <Column align="right" style={{ paddingRight: '10px' }}>
                                        <Text className="text-primary font-bold text-[18px] m-0">Total Final</Text>
                                    </Column>
                                    <Column style={{ width: '15%' }} align="right">
                                        <Text className="text-[#a8eb12] font-bold text-[22px] m-0 drop-shadow-[0_0_15px_rgba(168,235,18,0.3)]">
                                            $ {totalAmount.toLocaleString('es-AR')}
                                        </Text>
                                    </Column>
                                </Row>
                            </Section>
                        </Section>

                        {!isBooking && shippingAddress && (
                            <Section className="bg-white/5 p-6 rounded-2xl mb-8">
                                <Text className="text-primary text-[12px] font-bold uppercase tracking-widest mb-2 border-b border-primary/20 pb-2">
                                    INFORMACIÓN DE ENTREGA
                                </Text>
                                <Text className="text-[#a0aec0] text-[14px] leading-[22px] m-0">
                                    {shippingAddress}
                                </Text>
                                <Hr className="border-white/5 my-4" />
                                <Text className="text-white/50 text-[12px] italic leading-[18px]">
                                    Te contactaremos por WhatsApp para coordinar el pago y confirmarte el envío.
                                </Text>
                            </Section>
                        )}

                        {isBooking && (
                            <Section className="bg-primary/10 border border-primary/20 p-6 rounded-2xl mb-8 text-center">
                                <Text className="text-primary text-[15px] leading-[22px] italic m-0">
                                    &ldquo;Nos comunicaremos con vos por WhatsApp para coordinar el pago y los detalles de tu sesión.&rdquo;
                                </Text>
                            </Section>
                        )}

                        <Hr className="border border-solid border-[#3a2f3d] my-[40px] mx-0 w-full" />

                        <Section className="text-center">
                            <Text className="text-[#718096] text-[12px] leading-[20px] italic">
                                Abrazos de luz,<br />
                                <strong>Camí - Tu Luz Mágica</strong>
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Html>
        </Tailwind>
    )
}
