import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Needed for bypassing RLS or updating roles

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Faltan variables de entorno de Supabase.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setAdminRole() {
    const email = 'garrocamilalorena@gmail.com'

    console.log(`Buscando usuario con email: ${email}...`)

    // Buscar el usuario en auth.users (usando service_role)
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
        console.error('Error listando usuarios:', usersError)
        return
    }

    const user = usersData.users.find(u => u.email === email)

    if (!user) {
        console.error(`Usuario con email ${email} no encontrado en auth.users`)

        // Intentar buscar directo en profiles por si acaso
        const { data: profile, error: profileErr } = await supabase.from('profiles').select('*').eq('email', email).single()
        if (profileErr || !profile) {
            console.error('Tampoco se encontró en la tabla profiles.')
            return
        }
        console.log('Encontrado en profiles con ID:', profile.id)
        await updateRole(profile.id)
        return
    }

    console.log(`Usuario encontrado con ID: ${user.id}`)
    await updateRole(user.id)
}

async function updateRole(userId: string) {
    console.log(`Actualizando rol a 'admin' para el perfil ${userId}...`)

    // Asumiendo que hay una columna 'role' en 'profiles'. Revisemos el schema.
    // Wait, the types.ts doesn't show a 'role' column on 'profiles'. Let's check the schema first or just try to update.
    // If there is no role column, we might need to create it.

    // Let's create the column if it doesn't exist just in case, or just try to update.
    const { data, error } = await supabase
        .from('profiles')
        .update({ role: 'admin' } as any) // Cast to any in case types are outdated
        .eq('id', userId)
        .select()

    if (error) {
        console.error('Error actualizando perfil:', error)
    } else {
        console.log('¡Perfil actualizado a admin exitosamente!', data)
    }
}

setAdminRole()
