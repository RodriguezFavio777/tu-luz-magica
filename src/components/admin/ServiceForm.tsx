'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Upload, X, Plus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/context/ToastContext'
import { saveService } from '@/lib/actions/serviceActions'

interface ServiceFormProps {
    id: string
}

interface ServiceVariant {
    id: string
    name: string
    price: number
    duration: number
    duration_unit: string
}

export default function ServiceForm({ id }: ServiceFormProps) {
    const { showToast } = useToast()
    const [supabase] = useState(() => createClient())
    const isNew = id === 'new'
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
    const [uploading, setUploading] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        duration_minutes: 60,
        duration_unit: 'minutos',
        category_id: '',
        image_url: '',
        is_active: true
    })

    const [variants, setVariants] = useState<ServiceVariant[]>([])
    const [includes, setIncludes] = useState<string[]>([])
    const [newInclusion, setNewInclusion] = useState('')

    const fetchCategories = useCallback(async () => {
        const { data } = await supabase.from('service_categories').select('id, name').order('name')
        if (data) setCategories(data)
    }, [supabase])

    const fetchService = useCallback(async () => {
        const { data } = await supabase.from('services').select('*').eq('id', id).single()
        if (data) {
            setFormData({
                name: data.name || '',
                description: data.description || '',
                price: data.price || 0,
                duration_minutes: data.duration_minutes || 60,
                duration_unit: data.duration_unit || 'minutos',
                category_id: data.category_id || '',
                image_url: data.image_url || '',
                is_active: data.is_active ?? true
            })
            setVariants(data.variants || [])
            setIncludes(data.includes || [])
        }
    }, [supabase, id])

    useEffect(() => {
        fetchCategories()
        if (!isNew) {
            fetchService()
        }
    }, [isNew, fetchCategories, fetchService])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type: inputType } = e.target
        const checked = (e.target as HTMLInputElement).checked

        setFormData(prev => ({
            ...prev,
            [name]: inputType === 'checkbox' ? checked : (name === 'price' || name === 'duration_minutes' ? Number(value) : value)
        }))
    }

    // Inclusions handlers
    const addInclusion = () => {
        if (newInclusion.trim()) {
            setIncludes([...includes, newInclusion.trim()])
            setNewInclusion('')
        }
    }

    const removeInclusion = (index: number) => {
        setIncludes(includes.filter((_, i) => i !== index))
    }

    // Variants handlers
    const addVariant = () => {
        setVariants([...variants, { id: crypto.randomUUID(), name: '', price: 0, duration: 60, duration_unit: 'minutos' }])
    }

    const updateVariant = (vId: string, field: keyof ServiceVariant, value: string | number) => {
        setVariants(variants.map(v => v.id === vId ? { ...v, [field]: value } : v))
    }

    const removeVariant = (vId: string) => {
        setVariants(variants.filter(v => v.id !== vId))
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)

            if (!e.target.files || e.target.files.length === 0) {
                throw new Error('Debes seleccionar una imagen para subir.')
            }

            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            // Subir a bucket "services"
            const { error: uploadError } = await supabase.storage
                .from('services')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            // Obtener URL pública
            const { data } = supabase.storage.from('services').getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, image_url: data.publicUrl }))
            showToast('Imagen subida correctamente')
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error desconocido'
            showToast('Error al subir imagen: ' + message, 'error')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = {
                ...formData,
                category_id: formData.category_id || null,
                variants: variants.filter(v => v.name.trim() !== ''),
                includes: includes.filter(i => i.trim() !== '')
            }

            const result = await saveService(id, payload)

            if (result.success) {
                showToast('Servicio guardado exitosamente', 'success')
                router.push('/admin/services')
                router.refresh()
            } else {
                throw new Error(result.error)
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error desconocido'
            console.error('Error saving:', error)
            showToast('Error al guardar: ' + message, 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8 max-w-4xl pb-12">
            <div className="flex items-center gap-4">
                <Link href='/admin/services' className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                    <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
                <h1 className="text-3xl font-bold text-white font-display">
                    {isNew ? 'Nuevo Servicio' : 'Editar Servicio'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Main Info */}
                <div className="bg-surface border border-white/5 rounded-3xl p-8 shadow-2xl space-y-6">
                    <h2 className="text-xl font-bold text-white font-display border-b border-white/5 pb-4">Información General</h2>

                    {/* Image Upload */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-white/70 uppercase tracking-widest block">Imagen Principal</label>
                        <div className="flex items-center gap-6">
                            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shrink-0 relative group">
                                {formData.image_url ? (
                                    <>
                                        <Image src={formData.image_url} alt="Service" fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                                            className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500/80 rounded-full text-white backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="shrink-0 w-full h-full flex items-center justify-center text-white/20">
                                        Sin imagen
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white cursor-pointer w-fit transition-colors">
                                    <Upload className="w-4 h-4" />
                                    <span>{uploading ? 'Subiendo...' : 'Subir Imagen'}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-white/40 text-xs mt-2">Recomendado: 800x800px. JPG, PNG o WebP.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/70 uppercase tracking-widest">Nombre del Servicio</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 transition-colors" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/70 uppercase tracking-widest">Categoría</label>
                            <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 transition-colors appearance-none">
                                <option value="" className="bg-surface font-sans">Sin categoría</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id} className="bg-surface font-sans">{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/70 uppercase tracking-widest">Descripción</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 transition-colors" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/70 uppercase tracking-widest">Precio Base (Referencial)</label>
                            <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/70 uppercase tracking-widest">Duración Base</label>
                            <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-primary/50 transition-colors">
                                <input required type="number" name="duration_minutes" value={formData.duration_minutes} onChange={handleChange} className="w-2/3 bg-transparent px-4 py-3 text-white focus:outline-hidden" />
                                <div className="w-px bg-white/10"></div>
                                <select name="duration_unit" value={formData.duration_unit} onChange={handleChange} className="w-1/3 bg-transparent px-2 py-3 text-white focus:outline-hidden appearance-none text-center font-bold">
                                    <option value="minutos" className="bg-surface font-sans">Minutos</option>
                                    <option value="horas" className="bg-surface font-sans">Horas</option>
                                    <option value="dias" className="bg-surface font-sans">Días</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-5 h-5 rounded accent-primary bg-white/5 border-white/10" />
                        <label htmlFor="is_active" className="text-sm font-bold text-white/90">Activo (Visible en el sitio)</label>
                    </div>
                </div>

                {/* Modalities / Pricing Varieties */}
                <div className="bg-surface border border-white/5 rounded-3xl p-8 shadow-2xl space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <h2 className="text-xl font-bold text-white font-display">Modalidades de Precio y Tiempo</h2>
                        <button type="button" onClick={addVariant} className="px-4 py-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-xl transition-colors font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Agregar Modalidad
                        </button>
                    </div>

                    <p className="text-white/40 text-xs">Define opciones como &quot;Pack 3 preguntas&quot;, &quot;Sesión Express&quot;, etc., cada una con su precio y tiempo propio.</p>

                    <div className="space-y-4">
                        {variants.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-2xl">
                                <p className="text-white/20 text-sm italic">No hay modalidades específicas. Se usará el precio base.</p>
                            </div>
                        )}
                        {variants.map((v) => (
                            <div key={v.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end bg-white/2 p-4 rounded-2xl border border-white/5 group hover:border-white/10 transition-colors">
                                <div className="sm:col-span-5 space-y-1">
                                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Nombre de la Opción</label>
                                    <input type="text" placeholder='Ej: Pack 3 Preguntas' value={v.name} onChange={(e) => updateVariant(v.id, 'name', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary/50" />
                                </div>
                                <div className="sm:col-span-3 space-y-1">
                                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Precio</label>
                                    <input type="number" placeholder='Inversión' value={v.price} onChange={(e) => updateVariant(v.id, 'price', Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary/50" />
                                </div>
                                <div className="sm:col-span-3 space-y-1">
                                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Duración</label>
                                    <div className="flex bg-white/5 border border-white/10 rounded-lg overflow-hidden focus-within:border-primary/50 transition-colors">
                                        <input type="number" placeholder='Valor' value={v.duration} onChange={(e) => updateVariant(v.id, 'duration', Number(e.target.value))} className="w-1/2 bg-transparent px-3 py-2 text-white text-sm focus:outline-hidden" />
                                        <div className="w-px bg-white/10"></div>
                                        <select value={v.duration_unit || 'minutos'} onChange={(e) => updateVariant(v.id, 'duration_unit', e.target.value)} className="w-1/2 bg-transparent px-1 py-2 text-white text-xs focus:outline-hidden appearance-none text-center font-bold tracking-wider">
                                            <option value="minutos" className="bg-surface font-sans font-normal">Min</option>
                                            <option value="horas" className="bg-surface font-sans font-normal">Hrs</option>
                                            <option value="dias" className="bg-surface font-sans font-normal">Días</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="sm:col-span-1 flex justify-end">
                                    <button type="button" onClick={() => removeVariant(v.id)} className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* What includes */}
                <div className="bg-surface border border-white/5 rounded-3xl p-8 shadow-2xl space-y-6">
                    <h2 className="text-xl font-bold text-white font-display border-b border-white/5 pb-4">¿Qué incluye este servicio?</h2>

                    <div className="space-y-4 bg-white/2 p-6 rounded-2xl border border-white/5">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newInclusion}
                                onChange={(e) => setNewInclusion(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInclusion())}
                                placeholder="Ej: Lectura de oráculo personalizado"
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50"
                            />
                            <button type="button" onClick={addInclusion} className="px-6 py-3 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-xl font-bold transition-colors">
                                Agregar
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {includes.map((inc, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/80 px-4 py-2 rounded-xl text-sm animate-in fade-in zoom-in-95">
                                    <span>{inc}</span>
                                    <button type="button" onClick={() => removeInclusion(idx)} className="text-white/30 hover:text-red-400 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-4">
                    <Link href="/admin/services" className="px-8 py-3 rounded-full font-bold text-white/50 hover:text-white transition-colors">
                        Cancelar
                    </Link>
                    <button type="submit" disabled={loading || uploading} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-10 py-3 rounded-full font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50">
                        {loading ? <div className="w-5 h-5 rounded-full border-2 border-white/50 border-t-transparent animate-spin" /> : <Save className="w-5 h-5" />}
                        {loading ? 'Guardando...' : 'Publicar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    )
}

