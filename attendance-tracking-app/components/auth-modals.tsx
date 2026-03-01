"use client"

/**
 * AuthModals — lazy-loaded so Dialog + Input + Label + Button + all their
 * Radix UI deps are NOT included in the initial page bundle.
 * They're only downloaded when the user clicks "Sign In" / "Get Started".
 */
import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ArrowRight } from "lucide-react"

interface AuthModalsProps {
    // Auth modal
    showAuthModal: boolean
    setShowAuthModal: (v: boolean) => void
    isSignUp: boolean
    // Verification modal
    showVerificationModal: boolean
    setShowVerificationModal: (v: boolean) => void
    verificationEmail: string
    // Form state
    email: string
    setEmail: (v: string) => void
    password: string
    setPassword: (v: string) => void
    fullName: string
    setFullName: (v: string) => void
    error: string
    isLoading: boolean
    // Handlers
    handleAuth: (e: React.FormEvent) => void
    handleGoogleSignIn: () => void
    toggleAuthMode: () => void
}

export default function AuthModals({
    showAuthModal, setShowAuthModal,
    isSignUp,
    showVerificationModal, setShowVerificationModal, verificationEmail,
    email, setEmail,
    password, setPassword,
    fullName, setFullName,
    error, isLoading,
    handleAuth, handleGoogleSignIn, toggleAuthMode,
}: AuthModalsProps) {
    return (
        <>
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

                        {/* Google Sign-In */}
                        <div className="mt-6">
                            <Button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                                className="w-full h-11 bg-background text-foreground border-2 border-border hover:bg-secondary/50 font-medium flex items-center justify-center gap-2"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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
                                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                                <Input
                                    id="email" type="email" placeholder="yourname@thapar.edu"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="h-11 bg-muted/50 border-border focus:border-foreground focus:ring-foreground/20"
                                    required autoComplete="email"
                                />
                            </div>

                            {isSignUp && (
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                                    <Input
                                        id="fullName" type="text" placeholder="Full Name"
                                        value={fullName} onChange={(e) => setFullName(e.target.value)}
                                        className="h-11 bg-muted/50 border-border focus:border-foreground focus:ring-foreground/20"
                                        required autoComplete="name"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                <Input
                                    id="password" type="password" placeholder="••••••••"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="h-11 bg-muted/50 border-border focus:border-foreground focus:ring-foreground/20"
                                    required minLength={6} maxLength={72}
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
                            type="button" onClick={toggleAuthMode}
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
                            We've sent a verification link to{" "}
                            <span className="font-medium text-foreground">{verificationEmail}</span>
                        </p>
                        <div className="p-4 rounded-lg bg-muted/30 border border-border">
                            <p className="text-sm text-muted-foreground">Follow these steps:</p>
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
        </>
    )
}
