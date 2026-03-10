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
                    <Container className="border border-solid border-gray-300 rounded-lg my-[40px] mx-auto p-[30px] w-[600px] bg-white shadow-xl">
                        <Section className="text-center pb-4">
                            <Text className="text-blue-500 font-bold uppercase tracking-widest text-sm m-0">NUEVA ACTIVIDAD EN EL SITIO</Text>
                        </Section>

                        <Heading className="text-gray-900 text-[24px] font-bold text-center mt-2 mb-6 font-serif">
                            Has recibido una nueva {orderType}
                        </Heading>

                        <Text className="text-gray-600 text-[16px] leading-[24px]">
                            Hola administradora,
                        </Text>

                        <Text className="text-gray-600 text-[15px] leading-[24px] mb-[20px]">
                            Un usuario acaba de realizar una acción en Tu Luz Mágica. Aquí están los detalles:
                        </Text>

                        <Section className="bg-gray-50 border border-gray-200 p-6 rounded-xl mb-[20px]">
                            <Text className="text-gray-800 font-bold mb-3 uppercase tracking-wider text-[12px]">Datos del Cliente</Text>
                            <Row className="mb-2">
                                <Column style={{ width: '30%' }}>
                                    <Text className="text-gray-400 text-[12px] m-0">Nombre:</Text>
                                </Column>
                                <Column>
                                    <Text className="text-gray-800 text-[14px] font-bold m-0">{customerName}</Text>
                                </Column>
                            </Row>
                            <Row className="mb-2">
                                <Column style={{ width: '30%' }}>
                                    <Text className="text-gray-400 text-[12px] m-0">Correo:</Text>
                                </Column>
                                <Column>
                                    <Text className="text-gray-800 text-[14px] font-bold m-0">{customerEmail}</Text>
                                </Column>
                            </Row>

                            {shippingAddress && (
                                <Row className="mb-2">
                                    <Column style={{ width: '30%' }}>
                                        <Text className="text-gray-400 text-[12px] m-0">Envío:</Text>
                                    </Column>
                                    <Column>
                                        <Text className="text-gray-800 text-[14px] font-bold m-0">{shippingAddress}</Text>
                                    </Column>
                                </Row>
                            )}

                            {details && (
                                <>
                                    <Hr className="border-t border-solid border-gray-200 my-4" />
                                    <Text className="text-gray-800 font-bold mb-1 uppercase tracking-wider text-[12px]">Mensaje/Detalles:</Text>
                                    <Text className="text-gray-600 m-0 text-sm italic">&quot;{details}&quot;</Text>
                                </>
                            )}

                            {items && items.length > 0 && (
                                <>
                                    <Hr className="border-t border-solid border-gray-200 my-6" />
                                    <Text className="text-gray-800 font-bold mb-4 uppercase tracking-wider text-[12px]">Artículos/Servicios:</Text>

                                    {/* Header Row */}
                                    <Row className="mb-2">
                                        <Column style={{ width: '55%' }}>
                                            <Text className="text-gray-400 text-[10px] font-bold uppercase m-0">PRODUCTO</Text>
                                        </Column>
                                        <Column style={{ width: '15%' }} align="center">
                                            <Text className="text-gray-400 text-[10px] font-bold uppercase m-0">CANT.</Text>
                                        </Column>
                                        <Column style={{ width: '30%' }} align="right">
                                            <Text className="text-gray-400 text-[10px] font-bold uppercase m-0">TOTAL</Text>
                                        </Column>
                                    </Row>

                                    {items.map((item, index) => (
                                        <Section key={index} className="mb-3">
                                            <Row className="items-center">
                                                <Column style={{ width: '55%' }}>
                                                    <Text className="text-gray-900 text-[13px] font-bold m-0">{item.name}</Text>
                                                    {item.variantName && (
                                                        <Text className="text-pink-500 text-[10px] m-0 mt-0.5 italic">Variante: {item.variantName}</Text>
                                                    )}
                                                    {item.bookingDate && (
                                                        <Text className="text-blue-600 text-[10px] m-0 mt-0.5 font-bold">📅 {item.bookingDate}{item.bookingTime ? `, ${item.bookingTime}` : ''}</Text>
                                                    )}
                                                </Column>
                                                <Column style={{ width: '15%' }} align="center">
                                                    <Text className="text-gray-600 text-[13px] m-0">{item.quantity}</Text>
                                                </Column>
                                                <Column style={{ width: '30%' }} align="right">
                                                    <Text className="text-gray-900 text-[13px] font-bold m-0">${(item.quantity * item.price).toLocaleString('es-AR')}</Text>
                                                </Column>
                                            </Row>
                                            {index < items.length - 1 && <Hr className="border-t border-solid border-gray-100 my-2" />}
                                        </Section>
                                    ))}

                                    <Hr className="border-t border-solid border-gray-200 my-4" />

                                    <Row>
                                        <Column align="right">
                                            <Text className="text-gray-900 font-bold text-[16px] m-0 uppercase tracking-widest">Total</Text>
                                        </Column>
                                        <Column style={{ width: '30%' }} align="right">
                                            <Text className="text-green-600 font-bold text-[18px] m-0">
                                                ${totalAmount?.toLocaleString('es-AR')}
                                            </Text>
                                        </Column>
                                    </Row>
                                </>
                            )}
                        </Section>

                        {link && (
                            <Section className="text-center mt-[32px] mb-[32px]">
                                <a
                                    className="bg-blue-600 rounded-full text-center text-white text-[14px] font-bold px-[30px] py-[15px] no-underline shadow-lg"
                                    href={link}
                                >
                                    Ver en el Panel de Control
                                </a>
                            </Section>
                        )}

                        <Hr className="border border-solid border-gray-200 mt-6 mb-4 w-full" />

                        <Text className="text-gray-400 text-[12px] leading-[20px] text-center italic">
                            Este es un correo automático generado por tu plataforma Tu Luz Mágica E-Commerce.
                        </Text>
                    </Container>
                </Body>
            </Html>
        </Tailwind>
    )
}
