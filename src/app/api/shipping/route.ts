import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { province, zipcode, weight = 1 } = body

        // 1. Authenticate with Enviopack
        const authResponse = await fetch('https://api.enviopack.com/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "api-key": process.env.NEXT_PUBLIC_ENVIOPACK_API_KEY,
                "secret-key": process.env.NEXT_PUBLIC_ENVIOPACK_SECRET_KEY
            })
        })

        const authData = await authResponse.json()
        if (!authResponse.ok) throw new Error(authData.message || 'Error auth Enviopack')

        const token = authData.token
        if (!token) throw new Error('No token returned')

        if (body.test_provinces) {
            const provResp = await fetch(`https://api.enviopack.com/provincias?access_token=${token}`)
            return NextResponse.json(await provResp.json())
        }

        // 2. Get quote
        const quoteUrl = new URL('https://api.enviopack.com/cotizar/costo')
        quoteUrl.searchParams.append('codigo_postal', zipcode)
        quoteUrl.searchParams.append('provincia', province || 'C')
        quoteUrl.searchParams.append('peso', weight.toString())
        quoteUrl.searchParams.append('access_token', token)

        const quoteResponse = await fetch(quoteUrl.toString())
        const quoteData = await quoteResponse.json()

        if (!quoteResponse.ok) throw new Error(quoteData.message || 'Error cotizando envio')

        return NextResponse.json(quoteData)
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown Error'
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}
