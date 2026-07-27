"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { login } from "@/features/auth/api/auth.api";
import { toast } from "sonner";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { googleAuth } from "@/features/auth/api/auth.api";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormErrors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {


  const router = useRouter();
  const dispatch = useAppDispatch();

  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await login({ email, password });

      if (response.success && response.user) {
        dispatch(setUser(response.user));
        toast.success("Successfully logged in!");
        if (response.user.role === "candidate") {
          router.push("/candidate");
        } else if (response.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/recruiter/dashboard");
        }
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Invalid email or password.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    try {
      const idToken = credentialResponse.credential;

      if (!idToken) {
        toast.error("Google authentication failed.");
        return;
      }

      const response = await googleAuth({ idToken, role });

      toast.success(response.message);
      dispatch(setUser(response.user));

      if (response.user.role === "candidate") {
        router.push("/candidate");
      } else if (response.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/recruiter/dashboard");
      }
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
          <svg className="w-full max-w-md h-auto" viewBox="0 0 420 340" fill="none">
            {/* Candidate Card */}
            <rect x="30" y="60" width="160" height="110" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
            <circle cx="58" cy="90" r="12" className="fill-primary/15" />
            <path d="M52 92a6 6 0 1112 0" className="stroke-primary" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="58" cy="87" r="4" className="stroke-primary" strokeWidth="1.6" />
            <rect x="80" y="84" width="80" height="7" rx="3.5" className="fill-muted" />
            <rect x="80" y="97" width="55" height="6" rx="3" className="fill-muted/70" />
            <rect x="46" y="120" width="128" height="6" rx="3" className="fill-muted" />
            <rect x="46" y="134" width="98" height="6" rx="3" className="fill-muted" />
            <rect x="46" y="148" width="60" height="16" rx="8" className="fill-primary/15" />
            <rect x="52" y="152" width="48" height="8" rx="4" className="fill-primary" />

            {/* Recruiter Card */}
            <rect x="230" y="150" width="160" height="110" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
            <rect x="248" y="170" width="12" height="12" rx="3" className="fill-primary" />
            <rect x="266" y="172" width="70" height="7" rx="3.5" className="fill-muted" />
            <rect x="248" y="192" width="124" height="6" rx="3" className="fill-muted" />
            <rect x="248" y="206" width="94" height="6" rx="3" className="fill-muted" />
            <circle cx="256" cy="232" r="10" className="fill-primary/15" />
            <circle cx="272" cy="232" r="10" className="fill-muted" />
            <circle cx="288" cy="232" r="10" className="fill-muted/70" />
            <rect x="330" y="222" width="42" height="20" rx="10" className="fill-primary" />
            <path d="M341 232l4 4 8-8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

            {/* Connecting Path */}
            <path d="M180 140C210 160 210 160 240 165" className="stroke-primary" strokeWidth="1.6" strokeDasharray="1 7" strokeLinecap="round" />
            <circle cx="210" cy="152" r="5" className="fill-primary" />
            <circle cx="210" cy="152" r="9" className="stroke-primary/40" strokeWidth="1.5" />

            {/* Ambient Dots */}
            <circle cx="40" cy="230" r="3" className="fill-primary/40" />
            <circle cx="380" cy="90" r="3" className="fill-primary/40" />
            <circle cx="200" cy="40" r="3" className="fill-primary/40" />
          </svg>
        </div>

        {/* Visual Copy */}
        <div className="relative z-10 max-w-sm space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            One account. Both sides of the table.
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Whether you&apos;re applying to your next role or reviewing your next hire, Nuvora keeps everything in one place.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-sm space-y-6">

          {/* Form Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              {role === "candidate"
                ? "Log in to continue tracking your job applications."
                : "Log in to manage postings and review candidates."}
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex rounded-xl border border-border bg-muted/40 p-1 gap-1">
            <button
              type="button"
              onClick={() => setRole("candidate")}
              className={cn(
                "flex-1 py-2 text-xs font-semibold rounded-lg transition-all",
                role === "candidate"
                  ? "bg-background text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Job Seeker
            </button>
            <button
              type="button"
              onClick={() => setRole("recruiter")}
              className={cn(
                "flex-1 py-2 text-xs font-semibold rounded-lg transition-all",
                role === "recruiter"
                  ? "bg-background text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Recruiter
            </button>
          </div>

          {/* OAuth Google Button */}
          {/* OAuth Google Button Wrapper */}
          <div className="w-full flex justify-center min-h-[44px]">
            <div className="w-full max-w-[360px] overflow-hidden rounded-xl flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => toast.error("Google login failed")}
                width="360"
                theme="outline"
                shape="rectangular"
                size="large"
                text="continue_with"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
              OR LOG IN WITH EMAIL
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold text-foreground">
                Email address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  placeholder={role === "candidate" ? "you@example.com" : "you@company.com"}
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
                <p className="text-xs text-destructive mt-1 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold text-foreground">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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
                <p className="text-xs text-destructive mt-1 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary accent-primary cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer select-none">
                Keep me logged in on this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-xs active:translate-y-px flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          {/* Create Account Link */}
          <div className="text-center text-xs text-muted-foreground pt-2">
            Don&apos;t have an account?{" "}
            <Link
              href={role === "candidate" ? "/register/candidate" : "/register/recruiter"}
              className="font-semibold text-primary hover:underline"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
