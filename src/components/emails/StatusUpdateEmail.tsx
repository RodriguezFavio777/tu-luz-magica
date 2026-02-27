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

interface StatusUpdateEmailProps {
    customerName: string
    orderId: string
    newStatus: string
    isBooking: boolean
}

export function StatusUpdateEmail({
    customerName,
    orderId,
    newStatus,
    isBooking
}: StatusUpdateEmailProps) {
    return (
        <Tailwind>
            <Html>
                <Head />
                <Body className="bg-[#120d14] font-sans text-white my-auto mx-auto px-2">
                    <Container className="border border-solid border-[#3a2f3d] rounded-lg my-[40px] mx-auto p-[30px] w-[500px] bg-[#1d1520]">
                        <Section className="text-center">
                            <Text className="text-[#f472b6] text-xl font-bold uppercase tracking-widest text-center mt-2">
                                Tu Luz Mágica
                            </Text>
                        </Section>

                        <Heading className="text-white text-[24px] font-bold text-center mt-4 mb-8">
                            Actualización de tu {isBooking ? 'Reserva' : 'Pedido'}
                        </Heading>

                        <Text className="text-[#e2e8f0] text-[16px] leading-[24px]">
                            Hola {customerName},
                        </Text>

                        <Text className="text-[#a0aec0] text-[15px] leading-[24px] mb-[20px]">
                            Te escribimos para informarte que el estado de tu {isBooking ? 'turno' : 'pedido'} #{orderId.slice(-6)} ha cambiado a:
                        </Text>

                        <Section className="bg-[#2c1f30] p-4 rounded-md mb-[20px] text-center border border-[#f472b6]/20">
                            <Text className="text-[#f472b6] font-bold text-[20px] uppercase tracking-wider m-0">
                                {newStatus}
                            </Text>
                        </Section>

                        {newStatus.toLowerCase() === 'enviado' && (
                            <Text className="text-[#a8eb12] text-[15px] leading-[22px] italic mt-4 text-center">
                                ¡Tu pedido ya está en camino!
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
