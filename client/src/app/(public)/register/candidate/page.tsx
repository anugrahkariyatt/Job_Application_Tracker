"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { register } from "@/features/auth/api/auth.api";
import { toast } from "sonner";
import Link from "next/link";
import { Lock, Mail, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store/hooks";

import {
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";
import { googleAuth } from "@/features/auth/api/auth.api";
import { setUser } from "@/store/slices/authSlice";
const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .max(50, "Full name cannot exceed 50 characters"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
};

export default function CandidateRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = registerSchema.safeParse({ name, email, password });
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await register({
        name,
        email,
        password,
        role: "candidate",
      });

      if (response.success && response.user) {
        toast.success("Candidate account created successfully!");
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(response.message || "Registration failed");
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "Registration failed. Try a different email.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  const dispatch = useAppDispatch();

  const handleGoogleSignup = async (
    credentialResponse: CredentialResponse
  ) => {
    try {
      const idToken = credentialResponse.credential;

      if (!idToken) {
        toast.error("Google authentication failed.");
        return;
      }

      const response = await googleAuth({
        idToken,
        role: "candidate",
      });

      toast.success(response.message);


      dispatch(setUser(response.user));
      router.push("/candidate/dashboard");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Google authentication failed."
      );
    }
  };
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* LEFT PANEL */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-muted/40 border-r border-border/70 overflow-hidden">


        {/* Vector Illustration */}
        <div className="relative my-6 flex flex-1 items-center justify-center">
          <svg className="w-full max-w-md h-auto" viewBox="0 0 420 320" fill="none">
            <rect x="110" y="30" width="200" height="130" rx="16" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
            <circle cx="145" cy="65" r="14" className="fill-primary/15" />
            <circle cx="145" cy="60" r="5" className="stroke-primary" strokeWidth="1.6" fill="none" />
            <path d="M137 70a8 8 0 0116 0" className="stroke-primary" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <rect x="170" y="58" width="100" height="8" rx="4" className="fill-muted" />
            <rect x="170" y="72" width="70" height="6" rx="3" className="fill-muted/70" />
            <rect x="128" y="98" width="164" height="6" rx="3" className="fill-muted" />
            <rect x="128" y="112" width="130" height="6" rx="3" className="fill-muted" />
            <rect x="128" y="132" width="72" height="18" rx="9" className="fill-primary/15" />
            <rect x="136" y="137" width="56" height="8" rx="4" className="fill-primary" />

            <path d="M60 220c30-10 55-10 80 5s60 20 90 8 60-25 100-15" className="stroke-primary/40" strokeWidth="1.5" strokeDasharray="1 7" strokeLinecap="round" />
            <circle cx="60" cy="220" r="4" className="fill-primary" />
            <circle cx="140" cy="225" r="4" className="fill-primary/40" />
            <circle cx="230" cy="233" r="4" className="fill-primary/40" />
            <circle cx="330" cy="218" r="4" className="fill-primary/40" />

            <circle cx="40" cy="60" r="3" className="fill-primary/40" />
            <circle cx="380" cy="200" r="3" className="fill-primary/40" />
          </svg>
        </div>

        {/* Visual Copy */}
        <div className="relative z-10 max-w-sm space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Build a profile recruiters actually see.
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            One profile, every application. Track status, get matched to roles, and hear back faster.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-sm space-y-6">
          {/* Form Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Join as a candidate
            </h2>
            <p className="text-sm text-muted-foreground">
              Create your profile, apply to jobs, and track every application status.
            </p>
          </div>

          {/* OAuth Google Button */}
          {/* <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-background border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-accent hover:border-border/80 transition-colors shadow-xs active:translate-y-px cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.09-1.81 2.73v2.27h2.92c1.71-1.57 2.69-3.88 2.69-6.64z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.17l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34C2.44 15.98 5.48 18 9 18z" />
              <path fill="#FBBC05" d="M3.97 10.72c-.18-.54-.28-1.11-.28-1.72s.1-1.18.28-1.72V4.94H.96A8.996 8.996 0 000 9c0 1.45.35 2.83.96 4.06l3.01-2.34z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
            </svg>
            Continue with Google
          </button> */}
          <GoogleLogin
            onSuccess={handleGoogleSignup}
            onError={() => toast.error("Google Sign Up failed")}
          />
          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
              OR SIGN UP WITH EMAIL
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-semibold text-foreground">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  disabled={isLoading}
                  className={cn(
                    "w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-input bg-background text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-3 focus:ring-primary/10",
                    errors.name && "border-destructive focus:border-destructive focus:ring-destructive/10"
                  )}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-destructive mt-1 font-medium flex items-center gap-1">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold text-foreground">
                Email address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  disabled={isLoading}
                  className={cn(
                    "w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-input bg-background text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-3 focus:ring-primary/10",
                    errors.email && "border-destructive focus:border-destructive focus:ring-destructive/10"
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive mt-1 font-medium flex items-center gap-1">
                  <span>⚠</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-foreground">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  disabled={isLoading}
                  className={cn(
                    "w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-input bg-background text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-3 focus:ring-primary/10",
                    errors.password && "border-destructive focus:border-destructive focus:ring-destructive/10"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1 font-medium flex items-center gap-1">
                  <span>⚠</span> {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-xs active:translate-y-px flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          {/* Links */}
          <div className="space-y-1.5 text-center pt-2">
            <div className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Log in
              </Link>
            </div>
            <div className="text-[12px] text-muted-foreground">
              Are you a recruiter?{" "}
              <Link href="/register/recruiter" className="font-semibold text-primary hover:underline">
                Register as Recruiter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
