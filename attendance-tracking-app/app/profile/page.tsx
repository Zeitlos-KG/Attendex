"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, GraduationCap, Users, AlertTriangle, Check, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Subgroups for each year (you can customize this)
// Fetched from API
// const subgroups = { ... } <-- REMOVED

export default function ProfilePage() {
    const router = useRouter()
    const supabase = createClient()

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        year: '',
        subgroup: '',
    })

    const [allSubgroups, setAllSubgroups] = useState<string[]>([])
    const [originalSubgroup, setOriginalSubgroup] = useState('')
    const [showSubgroupConfirm, setShowSubgroupConfirm] = useState(false)
    const [pendingSubgroup, setPendingSubgroup] = useState('')
    const [saving, setSaving] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [emailError, setEmailError] = useState('')

    useEffect(() => {
        // Load profile from Supabase
        const loadProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/')
                return
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, email, year, subgroup')
                .eq('id', user.id)
                .single()

            if (data) {
                setProfile({
                    name: data.full_name || user.user_metadata?.full_name || '',
                    email: data.email || user.email || '',
                    year: data.year?.toString() || '',
                    subgroup: data.subgroup || '',
                })
                setOriginalSubgroup(data.subgroup || '')
            } else {
                // Fallback to auth user data
                setProfile(prev => ({
                    ...prev,
                    name: user.user_metadata?.full_name || '',
                    email: user.email || '',
                }))
            }
        }
        loadProfile()

        // Fetch subgroups from API
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/subgroups`)
            .then(res => res.json())
            .then(data => setAllSubgroups(data))
            .catch(err => console.error('Failed to fetch subgroups:', err))
    }, [])

    const handleEmailChange = (email: string) => {
        setProfile({ ...profile, email })

        if (email && !email.endsWith('@thapar.edu')) {
            setEmailError('Please use your @thapar.edu email address')
        } else {
            setEmailError('')
        }
    }

    const handleYearChange = (year: string) => {
        setProfile({ ...profile, year, subgroup: '' })
    }

    const handleSubgroupChange = (newSubgroup: string) => {
        if (originalSubgroup && newSubgroup !== originalSubgroup) {
            // Show confirmation popup
            setPendingSubgroup(newSubgroup)
            setShowSubgroupConfirm(true)
        } else {
            setProfile({ ...profile, subgroup: newSubgroup })
        }
    }

    const confirmSubgroupChange = () => {
        setProfile({ ...profile, subgroup: pendingSubgroup })
        setOriginalSubgroup(pendingSubgroup)
        setShowSubgroupConfirm(false)
        setPendingSubgroup('')
    }

    const cancelSubgroupChange = () => {
        setShowSubgroupConfirm(false)
        setPendingSubgroup('')
    }

    const handleSave = async () => {
        if (!profile.email.endsWith('@thapar.edu')) {
            setEmailError('Please use your @thapar.edu email address')
            return
        }

        if (!profile.name || !profile.year || !profile.subgroup) {
            alert('Please fill in all fields')
            return
        }

        setSaving(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                alert('You must be logged in to save profile')
                return
            }

            // Save to Supabase profiles table
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: profile.name,
                    email: profile.email,
                    year: parseInt(profile.year),
                    subgroup: profile.subgroup,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' })

            if (error) throw error

            setOriginalSubgroup(profile.subgroup)
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
        } catch (error) {
            console.error('Failed to save profile:', error)
            alert('Failed to save profile. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const availableSubgroups = profile.year
        ? allSubgroups.filter((sg: string) => sg.startsWith(profile.year)).sort()
        : []

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl space-y-8">
                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
                        <p className="text-muted-foreground">
                            Manage your account information and preferences
                        </p>
                    </div>

                    {/* Success Message */}
                    {showSuccess && (
                        <div className="p-4 rounded-lg bg-success/10 border border-success/30 text-success flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <Check className="h-5 w-5" />
                            <span>Profile updated successfully!</span>
                        </div>
                    )}

                    {/* Profile Form */}
                    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                                <User className="h-4 w-4" />
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Enter your full name"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="h-11 bg-muted/50 border-border focus:border-primary focus:ring-primary/20"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                                <Mail className="h-4 w-4" />
                                Thapar Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="yourname@thapar.edu"
                                value={profile.email}
                                onChange={(e) => handleEmailChange(e.target.value)}
                                className="h-11 bg-muted/50 border-border focus:border-primary focus:ring-primary/20"
                            />
                            {emailError && (
                                <p className="text-sm text-destructive flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {emailError}
                                </p>
                            )}
                        </div>

                        {/* Year */}
                        <div className="space-y-2">
                            <Label htmlFor="year" className="flex items-center gap-2 text-sm font-medium">
                                <GraduationCap className="h-4 w-4" />
                                Year
                            </Label>
                            <Select value={profile.year} onValueChange={handleYearChange}>
                                <SelectTrigger className="h-11 bg-muted/50 border-border">
                                    <SelectValue placeholder="Select your year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1st Year</SelectItem>
                                    <SelectItem value="2">2nd Year</SelectItem>
                                    <SelectItem value="3">3rd Year</SelectItem>
                                    <SelectItem value="4">4th Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Subgroup */}
                        <div className="space-y-2">
                            <Label htmlFor="subgroup" className="flex items-center gap-2 text-sm font-medium">
                                <Users className="h-4 w-4" />
                                Subgroup
                            </Label>
                            {profile.year ? (
                                <Select value={profile.subgroup} onValueChange={handleSubgroupChange}>
                                    <SelectTrigger className="h-11 bg-muted/50 border-border">
                                        <SelectValue placeholder="Select your subgroup" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableSubgroups.map((sg) => (
                                            <SelectItem key={sg} value={sg}>
                                                {sg}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="h-11 rounded-lg bg-secondary/30 border border-border/50 flex items-center px-3 text-sm text-muted-foreground">
                                    Please select a year first
                                </div>
                            )}
                            {originalSubgroup && profile.subgroup !== originalSubgroup && (
                                <p className="text-sm text-warning">
                                    Changing subgroup will update your timetable
                                </p>
                            )}
                        </div>

                        {/* Save Button */}
                        <div className="pt-4 space-y-3">
                            <Button
                                onClick={handleSave}
                                disabled={saving || !!emailError || !profile.name || !profile.email || !profile.year || !profile.subgroup}
                                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>

                            {/* Sign Out Button */}
                            <Button
                                onClick={async () => {
                                    await supabase.auth.signOut()
                                    router.push('/')
                                }}
                                variant="outline"
                                className="w-full h-11 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive font-medium"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </div>

                    {/* Information Box */}
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-sm text-muted-foreground">
                            <strong className="text-foreground">Note:</strong> Your subgroup determines which timetable you see.
                            Make sure to select the correct one to view your classes accurately.
                        </p>
                    </div>
                </div>
            </main>

            {/* Subgroup Change Confirmation Dialog */}
            <Dialog open={showSubgroupConfirm} onOpenChange={setShowSubgroupConfirm}>
                <DialogContent className="sm:max-w-md bg-background border-border">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-warning" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-semibold">Confirm Subgroup Change</DialogTitle>
                            </div>
                        </div>
                        <DialogDescription className="text-muted-foreground">
                            You are about to change your subgroup from <strong className="text-foreground">{originalSubgroup}</strong> to{' '}
                            <strong className="text-foreground">{pendingSubgroup}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-3">
                        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                            <p className="text-sm text-foreground">
                                <strong>This will:</strong>
                            </p>
                            <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
                                <li>Update your timetable to match the new subgroup</li>
                                <li>Show different classes in your schedule</li>
                                <li>Your past attendance will be preserved</li>
                            </ul>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to continue?
                        </p>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={cancelSubgroupChange}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={confirmSubgroupChange}
                            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            Confirm Change
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
