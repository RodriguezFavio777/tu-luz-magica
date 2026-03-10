'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Upload, X, Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/context/ToastContext'
import { saveProduct } from '@/lib/actions/productActions'

interface ProductFormProps {
    id: string
}

export default function ProductForm({ id }: ProductFormProps) {
    const { showToast } = useToast()
    const [supabase] = useState(() => createClient())
    const isNew = id === 'new'
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
    const [uploading, setUploading] = useState(false)

    // Images State
    const [imageUrl, setImageUrl] = useState('')
    const [images, setImages] = useState<string[]>([])

    // Variants State
    const [variants, setVariants] = useState<{ type: string, options: string[] }[]>([])

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        cost_price: 0,
        sku: '',
        is_featured: false,
        stock: 0,
        category_id: '',
        is_active: true
    })

    const fetchCategories = useCallback(async () => {
        const { data } = await supabase.from('product_categories').select('id, name').order('name')
        if (data) setCategories(data)
    }, [supabase])

    const fetchProduct = useCallback(async () => {
        const { data } = await supabase.from('products').select('*').eq('id', id).single()
        if (data) {
            setFormData({
                name: data.name || '',
                description: data.description || '',
                price: data.price || 0,
                cost_price: data.cost_price || 0,
                sku: data.sku || '',
                is_featured: data.is_featured || false,
                stock: data.stock || 0,
                category_id: data.category_id || '',
                is_active: data.is_active ?? true
            })
            setImageUrl(data.image_url || '')
            setImages(data.images || [])
            setVariants(Array.isArray(data.variants) ? data.variants as { type: string, options: string[] }[] : [])
        }
    }, [supabase, id])

    useEffect(() => {
        fetchCategories()
        if (!isNew) {
            fetchProduct()
        }
    }, [isNew, fetchCategories, fetchProduct])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type: inputType } = e.target
        const checked = (e.target as HTMLInputElement).checked

        setFormData(prev => ({
            ...prev,
            [name]: inputType === 'checkbox' ? checked : (name === 'price' || name === 'stock' ? Number(value) : value)
        }))
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)

            if (!e.target.files || e.target.files.length === 0) return

            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('products').getPublicUrl(filePath)

            setImages(prev => [...prev, data.publicUrl])
            if (!imageUrl) setImageUrl(data.publicUrl)

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error desconocido'
            showToast('Error al subir imagen: ' + message, 'error')
        } finally {
            setUploading(false)
        }
    }

    const removeImage = (url: string) => {
        const newImages = images.filter(img => img !== url)
        setImages(newImages)
        if (imageUrl === url) {
            setImageUrl(newImages.length > 0 ? newImages[0] : '')
        }
    }

    const makePrimaryImage = (url: string) => {
        setImageUrl(url)
    }

    // Variants Logic
    const addVariantGroup = () => {
        setVariants([...variants, { type: '', options: [] }])
    }

    const updateVariantType = (idx: number, val: string) => {
        const newVars = [...variants]
        newVars[idx].type = val
        setVariants(newVars)
    }

    const addVariantOption = (idx: number, optionName: string) => {
        if (!optionName.trim()) return
        const newVars = [...variants]
        if (!newVars[idx].options.includes(optionName)) {
            newVars[idx].options.push(optionName.trim())
        }
        setVariants(newVars)
    }

    const removeVariantOption = (idx: number, optionIdx: number) => {
        const newVars = [...variants]
        newVars[idx].options.splice(optionIdx, 1)
        setVariants(newVars)
    }

    const removeVariantGroup = (idx: number) => {
        const newVars = [...variants]
        newVars.splice(idx, 1)
        setVariants(newVars)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = {
                ...formData,
                category_id: formData.category_id || null,
                image_url: imageUrl,
                images: images,
                variants: variants.filter(v => v.type.trim() !== '' && v.options.length > 0)
            }

            const result = await saveProduct(id, payload)

            if (result.success) {
                showToast('Producto guardado exitosamente', 'success')
                router.push('/admin/products')
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
        <div className="space-y-8 max-w-4xl">
            <div className="flex items-center gap-4">
                <Link href='/admin/products' className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                    <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
                <h1 className="text-3xl font-bold text-white font-display">
                    {isNew ? 'Nuevo Producto Físico' : 'Editar Producto Físico'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-surface border border-white/5 rounded-3xl p-8 shadow-2xl space-y-8">

                {/* Image Upload Gallery */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <label className="text-sm font-bold text-white/70 uppercase tracking-widest block">Galería de Imágenes</label>
                        <label className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl cursor-pointer transition-colors text-sm font-medium">
                            <Upload className="w-4 h-4" />
                            <span>{uploading ? 'Subiendo...' : 'Agregar Imagen'}</span>
                            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 group">
                                <Image src={img} alt="Preview" fill className="object-cover" />

                                {/* Overlay Controls */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                    <div className="flex justify-end">
                                        <button type="button" onClick={() => removeImage(img)} className="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex justify-center flex-col gap-2 items-center pb-2">
                                        {imageUrl === img ? (
                                            <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase rounded-full shadow-lg">Principal</span>
                                        ) : (
                                            <button type="button" onClick={() => makePrimaryImage(img)} className="px-3 py-1 bg-white hover:bg-white/90 text-black text-[10px] font-bold uppercase rounded-full shadow-lg transition-colors">Principal</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {images.length === 0 && (
                            <div className="col-span-full py-12 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-white/30">
                                <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
                                <p>No hay imágenes subidas.</p>
                                <p className="text-sm">Sube al menos una imagen para tu producto.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-white/70 uppercase tracking-widest">Nombre del Producto</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 transition-colors" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-white/70 uppercase tracking-widest">Descripción</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 transition-colors" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/70 uppercase tracking-widest">Precio</label>
                        <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 transition-colors" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/70 uppercase tracking-widest">Stock General</label>
                        <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 transition-colors" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-white/70 uppercase tracking-widest">Categoría</label>
                        <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-hidden focus:border-primary/50 transition-colors appearance-none">
                            <option value="" className="bg-surface">Sin categoría</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id} className="bg-surface">{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Variants Management */}
                <div className="space-y-6 pt-6 border-t border-white/5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-white font-display">Variantes y Tamaños</h3>
                            <p className="text-white/40 text-sm">Añade colores, materiales o tamaños disponibles.</p>
                        </div>
                        <button type="button" onClick={addVariantGroup} className="flex shrink-0 items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-white text-sm font-medium">
                            <Plus className="w-4 h-4" /> Agregar Tipo de Variante
                        </button>
                    </div>

                    <div className="space-y-4">
                        {variants.map((variant, idx) => (
                            <div key={idx} className="p-4 bg-black/20 rounded-2xl border border-white/5 space-y-4 relative">
                                <button type="button" onClick={() => removeVariantGroup(idx)} className="absolute top-4 right-4 text-white/30 hover:text-red-400 transition-colors" title="Eliminar este grupo de variantes">
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="w-full max-w-sm">
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Tipo de Variante (Ej: Material, Tamaño)</label>
                                    <input type="text" value={variant.type} onChange={(e) => updateVariantType(idx, e.target.value)} placeholder="Ej: Tipo de Cuarzo" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-hidden focus:border-primary/50 transition-colors" />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">Opciones ({variant.options.length})</label>
                                    <div className="flex flex-wrap gap-2 mb-3 mt-1">
                                        {variant.options.map((opt, optIdx) => (
                                            <div key={optIdx} className="flex items-center gap-1 bg-primary/20 text-primary px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-primary/20">
                                                {opt}
                                                <button type="button" onClick={() => removeVariantOption(idx, optIdx)} className="ml-1 hover:text-white transition-colors" title="Eliminar opción"><X className="w-3 h-3" /></button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 w-full max-w-sm relative">
                                        <input type="text" id={`new-opt-${idx}`} placeholder="Nueva opción (Ej: Cuarzo Rosa)" className="flex-1 bg-white/5 border border-white/10 rounded-lg pl-3 pr-10 py-2 text-white text-sm focus:outline-hidden focus:border-primary/50 transition-colors" onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                addVariantOption(idx, e.currentTarget.value)
                                                e.currentTarget.value = ''
                                            }
                                        }} />
                                        <button type="button" onClick={() => {
                                            const input = document.getElementById(`new-opt-${idx}`) as HTMLInputElement
                                            if (input && input.value) {
                                                addVariantOption(idx, input.value)
                                                input.value = ''
                                            }
                                        }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white" title="Agregar opción">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 py-6 border-t border-white/5">
                    <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-5 h-5 rounded accent-primary bg-white/5 border-white/10" />
                    <label htmlFor="is_active" className="text-sm font-bold text-white/90 cursor-pointer">Activo (Visible en la tienda)</label>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={loading || uploading} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 text-lg w-full md:w-auto justify-center">
                        {loading ? <div className="w-6 h-6 rounded-full border-2 border-white/50 border-t-transparent animate-spin" /> : <Save className="w-6 h-6" />}
                        {loading ? 'Guardando Producto...' : 'Guardar Producto Físico'}
                    </button>
                </div>
            </form>
        </div>
    )
}
