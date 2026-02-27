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
    Img,
    Tailwind
} from '@react-email/components'

export interface OrderItem {
    name: string
    quantity: number
    price: number
    type: string
}

interface OrderConfirmationEmailProps {
    customerName: string
    orderId: string
    items: OrderItem[]
    totalAmount: number
    shippingAddress?: string
    isBooking: boolean
}

export function OrderConfirmationEmail({
    customerName,
    orderId,
    items,
    totalAmount,
    shippingAddress,
    isBooking
}: OrderConfirmationEmailProps) {
    return (
        <Tailwind>
            <Html>
                <Head />
                <Body className="bg-[#120d14] font-sans text-white my-auto mx-auto px-2">
                    <Container className="border border-solid border-[#3a2f3d] rounded-lg my-[40px] mx-auto p-[30px] w-[500px] bg-[#1d1520]">
                        <Section className="text-center">
                            {/* Note: In a real app, host your logo somewhere public and put URL here */}
                            <Text className="text-[#f472b6] text-xl font-bold uppercase tracking-widest text-center mt-2">
                                Tu Luz Mágica
                            </Text>
                        </Section>

                        <Heading className="text-white text-[24px] font-bold text-center mt-4 mb-8">
                            ¡Gracias por tu {isBooking ? 'Reserva' : 'Compra'}!
                        </Heading>

                        <Text className="text-[#e2e8f0] text-[16px] leading-[24px]">
                            Hola {customerName},
                        </Text>

                        <Text className="text-[#a0aec0] text-[15px] leading-[24px] mb-[20px]">
                            Hemos recibido exitosamente tu {isBooking ? 'solicitud de turno' : 'pedido'}. A continuación, verás el detalle:
                        </Text>

                        <Section className="bg-[#2c1f30] p-4 rounded-md mb-[20px]">
                            <Text className="text-[#f472b6] font-bold text-[14px] uppercase tracking-wider mb-2">
                                ID: {orderId}
                            </Text>

                            <Hr className="border border-solid border-[#4c3852] my-4" />

                            {items.map((item, index) => (
                                <div key={index} className="flex flex-row justify-between mb-2 w-full">
                                    <Text className="text-white text-[15px] m-0 w-full mb-1">
                                        {item.quantity}x {item.name}
                                    </Text>
                                    <Text className="text-[#a0aec0] text-[14px] m-0 text-right w-full">
                                        ${item.price.toLocaleString('es-AR')}
                                    </Text>
                                </div>
                            ))}

                            <Hr className="border border-solid border-[#4c3852] my-4" />

                            <div className="flex flex-row justify-between w-full">
                                <Text className="text-white font-bold text-[16px] m-0 w-full">Total</Text>
                                <Text className="text-[#a8eb12] font-bold text-[16px] m-0 text-right w-full">
                                    ${totalAmount.toLocaleString('es-AR')}
                                </Text>
                            </div>
                        </Section>

                        {!isBooking && shippingAddress && (
                            <Section>
                                <Text className="text-white text-[16px] font-bold mb-2">Dirección de Envío:</Text>
                                <Text className="text-[#a0aec0] text-[14px] leading-[22px]">
                                    {shippingAddress}
                                </Text>
                                <Text className="text-[#f472b6] text-[14px] leading-[22px] italic mt-2">
                                    Nos estaremos comunicando para informarte el número de seguimiento.
                                </Text>
                            </Section>
                        )}

                        {isBooking && (
                            <Text className="text-[#f472b6] text-[15px] leading-[22px] italic mt-4 text-center border border-[#f472b6] p-3 rounded-md bg-[#f472b6]/10">
                                Nos comunicaremos al correo/teléfono registrado para confirmar los enlaces de videollamada o los detalles especiales de tu sesión.
                            </Text>
                        )}

                        <Hr className="border border-solid border-[#3a2f3d] my-[26px] mx-0 w-full" />

                        <Text className="text-[#718096] text-[12px] leading-[20px] text-center">
                            Abrazos de luz,<br />
                            Camí - Tu Luz Mágica
                        </Text>
                    </Container>
                </Body>
            </Html>
        </Tailwind>
    )
}
