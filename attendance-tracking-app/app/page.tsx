"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  const searchParams = useSearchParams()
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

  // Auto-open auth modal when redirected from /login
  useEffect(() => {
    if (searchParams.get('openAuth') === 'true') {
      setIsSignUp(false) // open directly in login mode
      setShowAuthModal(true)
    }
  }, [searchParams])

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

  const handleLogout = async () => {
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
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
                  <Button
                    size="lg"
                    onClick={() => setShowAuthModal(true)}
                    className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90 font-medium group"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
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

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md bg-background border-border p-0 overflow-hidden">
          <div className="p-6">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl font-medium tracking-tight">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </DialogTitle>
              <p className="text-muted-foreground mt-1">
                {isSignUp ? "Sign up with your Thapar email" : "Login to your account"}
              </p>
            </DialogHeader>

            {/* Google Sign-In Button */}
            <div className="mt-6">
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-11 bg-background text-foreground border-2 border-border hover:bg-secondary/50 font-medium flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isLoading ? "Signing in..." : "Continue with Google"}
              </Button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="yourname@thapar.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-muted/50 border-border focus:border-foreground focus:ring-foreground/20"
                  required
                  autoComplete="email"
                />
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11 bg-muted/50 border-border focus:border-foreground focus:ring-foreground/20"
                    required
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-muted/50 border-border focus:border-foreground focus:ring-foreground/20"
                  required
                  minLength={6}
                  maxLength={72}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
                <p className="text-xs text-muted-foreground">6–72 characters</p>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 font-medium group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    {isSignUp ? "Creating account..." : "Signing in..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          <div className="px-6 py-4 bg-muted/30 border-t border-border space-y-3">
            <button
              type="button"
              onClick={toggleAuthMode}
              className="w-full text-sm text-center text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <span className="font-medium underline">
                {isSignUp ? "Sign in" : "Sign up"}
              </span>
            </button>
            <p className="text-xs text-muted-foreground text-center">
              By continuing, you agree to our Terms of Service
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Verification Modal */}
      <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
        <DialogContent className="sm:max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-medium tracking-tight">
              Check Your Email
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              We've sent a verification link to <span className="font-medium text-foreground">{email}</span>
            </p>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm text-muted-foreground">
                Follow these steps:
              </p>
              <ol className="list-decimal list-inside text-sm text-foreground mt-2 space-y-1">
                <li>Check your email inbox</li>
                <li>Click the verification link</li>
                <li>You'll be redirected back here</li>
                <li>Complete your profile setup</li>
              </ol>
            </div>
            <p className="text-xs text-muted-foreground">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                type="button"
                onClick={() => setShowVerificationModal(false)}
                className="text-primary hover:underline"
              >
                try signing up again
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
