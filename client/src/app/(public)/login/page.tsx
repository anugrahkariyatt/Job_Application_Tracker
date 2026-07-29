"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { login } from "@/features/auth/api/auth.api";
import { toast } from "sonner";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GoogleAuthButton } from "@/components/shared";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormErrors = {
  email?: string;
  password?: string;
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

      if (error.response?.status === 403 && errorMsg.includes("verify your email")) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }

      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-10 shadow-xl space-y-6">

        {/* Form Header */}
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back
          </h2>
          <p className="text-sm text-muted-foreground">
            {role === "candidate"
              ? "Log in to continue tracking your job applications."
              : "Log in to manage postings and review candidates."}
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex rounded-xl border border-border bg-muted/40 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setRole("candidate")}
            className={cn(
              "flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
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
              "flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
              role === "recruiter"
                ? "bg-background text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Recruiter
          </button>
        </div>

        {/* Custom OAuth Google Button */}
        <GoogleAuthButton role={role} text="Continue with Google" />

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
            OR LOG IN WITH EMAIL
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
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
                  "w-full pl-10 pr-3.5 py-3 text-sm rounded-xl border border-input bg-background text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-3 focus:ring-primary/10",
                  errors.email && "border-destructive focus:border-destructive focus:ring-destructive/10"
                )}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
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
                  "w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-input bg-background text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-3 focus:ring-primary/10",
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
              <p className="text-xs text-destructive font-medium">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-xs active:translate-y-px flex items-center justify-center gap-2 cursor-pointer mt-2"
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
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}