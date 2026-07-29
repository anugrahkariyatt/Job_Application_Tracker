"use client";

import React, { useState, useEffect } from "react";
import {
  Check,
  Building2,
  UserCheck,
  ShieldCheck,
  Gem,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PricingContentProps {
  defaultRole?: "candidate" | "recruiter";
  showToggle?: boolean;
}

export function PricingContent({
  defaultRole = "candidate",
  showToggle = true,
}: PricingContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const initialRole =
    currentUser?.role === "recruiter" || currentUser?.role === "candidate"
      ? currentUser.role
      : defaultRole;

  const [userRole, setUserRole] = useState<"candidate" | "recruiter">(
    initialRole
  );
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const verifiedRef = React.useRef(false);

  useEffect(() => {
    const success = searchParams.get("success");
    const sessionId = searchParams.get("session_id");

    if (success === "true" && currentUser && !verifiedRef.current) {
      verifiedRef.current = true;
      const handleStripeReturn = async () => {
        try {
          const endpoint = sessionId
            ? "/api/payments/verify-session"
            : "/api/payments/success";
          const res = await axiosInstance.post(endpoint, {
            sessionId,
            plan: "pro",
          });
          if (res.data?.success) {
            dispatch(setUser({ ...currentUser, subscriptionPlan: "pro" }));
            toast.success("Successfully upgraded to PRO!");
            if (typeof window !== "undefined") {
              window.history.replaceState(null, "", window.location.pathname);
            }
          }
        } catch (err: any) {
          console.error("[STRIPE VERIFY ERROR]", err);
        }
      };
      handleStripeReturn();
    }
  }, [searchParams, currentUser, dispatch]);

  const handleSubscribe = async (planName: string) => {
    if (!currentUser) {
      toast.info("Please login or create an account to upgrade your plan.");
      router.push("/login");
      return;
    }

    setLoadingPlan(planName);
    try {
      // Create Stripe checkout session
      const response = await axiosInstance.post("/api/payments/checkout", {
        plan: planName,
      });
      if (response.data?.checkoutUrl) {
        if (
          response.data.checkoutUrl.includes("success=true") &&
          !response.data.checkoutUrl.includes("stripe.com")
        ) {
          // Fallback simulation mode when live Stripe secret key is not set
          const successRes = await axiosInstance.post("/api/payments/success", {
            plan: "pro",
          });
          if (successRes.data?.success) {
            if (currentUser) {
              dispatch(setUser({ ...currentUser, subscriptionPlan: "pro" }));
            }
            toast.success(
              `Successfully upgraded to ${
                userRole === "candidate" ? "Candidate Pro" : "Recruiter Pro"
              }!`
            );
            router.push(
              userRole === "candidate"
                ? "/candidate/jobs"
                : "/recruiter/dashboard"
            );
          }
        } else {
          // Redirect to live Stripe checkout page
          window.location.href = response.data.checkoutUrl;
        }
      }
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 401) {
        toast.error("Please login to upgrade your account plan.");
        router.push("/login");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to initiate Stripe payment."
        );
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-10rem)] flex flex-col justify-center">
      {/* Header Section */}
      <div className="max-w-3xl mx-auto text-center mb-10 space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Simple, Transparent Pricing
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Choose the right plan to supercharge your career or hire top tech
          talent with AI-powered automations.
        </p>

        {/* Role Toggle Switch */}
        {showToggle && (
          <div className="pt-4 inline-flex p-1 bg-muted/60 border border-border/70 rounded-xl">
            <button
              onClick={() => setUserRole("candidate")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                userRole === "candidate"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Job Seekers
            </button>
            <button
              onClick={() => setUserRole("recruiter")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                userRole === "recruiter"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Recruiters & Companies
            </button>
          </div>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="max-w-4xl mx-auto w-full grid md:grid-cols-2 gap-6 items-stretch pt-4">
        {/* FREE TIER CARD */}
        <Card className="flex flex-col justify-between border-border/70 bg-card shadow-xs hover:shadow-md transition-all rounded-2xl p-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold">Starter Free</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              {userRole === "candidate"
                ? "Essential job tracking & application features"
                : "For small teams and standard job postings"}
            </CardDescription>
            <div className="pt-4">
              <span className="text-4xl font-black text-foreground">$0</span>
              <span className="text-muted-foreground text-xs font-medium">
                {" "}
                / forever
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
            <ul className="space-y-3 pt-2">
              {userRole === "candidate" ? (
                <>
                  <li className="flex items-center gap-3 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>Subscribe up to 10 companies</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>Standard job search & application tracking</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>Daily Job Alerts</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-3 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>Standard active job postings</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>Full applicant management pipeline</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>Company profile & branding page</span>
                  </li>
                </>
              )}
            </ul>

            <Button
              variant="outline"
              className="w-full mt-6 h-11 font-semibold rounded-xl"
              asChild
            >
              <Link href="/register">Get Started Free</Link>
            </Button>
          </CardContent>
        </Card>

        {/* PRO TIER CARD */}
        <Card
          className={`relative flex flex-col justify-between transition-all duration-300 rounded-2xl p-2 ${
            currentUser?.subscriptionPlan === "pro"
              ? "border-2 border-emerald-500/80 bg-emerald-500/[0.03] shadow-md"
              : "border-2 border-emerald-500/80 bg-card shadow-md hover:shadow-lg"
          }`}
        >
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-bold text-foreground">
                  {userRole === "candidate" ? "Candidate Pro" : "Recruiter Pro"}
                </CardTitle>

                <Badge
                  variant="secondary"
                  className="text-[10px] px-2 py-0.5 font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 gap-1"
                >
                  <Gem className="w-3 h-3 text-emerald-500" />
                  PRO
                </Badge>
              </div>

              {currentUser?.subscriptionPlan === "pro" ? (
                <Badge className="text-[10px] px-2.5 py-0.5 font-semibold bg-emerald-500 text-white gap-1">
                  <ShieldCheck className="w-3 h-3" /> Active Plan
                </Badge>
              ) : null}
            </div>

            <CardDescription className="text-xs sm:text-sm font-medium pt-1">
              {userRole === "candidate"
                ? "Unlimited company subscriptions & instant job alerts"
                : "Unlimited job postings, Gemini AI screening & interview tools"}
            </CardDescription>

            <div className="pt-4">
              <span className="text-4xl sm:text-5xl font-black text-foreground">
                {userRole === "candidate" ? "$9.99" : "$29.99"}
              </span>
              <span className="text-muted-foreground text-xs sm:text-sm font-medium">
                {" "}
                / month
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
            <ul className="space-y-3 pt-2">
              {userRole === "candidate" ? (
                <>
                  <li className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                    <span>
                      <strong>Unlimited</strong> company subscriptions
                    </span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                    <span>
                      <strong>Instant Job Alerts</strong> via Email
                    </span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                    <span>Priority application status notifications</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                    <span>
                      <strong>Unlimited</strong> active job postings
                    </span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                    <span>
                      <strong>Candidate Screening</strong> & match scores
                    </span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                    <span>
                      <strong>Direct Candidate Email Notifications</strong> & status updates
                    </span>
                  </li>
                </>
              )}
            </ul>

            {currentUser?.subscriptionPlan === "pro" ? (
              <Button
                disabled
                className="w-full mt-6 flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold opacity-100 cursor-default h-11 rounded-xl"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Active Pro Plan</span>
              </Button>
            ) : (
              <Button
                className="w-full mt-6 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-500/20 transition-all h-11 rounded-xl"
                onClick={() =>
                  handleSubscribe(
                    userRole === "candidate" ? "candidate-pro" : "recruiter-pro"
                  )
                }
                disabled={loadingPlan !== null}
              >
                <span>
                  {loadingPlan
                    ? "Processing..."
                    : `Upgrade to ${
                        userRole === "candidate"
                          ? "Candidate Pro"
                          : "Recruiter Pro"
                      }`}
                </span>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}