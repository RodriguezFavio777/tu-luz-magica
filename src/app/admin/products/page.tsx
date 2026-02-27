'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Eye, Trash2, Edit, Search, Plus, Package } from 'lucide-react'
import Link from 'next/link'

export default function AdminProducts() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('products')
                .select('*, categories(name)')
                .eq('type', 'physical')
                .order('created_at', { ascending: false })

            if (error) throw error
            setProducts(data || [])
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    const deleteProduct = async (productId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) return

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId)

            if (error) throw error

            setProducts(products.filter(p => p.id !== productId))
        } catch (error) {
            console.error('Error deleting product:', error)
            alert('Hubo un problema al intentar eliminar el producto.')
        }
    }

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categories?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white font-display mb-2">Productos Físicos</h1>
                    <p className="text-white/50 text-sm">Gestiona el inventario de cristales, velas y herramientas sagradas.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-auto">
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-3 bg-surface border border-white/10 rounded-full text-sm text-white focus:outline-hidden focus:border-primary/50 w-full sm:w-64 transition-colors"
                        />
                    </div>
                    <Link
                        href="/admin/products/new"
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
                                <th className="p-6 font-medium">Producto</th>
                                <th className="p-6 font-medium">Categoría</th>
                                <th className="p-6 font-medium">Precio</th>
                                <th className="p-6 font-medium">Stock</th>
                                <th className="p-6 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-12 text-white/50 animate-pulse">
                                        Cargando productos...
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-12 text-white/50">
                                        <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        No se encontraron productos.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-white/20">
                                                            <Package className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm tracking-wide group-hover:text-primary transition-colors">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-white/40 text-xs truncate max-w-[200px]">
                                                        {product.is_active ? 'Activo' : 'Inactivo'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-6">
                                            <span className="bg-white/5 border border-white/10 text-white/70 px-3 py-1 rounded-full text-xs font-medium">
                                                {product.categories?.name || 'Sin Categoría'}
                                            </span>
                                        </td>

                                        <td className="p-6">
                                            <p className="text-white font-bold tracking-wide">
                                                ${product.price?.toLocaleString('es-AR')}
                                            </p>
                                        </td>

                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${(product.stock || 0) > 10 ? 'bg-green-500' : (product.stock || 0) > 0 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`} />
                                                <span className="text-white/80 font-medium">
                                                    {product.stock || 0}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="p-6 text-right space-x-2">
                                            <Link
                                                href={`/admin/products/${product.id}`}
                                                className="p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg transition-colors inline-flex"
                                                title="Editar Producto"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => deleteProduct(product.id)}
                                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors inline-flex"
                                                title="Eliminar Pedido"
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
