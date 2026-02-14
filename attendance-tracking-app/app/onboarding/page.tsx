"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { GraduationCap, Users, Building2 } from "lucide-react"
import { getBranchDisplayName, extractBranchCode, extractPool } from "@/lib/branch-utils"
import { createClient } from "@/lib/supabase/client"

// Fetch subgroups from API
async function getSubgroups() {
    try {
        const res = await fetch('http://localhost:5000/api/subgroups')
        if (res.ok) {
            return await res.json()
        }
    } catch (error) {
        console.error('Failed to fetch subgroups:', error)
    }
    return []
}

export default function OnboardingPage() {
    const router = useRouter()
    const [year, setYear] = useState('')
    const [poolOrBranch, setPoolOrBranch] = useState('') // Pool for year 1, Branch for years 2-4
    const [subgroup, setSubgroup] = useState('')
    const [subgroups, setSubgroups] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [checkingAuth, setCheckingAuth] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        // Check if user is authenticated
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                // Not logged in, redirect to home
                router.push('/')
                return
            }

            // Check if user already has a subgroup in their profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('subgroup')
                .eq('id', user.id)
                .single()

            if (profile?.subgroup) {
                // Already onboarded, go to dashboard
                router.push('/dashboard')
            } else {
                setCheckingAuth(false)
            }
        }

        // Load subgroups
        getSubgroups().then(setSubgroups)
        checkUser()
    }, [router])

    // Reset pool/branch and subgroup when year changes
    useEffect(() => {
        setPoolOrBranch('')
        setSubgroup('')
    }, [year])

    // Get available pools (for year 1) or branches (for years 2-4)
    const getPoolsOrBranches = (): string[] => {
        if (!year) return []

        const yearSubgroups = subgroups.filter(sg => sg.startsWith(year))

        if (year === '1') {
            // Year 1: Extract pools (A or B)
            const pools = new Set<string>()
            yearSubgroups.forEach(sg => {
                const pool = extractPool(sg)
                if (pool) pools.add(pool)
            })
            return Array.from(pools).sort()
        } else {
            // Years 2-4: Extract branches
            const branches = new Set<string>()
            yearSubgroups.forEach(sg => {
                const branch = extractBranchCode(sg)
                if (branch) branches.add(branch)
            })
            return Array.from(branches).sort()
        }
    }

    // Filter subgroups by year and pool/branch
    const filteredSubgroups = subgroups.filter(sg => {
        if (!year || !poolOrBranch) return false

        if (year === '1') {
            // Year 1: Filter by pool (1A11, 1A12 for pool A)
            return sg.startsWith(`1${poolOrBranch}`)
        } else {
            // Years 2-4: Filter by branch (2CSE1, 2CSE2 for CSE)
            return sg.startsWith(year) && extractBranchCode(sg) === poolOrBranch
        }
    })

    const poolsOrBranches = getPoolsOrBranches()
    const isYear1 = year === '1'

    const handleSubmit = async () => {
        if (!year || !subgroup) {
            alert('Please complete all selections')
            return
        }

        setLoading(true)

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                alert('You must be logged in to continue')
                router.push('/')
                return
            }

            // Update user profile with subgroup
            const { error } = await supabase
                .from('profiles')
                .update({ subgroup })
                .eq('id', user.id)

            if (error) {
                console.error('Error updating profile:', error)
                alert('Failed to save your information. Please try again.')
                setLoading(false)
                return
            }

            // Success! Redirect to dashboard
            router.push('/dashboard')
        } catch (error) {
            console.error('Error during onboarding:', error)
            alert('Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    if (checkingAuth) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-xl font-bold text-primary-foreground">A</span>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">Attendex</h1>
                    </div>
                    <h2 className="text-2xl font-semibold text-foreground">Welcome!</h2>
                    <p className="text-muted-foreground">
                        Let's set up your timetable
                    </p>
                </div>

                {/* Form */}
                <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 space-y-6 shadow-lg">
                    {/* Year Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Select Your Year
                        </label>
                        <Select value={year} onValueChange={setYear}>
                            <SelectTrigger className="h-12 bg-muted/50 border-border">
                                <SelectValue placeholder="Choose your year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1st Year</SelectItem>
                                <SelectItem value="2">2nd Year</SelectItem>
                                <SelectItem value="3">3rd Year</SelectItem>
                                <SelectItem value="4">4th Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Pool/Branch Selection */}
                    {year && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                {isYear1 ? 'Select Your Pool' : 'Select Your Branch'}
                            </label>
                            <Select value={poolOrBranch} onValueChange={setPoolOrBranch}>
                                <SelectTrigger className="h-12 bg-muted/50 border-border">
                                    <SelectValue placeholder={isYear1 ? "Choose your pool" : "Choose your branch"} />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {poolsOrBranches.map((item) => (
                                        <SelectItem key={item} value={item}>
                                            {isYear1 ? `Pool ${item}` : getBranchDisplayName(item)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Subgroup Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Select Your Subgroup
                        </label>
                        {year && poolOrBranch ? (
                            <Select value={subgroup} onValueChange={setSubgroup}>
                                <SelectTrigger className="h-12 bg-muted/50 border-border">
                                    <SelectValue placeholder="Choose your subgroup" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {filteredSubgroups.map((sg) => (
                                        <SelectItem key={sg} value={sg}>
                                            {sg}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="h-12 rounded-lg bg-secondary/30 border border-border/50 flex items-center px-3 text-sm text-muted-foreground">
                                {!year ? 'Please select a year first' : `Please select a ${isYear1 ? 'pool' : 'branch'} first`}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={!year || !subgroup || loading}
                        className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base"
                    >
                        {loading ? 'Setting up...' : 'Continue to Dashboard'}
                    </Button>
                </div>

                {/* Info */}
                <div className="text-center text-sm text-muted-foreground">
                    <p>This helps us show your personalized timetable and track attendance</p>
                </div>
            </div>
        </div>
    )
}
