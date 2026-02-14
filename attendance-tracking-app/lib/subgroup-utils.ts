import { createClient } from './supabase/client'

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

// Get and normalize subgroup from Supabase profile
export async function getNormalizedSubgroup(): Promise<string | null> {
    const supabase = createClient()

    try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return null
        }

        // Get user's profile
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('subgroup')
            .eq('id', user.id)
            .single()

        if (error || !profile?.subgroup) {
            return null
        }

        // Normalize the subgroup
        const normalized = normalizeSubgroup(profile.subgroup)

        // If normalization changed the value, update it in the database
        if (normalized !== profile.subgroup) {
            await supabase
                .from('profiles')
                .update({ subgroup: normalized })
                .eq('id', user.id)
        }

        return normalized
    } catch (error) {
        console.error('Error fetching subgroup:', error)
        return null
    }
}
