'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Trash2, Edit, Search, Plus, Hexagon } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/context/ToastContext'
import { deleteService, getAdminServices } from '@/lib/actions/serviceActions'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Service } from '@/services/ServiceService'

interface AdminService extends Service {
    service_categories: { name: string } | null
}

export default function AdminServices() {
    const { showToast } = useToast()
    const [services, setServices] = useState<AdminService[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [serviceToDelete, setServiceToDelete] = useState<string | null>(null)

    const fetchServices = useCallback(async () => {
        try {
            setLoading(true)
            const data = await getAdminServices()
            setServices(data || [])
        } catch (error) {
            console.error('Error fetching services:', error)
            showToast('Error al cargar servicios')
        } finally {
            setLoading(false)
        }
    }, [showToast])

    useEffect(() => {
        fetchServices()
    }, [fetchServices])

    const handleDeleteClick = (serviceId: string) => {
        setServiceToDelete(serviceId)
        setIsDeleteModalOpen(true)
    }

    const deleteServiceHandler = async () => {
        if (!serviceToDelete) return

        try {
            const result = await deleteService(serviceToDelete)

            if (result.success) {
                setServices(services.filter(s => s.id !== serviceToDelete))
                showToast('Servicio eliminado exitosamente')
            } else {
                throw new Error(result.error)
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error desconocido'
            console.error('Error deleting service:', error)
            showToast('Hubo un problema al intentar eliminar el servicio: ' + message, 'error')
        } finally {
            setServiceToDelete(null)
        }
    }

    const filteredServices = services.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.service_categories?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white font-display mb-2">Servicios Holísticos</h1>
                    <p className="text-white/50 text-sm">Gestiona rituales de sanación, lecturas evolutivas y sesiones personalizadas.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-auto">
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                            type="text"
                            placeholder="Buscar servicio..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-3 bg-surface border border-white/10 rounded-full text-sm text-white focus:outline-hidden focus:border-primary/50 w-full sm:w-64 transition-colors"
                        />
                    </div>
                    <Link
                        href="/admin/services/new"
                        className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo
                    </Link>
                </div>
            </div>

            <div className="bg-surface border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-xs uppercase tracking-wider text-white/50 font-bold">
                                <th className="p-6 font-medium">Servicio</th>
                                <th className="p-6 font-medium">Categoría</th>
                                <th className="p-6 font-medium">Precio Base</th>
                                <th className="p-6 font-medium">Estado</th>
                                <th className="p-6 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-12 text-white/50 animate-pulse">
                                        Cargando servicios...
                                    </td>
                                </tr>
                            ) : filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-12 text-white/50">
                                        <Hexagon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        No se encontraron servicios.
                                    </td>
                                </tr>
                            ) : (
                                filteredServices.map((service) => (
                                    <tr key={service.id} className="hover:bg-white/2 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-xl border border-primary/20 text-primary">
                                                    <Hexagon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm tracking-wide group-hover:text-primary transition-colors">
                                                        {service.name}
                                                    </p>
                                                    <p className="text-white/40 text-xs truncate max-w-[200px]">
                                                        {service.description ? service.description.substring(0, 50) + '...' : 'Sin descripción'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-6">
                                            <span className="bg-white/5 border border-white/10 text-white/70 px-3 py-1 rounded-full text-xs font-medium">
                                                {service.service_categories?.name || 'Varios'}
                                            </span>
                                        </td>

                                        <td className="p-6">
                                            <p className="text-emerald-400 font-bold tracking-wide">
                                                ${service.price?.toLocaleString('es-AR')}
                                            </p>
                                        </td>

                                        <td className="p-6">
                                            <div className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block text-center ${service.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {service.is_active ? 'Activo' : 'Inactivo'}
                                            </div>
                                        </td>

                                        <td className="p-6 text-right space-x-2">
                                            <Link
                                                href={`/admin/services/${service.id}`}
                                                className="p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg transition-colors inline-flex"
                                                title="Editar Servicio"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteClick(service.id)}
                                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors inline-flex"
                                                title="Eliminar Servicio"
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

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={deleteServiceHandler}
                title="¿Eliminar Servicio?"
                message="¿Estás seguro de que quieres eliminar este servicio de forma permanente? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                variant="danger"
            />
        </div>
    )
}
