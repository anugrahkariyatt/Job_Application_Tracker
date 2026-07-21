"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Mail, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  resendVerificationEmail,
  verifyEmail,
} from "@/features/auth/api/auth.api";

type Status =
  | "waiting"
  | "verifying"
  | "verified"
  | "alreadyVerified"
  | "expired";
export default function VerifyEmailPage() {
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>(token ? "verifying" : "waiting");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        const response = await verifyEmail(token);

        if (response.status === "already_verified") {
          setStatus("alreadyVerified");
          setMessage(response.message);
        } else {
          setStatus("verified");
          setMessage(response.message);
        }

        toast.success(response.message);
      } catch (error: any) {
        setStatus("expired");

        const msg =
          error.response?.data?.message ||
          "Verification link is invalid or expired.";

        setMessage(msg);

        toast.error(msg);
      }
    };

    verify();
  }, [token]);

  const handleResend = async () => {
    if (!email) return;

    try {
      setLoading(true);

      await resendVerificationEmail(email);

      toast.success("Verification email sent.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="absolute left-1/4 top-1/4 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

      <Card className="w-full max-w-md border-border/40 bg-background/70 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-5 text-center">
          <div className="flex justify-center">
            {status === "waiting" && (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
            )}

            {status === "verifying" && (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {status === "verified" && (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            )}

            {status === "alreadyVerified" && (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                <CheckCircle2 className="h-8 w-8 text-amber-600" />
              </div>
            )}

            {status === "expired" && (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            )}
          </div>

          <CardTitle className="text-3xl font-bold">
            {status === "waiting" && "Check Your Inbox"}
            {status === "verifying" && "Verifying Email"}
            {status === "verified" && "Email Verified"}
            {status === "alreadyVerified" && "Already Verified"}
            {status === "expired" && "Verification Failed"}
          </CardTitle>

          <CardDescription className="text-base leading-6">
            {status === "waiting" &&
              "We've sent a verification link to the email address below. Please check your inbox and click the link to activate your account."}

            {status === "verifying" &&
              "Please wait while we verify your email address."}

            {status === "verified" &&
              "Your email has been verified successfully. You can now sign in to your account."}

            {status === "alreadyVerified" &&
              "Your email address has already been verified. You can sign in to your account."}

            {status === "expired" &&
              "This verification link is invalid or has expired. Request a new verification email to continue."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {status === "waiting" && email && (
            <div className="rounded-lg border bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Verification email sent to
              </p>

              <p className="mt-2 break-all font-semibold">{email}</p>
            </div>
          )}

          {status === "waiting" && (
            <Button
              className="w-full"
              disabled={loading}
              onClick={handleResend}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend Verification Email"
              )}
            </Button>
          )}

          {(status === "verified" || status === "alreadyVerified") && (
            <Button asChild className="w-full">
              <Link href="/login">Continue to Login</Link>
            </Button>
          )}

          {status === "expired" && email && (
            <Button
              className="w-full"
              disabled={loading}
              onClick={handleResend}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend Verification Email"
              )}
            </Button>
          )}

          {(status === "verified" || status === "alreadyVerified") && (
            <p className="text-center text-sm text-muted-foreground">
              Need a different account?{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Create one
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
