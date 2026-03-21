"use client"

import React from "react"
import dynamic from "next/dynamic"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  User,
  Heart,
  LogOut,
  Zap,
  Shield,
  TrendingUp,
  Linkedin,
  Github,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { clearSubgroupCache } from "@/lib/subgroup-utils"

// Lazy-load auth modals -- keeps Dialog, Input, Label + Radix UI deps
// OUT of the initial bundle. They only load when user clicks Sign In.
const AuthModals = dynamic(() => import("@/components/auth-modals"), {
  ssr: false,
  loading: () => null,
})

// Reads ?openAuth=true from the URL and fires a callback.
// Must be a separate component so useSearchParams is inside a Suspense boundary.
function AuthModalOpener({ onOpen }: { onOpen: () => void }) {
  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams.get('openAuth') === 'true') {
      onOpen()
    }
  }, [searchParams, onOpen])
  return null
}

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [isSignUp, setIsSignUp] = useState(true) // true = signup, false = login
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const router = useRouter()
  const supabase = createClient()

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setIsLoggedIn(true)

          // Get user's full name from profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single()

          setUserName(profile?.full_name || extractName(user.email || ""))
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setCheckingAuth(false)
      }
    }
    checkUser()
  }, [])

  const extractName = (email: string) => {
    const namePart = email.split("@")[0]
    return namePart
      .split(/[._]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ")
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            hd: 'thapar.edu' // Restrict to @thapar.edu domain only
          }
        }
      })

      if (error) throw error
    } catch (err: any) {
      console.error('Google sign-in error:', err)
      setError(err.message || 'Failed to sign in with Google')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Trim whitespace from credentials before any validation
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    // Validate Thapar email
    if (!trimmedEmail.endsWith("@thapar.edu")) {
      setError("Please use your @thapar.edu email address")
      return
    }

    // Validate full name for signup
    if (isSignUp && !fullName.trim()) {
      setError("Please enter your full name")
      return
    }

    // Validate password length
    if (trimmedPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      if (isSignUp) {
        // Sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: trimmedPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: fullName.trim(),
            },
          },
        })

        if (signUpError) throw signUpError

        if (data.user) {
          // Show verification modal instead of redirecting
          setShowAuthModal(false)
          setShowVerificationModal(true)
        }
      } else {
        // Login
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        })

        if (loginError) throw loginError

        if (data.user) {
          setUserName(extractName(trimmedEmail))
          setIsLoggedIn(true)
          setShowAuthModal(false)
          // Redirect to dashboard or onboarding based on profile completion
          router.push("/dashboard")
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err)
      if (err.message.includes("Invalid login credentials")) {
        setError("Invalid email or password")
      } else if (err.message.includes("User already registered")) {
        setError("This email is already registered. Try logging in instead.")
        setIsSignUp(false)
      } else {
        setError(err.message || "Authentication failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }


  const handleGuestEntry = async () => {
    setIsLoading(true)
    try {
      await fetch('/api/guest', { method: 'POST' })
      router.push('/guest-tour')
    } catch (err) {
      console.error('Guest mode error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    clearSubgroupCache()
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    setUserName("")
    router.push("/?logout=true")
  }

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp)
    setError("")
    setPassword("")
    setFullName("")
  }

  if (checkingAuth) {
    // Don't block the full page â€” show a minimal loading shell instead.
    // The header and hero will update once auth resolves.
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Header skeleton */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex h-16 items-center justify-between">
              <span className="text-xl font-bold bg-gradient-to-r from-white via-gray-400 to-white bg-[length:200%_auto] animate-[gradient_6s_linear_infinite] bg-clip-text text-transparent tracking-tight">
                Attendex
              </span>
              <div className="h-9 w-20 rounded-md bg-muted/40 animate-pulse" />
            </div>
          </div>
        </header>
        {/* Hero skeleton â€” show content outline immediately */}
        <main className="flex-1 pt-16">
          <section className="px-6 py-24 lg:py-32">
            <div className="mx-auto max-w-6xl max-w-3xl space-y-6">
              <div className="h-4 w-40 rounded bg-muted/30 animate-pulse" />
              <div className="h-16 w-2/3 rounded-lg bg-muted/20 animate-pulse" />
              <div className="h-6 w-1/2 rounded bg-muted/20 animate-pulse" />
              <div className="h-12 w-36 rounded-lg bg-muted/30 animate-pulse" />
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Auto-open modal when coming from /login redirect */}
      <Suspense fallback={null}>
        <AuthModalOpener onOpen={() => { setIsSignUp(false); setShowAuthModal(true) }} />
      </Suspense>
      {/* Subtle grid background */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold bg-gradient-to-r from-white via-gray-400 to-white bg-[length:200%_auto] animate-[gradient_6s_linear_infinite] bg-clip-text text-transparent tracking-tight">
                Attendex
              </span>
            </div>

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{userName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-foreground text-background hover:bg-foreground/90 font-medium"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              {isLoggedIn ? (
                <>
                  <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase mb-4">
                    Welcome back
                  </p>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.1] mb-6">
                    {userName}
                  </h1>
                  <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl">
                    Your attendance dashboard is ready. Track your progress, mark attendance, and stay above the threshold.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button
                      size="lg"
                      onClick={() => router.push("/dashboard")}
                      className="h-12 px-6 bg-foreground text-background hover:bg-foreground/90 font-medium group"
                    >
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => router.push("/mark-attendance")}
                      className="h-12 px-6 border-border hover:bg-muted/50 font-medium"
                    >
                      Mark Attendance
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase mb-4">
                    Attendance Tracking
                  </p>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.1] mb-6">
                    Welcome to<br />
                    <span className="bg-gradient-to-r from-white via-gray-400 to-white bg-[length:200%_auto] animate-[gradient_6s_linear_infinite] bg-clip-text text-transparent font-bold">Attendex</span>
                  </h1>
                  <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl">
                    The modern way to track your college attendance. Simple, fast, and designed for students who want to stay on top of their game.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      size="lg"
                      onClick={() => setShowAuthModal(true)}
                      className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90 font-medium group"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleGuestEntry}
                      disabled={isLoading}
                      className="h-12 px-8 border-border hover:bg-muted/50 font-medium group"
                    >
                      Take a Tour
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-24 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-16 lg:grid-cols-3">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-md border border-border flex items-center justify-center">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-medium">Lightning Fast</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Mark your attendance in seconds. No complicated forms, no unnecessary steps. Just tap and go.
                </p>
              </div>
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-md border border-border flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-medium">Stay Above 75%</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Real-time threshold tracking. Know exactly how many classes you can skip while staying safe.
                </p>
              </div>
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-md border border-border flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-medium">Visual Analytics</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Beautiful charts and insights. Understand your attendance patterns at a glance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 py-24 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 sm:grid-cols-3 text-center">
              <div>
                <p className="text-5xl font-medium tracking-tight">75%</p>
                <p className="text-muted-foreground mt-2">Minimum threshold</p>
              </div>
              <div>
                <p className="text-5xl font-medium tracking-tight">{"<"}1s</p>
                <p className="text-muted-foreground mt-2">Mark attendance</p>
              </div>
              <div>
                <p className="text-5xl font-medium tracking-tight">24/7</p>
                <p className="text-muted-foreground mt-2">Access anywhere</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!isLoggedIn && (
          <section className="px-6 py-24 border-t border-border">
            <div className="mx-auto max-w-6xl text-center">
              <h2 className="text-3xl sm:text-4xl font-medium tracking-tight mb-4">
                Ready to take control?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                Join students who track their attendance the smart way.
              </p>
              <Button
                size="lg"
                onClick={() => setShowAuthModal(true)}
                className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90 font-medium group"
              >
                Start Tracking
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold bg-gradient-to-r from-white via-gray-400 to-white bg-[length:200%_auto] animate-[gradient_6s_linear_infinite] bg-clip-text text-transparent">Attendex</span>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              Made with <Heart className="h-3.5 w-3.5 text-foreground fill-foreground" /> by Krishiv Gupta
            </p>
            <a
              href="https://www.linkedin.com/in/gupta-krishiv"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/Zeitlos-KG/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </footer>

      {/* Auth + Verification Modals -- lazy loaded, not in initial bundle */}
      <AuthModals
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        isSignUp={isSignUp}
        showVerificationModal={showVerificationModal}
        setShowVerificationModal={setShowVerificationModal}
        verificationEmail={email}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        fullName={fullName}
        setFullName={setFullName}
        error={error}
        isLoading={isLoading}
        handleAuth={handleAuth}
        handleGoogleSignIn={handleGoogleSignIn}
        toggleAuthMode={toggleAuthMode}
      />
    </div>
  )
}
