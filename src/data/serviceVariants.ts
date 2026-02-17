
export interface ServiceVariant {
    id: string;
    name: string;
    price: number;
    duration: string;
}

export interface ServiceDetail {
    variants: ServiceVariant[];
    shortDescription?: string;
    features: string[]; // "Qué incluye este servicio?"
    conditions: string; // "Condiciones de Trabajo"
    preparationTime: string; // "48-72 Horas" (Tiempo de entrega o preparación)
    modality: string; // "Audio + Fotos", "Online (Zoom)", "A distancia"
}

export const SERVICE_DETAILS: Record<string, ServiceDetail> = {
    // 1. RITUALES (General)
    'Ritual de Endulzamiento y Unión': {
        variants: [
            { id: 'end-corto', name: 'Ritual Corto (Movimiento de Energías)', price: 300000, duration: '5-8 horas' },
            { id: 'end-24h', name: 'Velación 24 hs (Refuerzo de Unión)', price: 500000, duration: '24 horas' },
            { id: 'end-3-6d', name: 'Velación Completa (Profundo)', price: 800000, duration: '3 a 6 días' },
            { id: 'end-7-14d', name: 'Velación Intensiva (Retorno)', price: 1500000, duration: '7 a 14 días' }
        ],
        features: [
            "Limpieza energética de ambos canales espirituales.",
            "Ritual de endulzamiento con elementos naturales y velas alquimizadas.",
            "Lectura de Tarot complementaria para ver el estado de la unión.",
            "Activación de protección para el vínculo de pareja.",
            "Audio explicativo personalizado con recomendaciones y guía.",
            "Seguimiento de 15 días tras finalizar el ritual."
        ],
        conditions: "Para la realización de este servicio, se requiere el envío de nombres completos y fechas de nacimiento. Una vez procesada la reserva, me pondré en contacto contigo para solicitar los detalles necesarios. Todo el material (audios explicativos e imágenes del ritual en proceso) se enviará directamente a tu WhatsApp en un plazo de 48 a 72 horas hábiles tras haber recibido la información.",
        preparationTime: "48-72 Horas",
        modality: "A Distancia (WhatsApp)"
    },

    'Ritual de Amor Propio y Magnetismo': {
        variants: [
            { id: 'ap-corto', name: 'Ritual Corto (Activación)', price: 250000, duration: '5-8 horas' },
            { id: 'ap-24h', name: 'Velación 24 hs (Magnetismo)', price: 400000, duration: '24 horas' },
            { id: 'ap-3d', name: 'Velación 3 días (Sostenido)', price: 750000, duration: '3 días' },
            { id: 'ap-7d', name: 'Velación 7 días (Renacimiento)', price: 1000000, duration: '7 días' }
        ],
        features: [
            "Limpieza debloqueos emocionales y energéticos.",
            "Baño de florecimiento a distancia (intencionado).",
            "Velas de miel y rosas para activar el magnetismo personal.",
            "Reporte completo con fotos del altar y las velas.",
            "Consejos canalizados para mantener la vibración alta."
        ],
        conditions: "Necesitaré una foto tuya reciente y tu nombre completo. Es ideal realizarlo en Luna Creciente o Llena, aunque podemos adaptarlo a tu urgencia. Recibirás todo el material por WhatsApp.",
        preparationTime: "24-48 Horas",
        modality: "A Distancia (WhatsApp)"
    },

    'Limpieza Energética y Corte de Daños': {
        variants: [
            { id: 'limp-ind', name: 'Limpieza Individual Profunda', price: 200000, duration: 'Sesión' },
            { id: 'limp-hogar', name: 'Limpieza de Hogar/Negocio', price: 350000, duration: '1 día' },
            { id: 'limp-fam', name: 'Limpieza Familiar (hasta 4 personas)', price: 450000, duration: '24 horas' }
        ],
        features: [
            "Rastreo de larvas astrales y bloqueos.",
            "Corte de cordones energéticos negativos.",
            "Harmonización de chakras.",
            "Protección energética para el aura.",
            "Devolución por audio explicativo."
        ],
        conditions: "Se requiere nombre completo y fecha de nacimiento de las personas a limpiar. Para hogares, fotos de los ambientes principales. El reporte se envía al finalizar el trabajo.",
        preparationTime: "24-48 Horas",
        modality: "A Distancia (WhatsApp)"
    },

    // 2. LECTURAS (Tarot)
    'Lectura de Vínculo Amoroso / Ex': {
        variants: [
            { id: 'vinculo-wpp', name: 'Lectura por WhatsApp (Audios + Fotos)', price: 150000, duration: '45-60 min' },
            { id: 'vinculo-video', name: 'Lectura por Videollamada (En Vivo)', price: 180000, duration: '90 min' }
        ],
        features: [
            "Análisis profundo de la energía de ambos.",
            "Pensamientos, sentimientos e intenciones de tu persona especial.",
            "Futuro inmediato y consejos del oráculo.",
            "Fotos de la tirada completa.",
            "Audio o Video explicativo detallado."
        ],
        conditions: "Si eliges WhatsApp, recibirás la lectura en el día agendado. Si eliges Videollamada, nos conectaremos en vivo a través de Google Meet o WhatsApp Video.",
        preparationTime: "Dia Agendado",
        modality: "WhatsApp o Google Meet"
    },

    'Lectura General': {
        variants: [
            { id: 'gen-wpp', name: 'Lectura por WhatsApp (Audios + Fotos)', price: 140000, duration: '45-60 min' },
            { id: 'gen-live', name: 'Lectura por Videollamada (En Vivo)', price: 220000, duration: '90 min' }
        ],
        features: [
            "Panorama general de Salud, Dinero y Amor.",
            "Mensajes de tus guías espirituales.",
            "Identificación de bloqueos actuales.",
            "Consejo final del Tarot."
        ],
        conditions: "Lectura evolutiva para comprender tu momento presente. Opción asincrónica (WhatsApp) o sincrónica (Videollamada) según tu preferencia.",
        preparationTime: "Dia Agendado",
        modality: "WhatsApp o Google Meet"
    },

    'Preguntas Específicas': {
        variants: [
            { id: 'preg-1', name: '1 Pregunta Concreta', price: 60000, duration: '15 min aprox' },
            { id: 'preg-3', name: 'Pack 3 Preguntas', price: 160000, duration: '30 min aprox' }
        ],
        features: [
            "Respuestas directas y claras.",
            "Sin rodeos, vamos al punto de tu duda.",
            "Foto de la carta consejo."
        ],
        conditions: "Ideal para dudas puntuales. Se responde vía audio de WhatsApp en el día (según demanda).",
        preparationTime: "24 Horas",
        modality: "Audio WhatsApp"
    },

    'Lectura Astrológica Anual': {
        variants: [
            { id: 'revolucion', name: 'Revolución Solar (Clima del Año)', price: 120000, duration: '45-60 min' }
        ],
        features: [
            "Clima astrológico de tu año personal.",
            "Fechas claves y tránsitos importantes.",
            "Foco de atención para el crecimiento.",
            "Audio grabado para que lo escuches cuando quieras."
        ],
        conditions: "Se requiere hora exacta de nacimiento, fecha y lugar. Entrega en formato audio diferido + gráfico de la carta.",
        preparationTime: "3-5 Días",
        modality: "Audio Diferido"
    }
};

// Backward compatibility helper
export const SERVICE_VARIANTS: Record<string, { id: string, name: string, price: number, duration?: string }[]> =
    Object.fromEntries(Object.entries(SERVICE_DETAILS).map(([k, v]) => [k, v.variants]));

