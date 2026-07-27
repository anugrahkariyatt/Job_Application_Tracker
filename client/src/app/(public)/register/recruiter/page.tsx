"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { register } from "@/features/auth/api/auth.api";
import { toast } from "sonner";
import Link from "next/link";
import { Lock, Mail, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { googleAuth } from "@/features/auth/api/auth.api";

const registerSchema = z.object({
  name: z.string().trim().min(3, "Full name must be at least 3 characters").max(50, "Full name cannot exceed 50 characters"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
};

export default function RecruiterRegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
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
      const response = await register({ name, email, password, role: "recruiter" });

      if (response.success && response.user) {
        dispatch(setUser(response.user));
        toast.success("Recruiter account created successfully!");
        router.push("/recruiter/dashboard");
      } else {
        toast.error(response.message || "Registration failed");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Registration failed. Try a different email.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

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
        role: "recruiter",
      });

      toast.success(response.message);
      dispatch(setUser(response.user));
      router.push("/recruiter/dashboard");
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
            Hire top candidates faster.
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Post job openings, manage applicants, and build your company brand on Nuvora.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-sm space-y-6">
          {/* Form Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Join as a recruiter
            </h2>
            <p className="text-sm text-muted-foreground">
              Post jobs, review applicant submissions, and manage company verification.
            </p>
          </div>

          {/* OAuth Google Button */}
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
              Are you a job seeker?{" "}
              <Link href="/register/candidate" className="font-semibold text-primary hover:underline">
                Register as Candidate
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
