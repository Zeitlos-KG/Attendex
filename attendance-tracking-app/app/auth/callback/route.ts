import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const supabase = await createClient()

        // Exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            // Redirect to home with error
            return NextResponse.redirect(new URL('/?error=verification_failed', requestUrl.origin))
        }

        // If user signed in with Google, save their full name to profile
        if (data.user) {
            const fullName = data.user.user_metadata?.full_name ||
                data.user.user_metadata?.name ||
                data.user.email?.split('@')[0]

            // Update or insert profile with full name
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    email: data.user.email,
                    full_name: fullName,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'id'
                })

            if (profileError) {
                console.error('Error saving profile:', profileError)
            }
        }
    }

    // Redirect to onboarding after successful verification
    return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
}
