
/**
 * Constantes estáticas para las políticas y condiciones de los servicios.
 * Estas condiciones son compartidas por todos los servicios según su categoría.
 */

export const SERVICE_POLICIES = {
    RITUAL: {
        conditions: "Para la realización de este servicio, se requiere el envío de nombres completos y fechas de nacimiento. Una vez procesada la reserva, me pondré en contacto contigo para solicitar los detalles necesarios. Todo el material (audios explicativos e imágenes del ritual en proceso) se enviará directamente a tu WhatsApp en un plazo de 48 a 72 horas hábiles tras haber recibido la información.",
        modality: "A Distancia (WhatsApp)",
        preparationTime: "48-72 Horas"
    },
    READING: {
        conditions: "Las lecturas se realizan via whatsapp, mediante imagenes y audios con la explicacion de la misma, se entrega en un lapso de 24 a 48 horas, si el clima no acompaña se pospone la lectura para el siguiente dia habil",
        modality: "WhatsApp o Google Meet",
        preparationTime: "Al Agendar"
    }
};
