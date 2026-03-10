'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Edit2, Save, X, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

type CategoryType = 'product' | 'service'

interface Category {
    id: string
    name: string
    slug: string
    description: string
    is_active: boolean
    display_order: number
}

export default function AdminCategories() {
    const { showToast } = useToast()
    const [supabase] = useState(() => createClient())
    const [activeTab, setActiveTab] = useState<CategoryType>('product')
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Creating/editing state
    const [isEditing, setIsEditing] = useState<string | null>(null)
    const [formData, setFormData] = useState<Partial<Category>>({
        name: '',
        slug: '',
        description: '',
        is_active: true,
        display_order: 0
    })

    // Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

    const fetchCategories = useCallback(async (type: CategoryType) => {
        setLoading(true)
        const table = type === 'product' ? 'product_categories' : 'service_categories'
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .order('display_order', { ascending: true })
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching categories:', error)
            showToast('Error al cargar categorías', 'error')
        } else {
            setCategories(data || [])
        }
        setLoading(false)
    }, [supabase, showToast])

    useEffect(() => {
        fetchCategories(activeTab)
    }, [activeTab, fetchCategories])

    const handleCreateNew = () => {
        setIsEditing('new')
        setFormData({
            name: '',
            slug: '',
            description: '',
            is_active: true,
            display_order: categories.length
        })
    }

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        const checked = (e.target as HTMLInputElement).checked

        setFormData(prev => {
            const updated = { ...prev, [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value) }
            // Auto generate slug
            if (name === 'name' && (!prev.slug || prev.slug === generateSlug(prev.name || ''))) {
                updated.slug = generateSlug(value)
            }
            return updated
        })
    }

    const saveCategory = async () => {
        if (!formData.name || !formData.slug) {
            showToast('Nombre y Slug son requeridos', 'info')
            return
        }
        setSaving(true)
        const table = activeTab === 'product' ? 'product_categories' : 'service_categories'

        try {
            if (isEditing === 'new') {
                const { error } = await supabase.from(table).insert([formData])
                if (error) throw error
            } else {
                const { error } = await supabase.from(table).update(formData).eq('id', isEditing)
                if (error) throw error
            }

            setIsEditing(null)
            fetchCategories(activeTab)
            showToast('Categoría guardada exitosamente', 'success')
        } catch (err: unknown) {
            console.error(err)
            const message = err instanceof Error ? err.message : String(err)
            showToast('Ocurrió un error al guardar: ' + message, 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteClick = (categoryId: string) => {
        setCategoryToDelete(categoryId)
        setIsDeleteModalOpen(true)
    }

    const deleteCategory = async () => {
        if (!categoryToDelete) return

        const table = activeTab === 'product' ? 'product_categories' : 'service_categories'
        try {
            const { error } = await supabase.from(table).delete().eq('id', categoryToDelete)
            if (error) throw error
            fetchCategories(activeTab)
            showToast('Categoría eliminada correctamente', 'success')
        } catch (err: unknown) {
            console.error(err)
            showToast('Error al eliminar categoría (quizás hay dependencias).', 'error')
        } finally {
            setCategoryToDelete(null)
        }
    }

    const toggleStatus = async (cat: Category) => {
        const table = activeTab === 'product' ? 'product_categories' : 'service_categories'
        const { error } = await supabase.from(table).update({ is_active: !cat.is_active }).eq('id', cat.id)
        if (!error) {
            setCategories(categories.map(c => c.id === cat.id ? { ...c, is_active: !c.is_active } : c))
        }
    }

    return (
        <div className="space-y-8 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white font-display mb-2">Categorías</h1>
                    <p className="text-white/50 text-sm">Gestiona cómo se agrupan tus productos y servicios en el sitio.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-4">
                <button
                    onClick={() => { setActiveTab('product'); setIsEditing(null) }}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'product' ? 'bg-primary text-white shadow-lg' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                >
                    Categorías de Productos Físicos
                </button>
                <button
                    onClick={() => { setActiveTab('service'); setIsEditing(null) }}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'service' ? 'bg-primary text-white shadow-lg' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                >
                    Categorías de Servicios
                </button>
            </div>

            <div className="bg-surface border border-white/5 rounded-3xl p-6 shadow-2xl">

                {/* Header and Add Button */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Listado de Categorías</h2>
                    <button onClick={handleCreateNew} disabled={isEditing !== null} className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-xl transition-colors font-bold text-sm disabled:opacity-50">
                        <Plus className="w-4 h-4" /> Nueva Categoría
                    </button>
                </div>

                {/* Form Editor */}
                {isEditing && (
                    <div className="bg-black/20 border border-white/10 rounded-2xl p-6 mb-8 mt-4 animate-in fade-in slide-in-from-top-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">{isEditing === 'new' ? 'Crear Categoría' : 'Editar Categoría'}</h3>
                            <button onClick={() => setIsEditing(null)} className="text-white/50 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Nombre</label>
                                <input required type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-hidden focus:border-primary/50" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Slug (URL)</label>
                                <input required type="text" name="slug" value={formData.slug || ''} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-hidden focus:border-primary/50" />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Descripción</label>
                                <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-hidden focus:border-primary/50" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Orden (Prioridad visual)</label>
                                <input type="number" name="display_order" value={formData.display_order || 0} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-hidden focus:border-primary/50" />
                            </div>
                            <div className="flex items-center gap-3 mt-6">
                                <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 rounded accent-primary bg-white/5 border-white/10" />
                                <label htmlFor="is_active" className="text-sm font-bold text-white/90">Activa</label>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={saveCategory} disabled={saving} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-full font-bold transition-all disabled:opacity-50">
                                {saving ? 'Guardando...' : <><Save className="w-4 h-4" /> Guardar</>}
                            </button>
                        </div>
                    </div>
                )}

                {/* List Categories */}
                {loading ? (
                    <div className="text-center py-12 text-white/50 animate-pulse">Cargando categorías...</div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-12 text-white/30 bg-white/5 rounded-2xl border border-white/5">
                        <p>No se encontraron categorías.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {categories.map(cat => (
                            <div key={cat.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${isEditing === cat.id ? 'bg-primary/5 border-primary/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                    <div className="w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center text-white/50 font-bold text-xs border border-white/5">
                                        {cat.display_order}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-bold">{cat.name}</p>
                                            {!cat.is_active && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Inactiva</span>}
                                        </div>
                                        <p className="text-white/40 text-xs">/{cat.slug}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <button onClick={() => toggleStatus(cat)} title={cat.is_active ? "Desactivar" : "Activar"} className={`p-2 rounded-lg transition-colors ${cat.is_active ? 'text-green-400 hover:bg-green-400/10' : 'text-white/30 hover:bg-white/10'}`}>
                                        <CheckCircle2 className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => { setIsEditing(cat.id); setFormData(cat) }} title="Editar" className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDeleteClick(cat.id)} title="Eliminar" className="p-2 text-red-500/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={deleteCategory}
                title="¿Eliminar Categoría?"
                message="¿Estás seguro de que quieres eliminar esta categoría de forma permanente? Esta acción podría afectar a los productos o servicios que dependen de ella."
                confirmText="Eliminar"
                variant="danger"
            />
        </div>
    )
}
