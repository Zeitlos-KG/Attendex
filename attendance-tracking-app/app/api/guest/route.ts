import { NextResponse } from 'next/server'

const COOKIE_NAME = 'guest_mode'
const COOKIE_OPTS = 'Path=/; Max-Age=3600; SameSite=Lax'

// POST /api/guest — enter guest mode
export async function POST() {
    const res = NextResponse.json({ ok: true })
    res.headers.set('Set-Cookie', `${COOKIE_NAME}=1; ${COOKIE_OPTS}`)
    return res
}

// DELETE /api/guest — exit guest mode
export async function DELETE() {
    const res = NextResponse.json({ ok: true })
    res.headers.set('Set-Cookie', `${COOKIE_NAME}=; Path=/; Max-Age=0`)
    return res
}
