import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // NEED SERVICE ROLE PARA BORRAR USERS

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Faltan credenciales de Supabase. Asegurate de tener SUPABASE_SERVICE_ROLE_KEY en .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function purgeDatabase() {
    console.log('Iniciando purga de la base de datos (Órdenes, Carritos, Usuarios, Reservas)...')

    try {
        // 1. Borrar todas las órdenes (y por cascada order_items si está bien configurado, o a mano)
        console.log('Borrando order_items...')
        await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')

        console.log('Borrando orders...')
        await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000')

        // 2. Borrar reservas (bookings)
        console.log('Borrando bookings...')
        await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000')

        // 3. Borrar carritos y cart_items
        console.log('Borrando cart_items...')
        await supabase.from('cart_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')

        console.log('Borrando carts...')
        await supabase.from('carts').delete().neq('id', '00000000-0000-0000-0000-000000000000')

        // 4. Borrar Profiles
        console.log('Borrando perfiles...')
        await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000')

        // 5. Borrar Usuarios de Auth (Requires Service Role)
        console.log('Borrando usuarios de auth.users...')
        const { data: users, error: listError } = await supabase.auth.admin.listUsers()

        if (listError) {
            console.error('Error listando usuarios:', listError)
        } else if (users && users.users.length > 0) {
            for (const user of users.users) {
                console.log(`Borrando usuario ${user.email}...`)
                const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
                if (deleteError) {
                    console.error(`Error borrando usuario ${user.email}:`, deleteError)
                }
            }
        } else {
            console.log('No hay usuarios para borrar en auth.users.')
        }

        console.log('¡Purga completada con éxito! La base de datos está limpia (Solo quedaron Productos y Categorías).')

    } catch (error) {
        console.error('Error catastrófico durante la purga:', error)
    }
}

purgeDatabase()
