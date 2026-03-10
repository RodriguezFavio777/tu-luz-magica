'use server'

import { ServiceService, CreateServiceDTO } from '@/services/ServiceService'
import { revalidatePath } from 'next/cache'
import { ServiceSchema } from '@/lib/validations'

export async function saveService(id: string, payload: CreateServiceDTO) {
    const isNew = id === 'new'

    // Validate with Zod
    const validated = ServiceSchema.safeParse(payload)
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message }
    }

    try {
        let data;
        const serviceData = validated.data as CreateServiceDTO;
        if (isNew) {
            data = await ServiceService.create(serviceData)
            revalidatePath('/admin/services')
            revalidatePath('/servicios')
        } else {
            data = await ServiceService.update(id, validated.data)
            revalidatePath('/admin/services')
            revalidatePath(`/servicios/${id}`)
        }

        return { success: true, data }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        console.error('Error in saveService action:', error)
        return { success: false, error: message }
    }
}

export async function deleteService(id: string) {
    try {
        await ServiceService.delete(id)
        revalidatePath('/admin/services')
        revalidatePath('/servicios')
        return { success: true }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        console.error('Error in deleteService action:', error)
        return { success: false, error: message }
    }
}
export async function getAdminServices() {
    try {
        return await ServiceService.getAdminList()
    } catch (error) {
        console.error('Error fetching admin services:', error)
        return []
    }
}
