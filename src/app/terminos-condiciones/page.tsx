import { Scale, Book, CreditCard, Truck, AlertCircle } from 'lucide-react';

export default function TerminosCondiciones() {
    return (
        <main className="min-h-screen bg-[#0a080c] pt-32 pb-20 relative overflow-hidden font-sans">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>

            <div className="container mx-auto px-6 max-w-4xl relative z-10">
                <header className="text-center mb-16">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-[0_0_30px_rgba(244,114,182,0.2)]">
                        <Scale className="w-8 h-8 text-[#f472b6]" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-display drop-shadow-[0_0_25px_rgba(244,114,182,0.4)]">Términos y Condiciones</h1>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto">
                        Bienvenida a <strong>Tu Luz Mágica</strong>. Al acceder a este espacio sagrado, aceptas estos acuerdos para mantener la armonía y el respeto mutuo.
                    </p>
                </header>

                <div className="grid gap-8">
                    <TermSection
                        icon={<Book className="w-6 h-6 text-secondary" />}
                        title="1. Servicios Espirituales"
                        content="Ofrecemos lecturas de tarot, rituales y acompañamiento holístico. Entendemos que estas herramientas son para el autoconocimiento y la guía espiritual. No sustituyen bajo ninguna circunstancia el asesoramiento médico, legal, financiero o psicológico profesional."
                    />

                    <TermSection
                        icon={<CreditCard className="w-6 h-6 text-primary" />}
                        title="2. Reservas y Pagos"
                        content="Todas las sesiones deben ser abonadas por adelantado para confirmar tu espacio en la agenda. Los pagos se procesan de forma segura. Nos reservamos el derecho de modificar los precios con previo aviso en el sitio web."
                    />

                    <TermSection
                        icon={<AlertCircle className="w-6 h-6 text-secondary" />}
                        title="3. Políticas de Cancelación"
                        content="El tiempo es energía. Puedes reprogramar tu sesión avisando con al menos 24 horas de antelación. Las cancelaciones con menos de 24 horas no son reembolsables, ya que ese espacio fue reservado exclusivamente para ti y no pudo ser ofrecido a otra alma."
                    />

                    <TermSection
                        icon={<Truck className="w-6 h-6 text-primary" />}
                        title="4. Envíos de Productos"
                        content="Los productos físicos son consagrados antes de su envío. Realizamos despachos a través de servicios de paquetería confiables. Si tu producto llega dañado, contáctanos dentro de las 48 horas posteriores a la recepción para gestionar una solución."
                    />

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                        <h3 className="text-xl font-bold text-white mb-4 font-display">Propiedad Intelectual</h3>
                        <p className="text-white/70 leading-relaxed mb-4">
                            Todo el contenido de este sitio (textos, imágenes, diseños de tiradas) es propiedad de Tu Luz Mágica. Te pedimos honrar nuestro trabajo no copiando ni reproduciendo el contenido sin permiso explícito.
                        </p>
                        <div className="text-xs text-white/30 italic text-right mt-6 border-t border-white/5 pt-4">
                            Última actualización: 10 de Febrero de 2026
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

function TermSection({ icon, title, content }: { icon: any, title: string, content: string }) {
    return (
        <section className="bg-[#151018] border border-white/5 rounded-3xl p-8 hover:border-primary/30 transition-colors duration-500 shadow-lg group">
            <div className="flex items-start gap-6">
                <div className="shrink-0 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors">
                    {icon}
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white mb-4 font-display group-hover:text-primary transition-colors">{title}</h3>
                    <p className="text-white/70 leading-relaxed text-lg font-body">
                        {content}
                    </p>
                </div>
            </div>
        </section>
    )
}
