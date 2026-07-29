"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import axiosInstance from "@/lib/axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axiosInstance.post("/api/auth/forgot-password", { email });

      if (response.data?.success) {
        setIsSent(true);
        toast.success("Password reset email sent!");
      } else {
        toast.error(response.data?.message || "Failed to send reset link.");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4 py-12">
      {/* Centered card aligned with authentication pages layout */}
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-10 shadow-xl space-y-6">
        {!isSent ? (
          <>
            {/* Header */}
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Forgot password?
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-semibold text-foreground">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    className="w-full pl-10 pr-3.5 py-3 text-sm rounded-xl border border-input bg-background text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-3 focus:ring-primary/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-xs active:translate-y-px flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending link...</span>
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          </>
        ) : (
          /* Confirmation State */
          <div className="py-4 text-center space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Email Sent
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-semibold text-foreground">{email}</span>. Please check your inbox.
              </p>
            </div>

            <Link
              href="/login"
              className="w-full inline-flex justify-center items-center py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-xs active:translate-y-px"
            >
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}