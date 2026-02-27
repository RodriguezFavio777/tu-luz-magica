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
    Tailwind
} from '@react-email/components'

export interface OrderItem {
    name: string
    quantity: number
    price: number
    type: string
}

interface AdminNotificationEmailProps {
    orderType: 'Venta' | 'Reserva' | 'Mensaje'
    customerName: string
    customerEmail: string
    totalAmount?: number
    items?: OrderItem[]
    details?: string
    shippingAddress?: string
    link?: string
}

export function AdminNotificationEmail({
    orderType,
    customerName,
    customerEmail,
    totalAmount,
    items,
    details,
    shippingAddress,
    link
}: AdminNotificationEmailProps) {
    return (
        <Tailwind>
            <Html>
                <Head />
                <Body className="bg-[#f3f4f6] font-sans text-gray-800 my-auto mx-auto px-2">
                    <Container className="border border-solid border-gray-300 rounded-lg my-[40px] mx-auto p-[30px] w-[550px] bg-white shadow-xl">
                        <Section className="text-center pb-4">
                            <Text className="text-blue-500 font-bold uppercase tracking-widest text-sm m-0">NUEVA ACTIVIDAD EN EL SITIO</Text>
                        </Section>

                        <Heading className="text-gray-900 text-[22px] font-bold text-center mt-2 mb-6">
                            Has recibido una nueva {orderType}
                        </Heading>

                        <Text className="text-gray-600 text-[16px] leading-[24px]">
                            Hola administradora,
                        </Text>

                        <Text className="text-gray-600 text-[15px] leading-[24px] mb-[20px]">
                            Un usuario acaba de realizar una acción en Tu Luz Mágica. Aquí están los detalles:
                        </Text>

                        <Section className="bg-gray-50 border border-gray-200 p-4 rounded-md mb-[20px]">
                            <Text className="text-gray-800 font-bold mb-1">Datos del Cliente:</Text>
                            <Text className="text-gray-600 m-0 text-sm">- Nombre: {customerName}</Text>
                            <Text className="text-gray-600 m-0 text-sm mb-2">- Correo: {customerEmail}</Text>

                            {shippingAddress && (
                                <Text className="text-gray-600 m-0 text-sm mt-2">- Envío: {shippingAddress}</Text>
                            )}

                            {details && (
                                <>
                                    <Hr className="border border-solid border-gray-300 my-4" />
                                    <Text className="text-gray-800 font-bold mb-1">Mensaje/Detalles:</Text>
                                    <Text className="text-gray-600 m-0 text-sm italic">"{details}"</Text>
                                </>
                            )}

                            {items && items.length > 0 && (
                                <>
                                    <Hr className="border border-solid border-gray-300 my-4" />
                                    <Text className="text-gray-800 font-bold mb-2">Artículos/Servicios:</Text>
                                    {items.map((item, index) => (
                                        <div key={index} className="flex flex-row justify-between mb-2">
                                            <Text className="text-gray-700 text-[14px] m-0">
                                                {item.quantity}x {item.name}
                                            </Text>
                                            <Text className="text-gray-600 text-[13px] font-bold m-0 text-right">
                                                ${item.price.toLocaleString('es-AR')}
                                            </Text>
                                        </div>
                                    ))}
                                    <Hr className="border border-dotted border-gray-300 my-2" />
                                    <div className="flex flex-row justify-between">
                                        <Text className="text-gray-900 font-bold text-[15px] m-0">Total</Text>
                                        <Text className="text-green-600 font-bold text-[15px] m-0 text-right">
                                            ${totalAmount?.toLocaleString('es-AR')}
                                        </Text>
                                    </div>
                                </>
                            )}
                        </Section>

                        {link && (
                            <Section className="text-center mt-[32px] mb-[32px]">
                                <a
                                    className="bg-blue-600 rounded text-center text-white text-[14px] font-bold px-[20px] py-[12px] no-underline"
                                    href={link}
                                >
                                    Ver en el Panel de Control
                                </a>
                            </Section>
                        )}

                        <Hr className="border border-solid border-gray-200 mt-6 mb-4 w-full" />

                        <Text className="text-gray-400 text-[12px] leading-[20px] text-center">
                            Este es un correo automático generado por tu plataforma Tu Luz Mágica E-Commerce.
                        </Text>
                    </Container>
                </Body>
            </Html>
        </Tailwind>
    )
}
