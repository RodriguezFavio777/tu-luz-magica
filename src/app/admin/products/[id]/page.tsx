import ProductForm from '@/components/admin/ProductForm'

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const { id } = await params
    return <ProductForm id={id} />
}
