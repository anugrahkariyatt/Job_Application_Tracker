"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { Lock, Loader2, AlertCircle } from "lucide-react";
import axiosInstance from "@/lib/axios";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Password reset token is missing. Please use the link sent to your email.");
      return;
    }

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axiosInstance.post("/api/auth/reset-password", {
        token,
        password,
      });

      if (response.data?.success && response.data?.user) {
        dispatch(setUser(response.data.user));
        toast.success("Password reset successfully! You are now logged in.");
        router.push("/dashboard");
      } else {
        toast.error(response.data?.message || "Failed to reset password.");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Reset link is invalid or expired. Please request a new link.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <CardContent className="py-8 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Invalid Reset Link</h2>
          <p className="text-sm text-muted-foreground">
            This password reset link is invalid, corrupted, or missing a token.
          </p>
        </div>
        <Button asChild className="w-full mt-4">
          <Link href="/forgot-password">Request New Reset Link</Link>
        </Button>
      </CardContent>
    );
  }

  return (
    <>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-extrabold tracking-tight">Reset Password</CardTitle>
        <CardDescription>
          Enter your new password below to update and access your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Resetting Password...
              </>
            ) : (
              "Reset Password & Log In"
            )}
          </Button>
        </form>
      </CardContent>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Background blobs for premium glassmorphism feel */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

      <Card className="w-full max-w-md border-border/40 bg-background/60 backdrop-blur-xl shadow-2xl transition-all">
        <Suspense fallback={
          <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading reset session...</p>
          </CardContent>
        }>
          <ResetPasswordForm />
        </Suspense>
      </Card>
    </div>
  );
}
