import { createClient } from './supabase/client'

const SUBGROUP_CACHE_KEY = 'attendex_subgroup'

// Normalize subgroup format helper (converts 1A8B -> 1A82)
export function normalizeSubgroup(sg: string): string {
    const letterMap: { [key: string]: string } = {
        'A': '1', 'B': '2', 'C': '3', 'D': '4', 'E': '5',
        'F': '6', 'G': '7', 'H': '8', 'I': '9', 'J': '0'
    }
    const match = sg.match(/^(\d)([A-Z])(\d)([A-Z])$/)
    if (match) {
        const [, year, section, groupNum, groupLetter] = match
        if (groupLetter in letterMap) {
            return `${year}${section}${groupNum}${letterMap[groupLetter]}`
        }
    }
    return sg
}

/** Clear cached subgroup — call this on logout or profile update. */
export function clearSubgroupCache() {
    try { sessionStorage.removeItem(SUBGROUP_CACHE_KEY) } catch { }
}

// Get and normalize subgroup from Supabase profile.
// Result is cached in sessionStorage so subsequent page navigations
// skip the Supabase round trips entirely (~0ms vs ~300-500ms).
export async function getNormalizedSubgroup(): Promise<string | null> {
    // 1. Try cache first
    try {
        const cached = sessionStorage.getItem(SUBGROUP_CACHE_KEY)
        if (cached) return cached
    } catch { }

    const supabase = createClient()

    try {
        // 2. Get current user + profile from Supabase (only on first load)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        // Get user's profile
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('subgroup')
            .eq('id', user.id)
            .single()

        if (error || !profile?.subgroup) return null

        // 3. Normalize and (if changed) update the DB once
        const normalized = normalizeSubgroup(profile.subgroup)

        // If normalization changed the value, update it in the database
        if (normalized !== profile.subgroup) {
            await supabase
                .from('profiles')
                .update({ subgroup: normalized })
                .eq('id', user.id)
        }

        // 4. Cache for the rest of the session
        try { sessionStorage.setItem(SUBGROUP_CACHE_KEY, normalized) } catch { }

        return normalized
    } catch (error) {
        console.error('Error fetching subgroup:', error)
        return null
    }
}
