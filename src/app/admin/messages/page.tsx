'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Eye, Trash2, Search, Mail, Reply, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function AdminMessages() {
    const [messages, setMessages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchMessages()
    }, [])

    const fetchMessages = async () => {
        try {
            setLoading(true)
            // Asumiendo que la tabla se llama 'contact_messages'
            const { data, error } = await supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                if (error.code === '42P01') {
                    // Table does not exist
                    console.warn("La tabla 'contact_messages' no existe.")
                    setMessages([])
                    return
                }
                throw error
            }
            setMessages(data || [])
        } catch (error) {
            console.error('Error fetching messages:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleReadStatus = async (messageId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('contact_messages')
                .update({ is_read: !currentStatus })
                .eq('id', messageId)

            if (error) throw error

            setMessages(messages.map(m => m.id === messageId ? { ...m, is_read: !currentStatus } : m))
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    const deleteMessage = async (messageId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este mensaje?')) return

        try {
            const { error } = await supabase
                .from('contact_messages')
                .delete()
                .eq('id', messageId)

            if (error) throw error

            setMessages(messages.filter(m => m.id !== messageId))
        } catch (error) {
            console.error('Error deleting message:', error)
        }
    }

    const filteredMessages = messages.filter(m =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white font-display mb-2">Bandeja de Entrada</h1>
                    <p className="text-white/50 text-sm">Gestiona consultas, dudas sobre terapias y mensajes generales de tus clientes.</p>
                </div>

                <div className="relative">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        type="text"
                        placeholder="Buscar por Email o Nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-4 py-3 bg-surface border border-white/10 rounded-full text-sm text-white focus:outline-hidden focus:border-primary/50 w-full md:w-80 transition-colors"
                    />
                </div>
            </div>

            <div className="bg-surface border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-wider text-white/50 font-bold">
                                <th className="p-6 font-medium">Remitente</th>
                                <th className="p-6 font-medium">Asunto</th>
                                <th className="p-6 font-medium hidden md:table-cell">Mensaje</th>
                                <th className="p-6 font-medium">Fecha</th>
                                <th className="p-6 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-12 text-white/50 animate-pulse">
                                        Cargando bandeja de entrada...
                                    </td>
                                </tr>
                            ) : filteredMessages.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-12 text-white/50">
                                        <Mail className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        La bandeja de entrada está vacía.
                                    </td>
                                </tr>
                            ) : (
                                filteredMessages.map((msg) => (
                                    <tr key={msg.id} className={`transition-colors group ${msg.is_read ? 'hover:bg-white/[0.02] opacity-70' : 'bg-primary/5 hover:bg-primary/10'}`}>
                                        <td className="p-6">
                                            <p className={`font-bold text-sm mb-1 ${msg.is_read ? 'text-white' : 'text-primary'}`}>
                                                {msg.name}
                                            </p>
                                            <p className="text-white/50 text-xs">
                                                {msg.email}
                                            </p>
                                        </td>

                                        <td className="p-6">
                                            <p className={`font-medium text-sm truncate max-w-[200px] ${msg.is_read ? 'text-white/80' : 'text-white'}`}>
                                                {msg.subject || 'Sin Asunto'}
                                            </p>
                                        </td>

                                        <td className="p-6 hidden md:table-cell">
                                            <p className="text-white/50 text-xs truncate max-w-[300px]">
                                                {msg.message}
                                            </p>
                                        </td>

                                        <td className="p-6">
                                            <p className="text-white/60 text-xs text-center md:text-left">
                                                {format(new Date(msg.created_at), "d MMM, HH:mm", { locale: es })}
                                            </p>
                                        </td>

                                        <td className="p-6 text-right space-x-2 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleReadStatus(msg.id, msg.is_read)}
                                                className={`p-2 rounded-lg transition-colors inline-flex ${msg.is_read ? 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}
                                                title={msg.is_read ? "Marcar como no leído" : "Marcar como leído"}
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                            <a
                                                href={`mailto:${msg.email}?subject=RE: ${msg.subject || 'Consulta Tu Luz Mágica'}`}
                                                className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-lg transition-colors inline-flex"
                                                title="Responder"
                                            >
                                                <Reply className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={() => deleteMessage(msg.id)}
                                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors inline-flex"
                                                title="Eliminar Mensaje"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
