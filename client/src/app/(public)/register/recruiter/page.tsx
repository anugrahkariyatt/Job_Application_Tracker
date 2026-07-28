"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { register, googleAuth } from "@/features/auth/api/auth.api";
import { toast } from "sonner";
import Link from "next/link";
import { Lock, Mail, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

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
        toast.success("Account created! Please check your email to verify before logging in.");
        router.push(`/login?email=${encodeURIComponent(email)}`);
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
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4 py-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-10 shadow-xl space-y-6">

        {/* Form Header */}
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Join as a recruiter
          </h2>
          <p className="text-sm text-muted-foreground">
            Post jobs, review applicant submissions, and manage company verification.
          </p>
        </div>

        {/* OAuth Google Button */}
        <div className="w-full flex justify-center min-h-[44px]">
          <GoogleLogin
            onSuccess={handleGoogleSignup}
            onError={() => toast.error("Google Sign Up failed")}
            width="400"
            theme="outline"
            shape="rectangular"
            size="large"
            text="signup_with"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
            OR SIGN UP WITH EMAIL
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
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
                  "w-full pl-10 pr-3.5 py-3 text-sm rounded-xl border border-input bg-background text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-3 focus:ring-primary/10",
                  errors.name && "border-destructive focus:border-destructive focus:ring-destructive/10"
                )}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive font-medium">{errors.name}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-2">
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
                  "w-full pl-10 pr-3.5 py-3 text-sm rounded-xl border border-input bg-background text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-3 focus:ring-primary/10",
                  errors.email && "border-destructive focus:border-destructive focus:ring-destructive/10"
                )}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
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
                <span>Creating account...</span>
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Links */}
        <div className="space-y-1.5 text-center ">
          <div className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </div>
          <div className="text-xs text-muted-foreground">
            Are you a job seeker?{" "}
            <Link href="/register/candidate" className="font-semibold text-primary hover:underline">
              Register as Candidate
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}