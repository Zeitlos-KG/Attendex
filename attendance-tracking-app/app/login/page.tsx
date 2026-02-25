import { redirect } from 'next/navigation'

/**
 * /login doesn't have its own UI — the auth modal lives on the landing page.
 * Redirect here so bookmarks, shared links, and email links never hit a 404.
 */
export default function LoginPage() {
    redirect('/?openAuth=true')
}
