ESPECIFICACIÓN TÉCNICA: PLATAFORMA DE TERAPIA HOLÍSTICA & E-COMMERCE
1. VISIÓN DEL PRODUCTO
Construir una plataforma de "Lujo Místico" que combine la venta de servicios intangibles (lecturas de tarot, sesiones de reiki) con productos físicos (sahumerios, cristales) en una experiencia unificada.

Referentes Visuales: The Hoodwitch, Labyrinthos Academy, Sage Goddess.

Estética: Oscura, elegante, dorada, tipografía serif, animaciones suaves (framer-motion).

2. STACK TECNOLÓGICO (NO NEGOCIABLE)
Frontend: Next.js 15 (App Router, Server Components).

Estilos: Tailwind CSS + Framer Motion.

Base de Datos: Supabase (PostgreSQL) con Row Level Security (RLS) estricto.

Pagos: Mercado Pago (integración nativa vía SDK/MCP, no botones externos simples).

Estado: Zustand (para el carrito de compras híbrido).

3. REQUERIMIENTOS CRÍTICOS DE NEGOCIO
A. El "Carrito Híbrido" (Desafío Técnico Principal)
El sistema debe manejar dos tipos de ítems en el mismo checkout:

Productos Físicos (Physical): Requieren cálculo de envío, dirección postal y control de stock estricto.

Servicios (Service): Requieren selección de fecha/hora (booking), no tienen envío físico, y gestión de disponibilidad. Regla de Negocio: Si el carrito tiene SOLO servicios, no pedir dirección de envío. Si tiene al menos un producto físico, activar flujo de logística (API Correo/Andreani).

B. Módulo de Reservas (Booking)
Evitar doble reserva (race conditions) en la base de datos.

Dashboard de terapeuta para bloquear horarios.

Integración con Google Calendar (futura), por ahora tabla bookings en Supabase.

C. Experiencia de Usuario "Mística"
Widget de "Carta del Tarot del Día" en el Home.

Indicador de Fase Lunar en el header.

Micro-interacciones que evoquen "magia" (fade-ins lentos, partículas).

4. MODELADO DE DATOS SUGERIDO (Supabase)
profiles: Extensión de auth.users con datos de nacimiento (carta astral).

products: type (enum: 'physical', 'service'), stock, price, shipping_weight.

bookings: start_time, end_time, status, therapist_id.

orders: Relaciona productos físicos y servicios pagados.

5. INTEGRACIÓN DE PAGOS
Usar preferencia de pago de Mercado Pago.

Webhooks obligatorios para confirmar stock y reservas solo cuando el pago sea approved.