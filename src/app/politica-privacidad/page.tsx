import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export default function PoliticaPrivacidad() {
    return (
        <main className="min-h-screen bg-[#0a080c] pt-32 pb-20 relative overflow-hidden font-sans">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>

            <div className="container mx-auto px-6 max-w-4xl relative z-10">
                <header className="text-center mb-16">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-[0_0_30px_rgba(244,114,182,0.2)]">
                        <Lock className="w-8 h-8 text-[#f472b6]" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-display drop-shadow-[0_0_25px_rgba(244,114,182,0.4)]">Política de Privacidad</h1>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto">
                        En <strong>Tu Luz Mágica</strong>, la confidencialidad es parte de nuestra ética sagrada. Aquí te explico cómo protejo tu energía y tus datos.
                    </p>
                </header>

                <div className="grid gap-8">
                    <PolicySection
                        icon={<Eye className="w-6 h-6 text-secondary" />}
                        title="1. Información que Recopilamos"
                        content="Recopilamos únicamente los datos esenciales para brindarte nuestros servicios: nombre, correo electrónico y detalles necesarios para tus lecturas o envíos. Toda información compartida durante las sesiones es estrictamente confidencial y sagrada."
                    />

                    <PolicySection
                        icon={<FileText className="w-6 h-6 text-primary" />}
                        title="2. Uso de la Información"
                        content={
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Procesamiento de Pedidos:</strong> Para gestionar tus compras y reservas.</li>
                                <li><strong>Comunicación Mística:</strong> Para enviarte tus lecturas, confirmaciones o novedades (solo si aceptaste recibirlas).</li>
                                <li><strong>Mejora del Servicio:</strong> Para entender qué herramientas resuenan más contigo.</li>
                            </ul>
                        }
                    />

                    <PolicySection
                        icon={<ShieldCheck className="w-6 h-6 text-secondary" />}
                        title="3. Protección de Datos"
                        content="Implementamos medidas de seguridad digitales y energéticas. Tus datos están resguardados en servidores seguros y nunca serán vendidos ni compartidos con terceros sin tu consentimiento explícito."
                    />

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                        <h3 className="text-xl font-bold text-white mb-4 font-display">Tus Derechos</h3>
                        <p className="text-white/70 leading-relaxed mb-4">
                            Tienes derecho a acceder, corregir o eliminar tu información personal de nuestra base de datos en cualquier momento. Solo escríbenos a <a href="mailto:hola@tuluzmagica.com" className="text-primary hover:underline">hola@tuluzmagica.com</a>.
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

function PolicySection({ icon, title, content }: { icon: any, title: string, content: any }) {
    return (
        <section className="bg-[#151018] border border-white/5 rounded-3xl p-8 hover:border-primary/30 transition-colors duration-500 shadow-lg group">
            <div className="flex items-start gap-6">
                <div className="shrink-0 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors">
                    {icon}
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white mb-4 font-display group-hover:text-primary transition-colors">{title}</h3>
                    <div className="text-white/70 leading-relaxed text-lg font-body">
                        {content}
                    </div>
                </div>
            </div>
        </section>
    )
}
