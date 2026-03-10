
// Session timeout: 5 hours (18000 seconds)
// This is handled server-side via Supabase JWT expiry settings.
// Client-side, we enforce a manual timeout check below.
const SESSION_TIMEOUT_MS = 5 * 60 * 60 * 1000 // 5 hours

let sessionTimer: ReturnType<typeof setTimeout> | null = null

export function startSessionTimer(onExpire: () => void) {
    if (sessionTimer) clearTimeout(sessionTimer)
    sessionTimer = setTimeout(() => {
        onExpire()
    }, SESSION_TIMEOUT_MS)
}

export function clearSessionTimer() {
    if (sessionTimer) {
        clearTimeout(sessionTimer)
        sessionTimer = null
    }
}
