import ServiceForm from '@/components/admin/ServiceForm'

export default async function EditServicePage({ params }: { params: { id: string } }) {
    const { id } = await params
    return <ServiceForm id={id} />
}
