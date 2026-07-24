"use client";

import React, { useState, useEffect } from "react";
import { Check, Zap, Building2, UserCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PricingContentProps {
  defaultRole?: "candidate" | "recruiter";
  showToggle?: boolean;
}

export function PricingContent({ defaultRole = "candidate", showToggle = true }: PricingContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const initialRole = (currentUser?.role === "recruiter" || currentUser?.role === "candidate")
    ? currentUser.role
    : defaultRole;

  const [userRole, setUserRole] = useState<"candidate" | "recruiter">(initialRole);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const verifiedRef = React.useRef(false);

  useEffect(() => {
    const success = searchParams.get("success");
    const sessionId = searchParams.get("session_id");

    if (success === "true" && currentUser && !verifiedRef.current) {
      verifiedRef.current = true;
      const handleStripeReturn = async () => {
        try {
          const endpoint = sessionId ? "/api/payments/verify-session" : "/api/payments/success";
          const res = await axiosInstance.post(endpoint, { sessionId, plan: "pro" });
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
      const response = await axiosInstance.post("/api/payments/checkout", { plan: planName });
      if (response.data?.checkoutUrl) {
        if (response.data.checkoutUrl.includes("success=true") && !response.data.checkoutUrl.includes("stripe.com")) {
          // Fallback simulation mode when live Stripe secret key is not set
          const successRes = await axiosInstance.post("/api/payments/success", { plan: "pro" });
          if (successRes.data?.success) {
            if (currentUser) {
              dispatch(setUser({ ...currentUser, subscriptionPlan: "pro" }));
            }
            toast.success(`Successfully upgraded to ${userRole === "candidate" ? "Candidate Pro" : "Recruiter Pro"}!`);
            router.push(userRole === "candidate" ? "/candidate/jobs" : "/recruiter/dashboard");
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
        toast.error(error.response?.data?.message || "Failed to initiate Stripe payment.");
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-3xl mx-auto text-center mb-12">

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-muted-foreground text-base max-w-xl mx-auto">
          Choose the right plan to supercharge your career or hire top tech talent with AI-powered automations.
        </p>

        {/* Role Toggle Switch */}
        {showToggle && (
          <div className="mt-8 inline-flex p-1 bg-muted/60 border border-border rounded-xl">
            <button
              onClick={() => setUserRole("candidate")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${userRole === "candidate"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <UserCheck className="w-4 h-4" />
              Job Seekers
            </button>
            <button
              onClick={() => setUserRole("recruiter")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${userRole === "recruiter"
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
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-stretch">
        {/* FREE TIER CARD */}
        <Card className="flex flex-col justify-between border-border bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold">Starter Free</CardTitle>
            </div>
            <CardDescription>
              {userRole === "candidate"
                ? "Essential job tracking & application features"
                : "For small teams and standard job postings"}
            </CardDescription>
            <div className="pt-4">
              <span className="text-4xl font-extrabold text-foreground">$0</span>
              <span className="text-muted-foreground text-sm"> / forever</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
            <ul className="space-y-3 pt-2">
              {userRole === "candidate" ? (
                <>
                  <li className="flex items-center gap-3 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Subscribe up to 10 companies</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Standard job search & application tracking</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Daily email job updates</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-3 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Post up to 3 active jobs</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Standard applicant management dashboard</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Direct candidate email notifications</span>
                  </li>
                </>
              )}
            </ul>

            <Button variant="outline" className="w-full mt-6" asChild>
              <Link href="/register">Get Started Free</Link>
            </Button>
          </CardContent>
        </Card>

        {/* PRO TIER CARD */}
        <Card className={`relative flex flex-col justify-between bg-card shadow-lg ${currentUser?.subscriptionPlan === "pro"
          ? "border-2 border-emerald-500 shadow-emerald-500/10"
          : "border-2 border-primary"
          }`}>
          <div className={`absolute -top-3 right-6 text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm ${currentUser?.subscriptionPlan === "pro"
            ? "bg-emerald-500 text-white"
            : "bg-primary text-primary-foreground"
            }`}>
            {currentUser?.subscriptionPlan === "pro" ? "Your Active Plan" : "Most Popular"}
          </div>

          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-bold">
                {userRole === "candidate" ? "Candidate Pro" : "Recruiter Pro"}
              </CardTitle>
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <CardDescription>
              {userRole === "candidate"
                ? "Unlimited company subscriptions & instant alerts"
                : "Unlimited job postings & n8n AI candidate screening"}
            </CardDescription>
            <div className="pt-4">
              <span className="text-4xl font-extrabold text-foreground">
                {userRole === "candidate" ? "$9.99" : "$29.99"}
              </span>
              <span className="text-muted-foreground text-sm"> / month</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
            <ul className="space-y-3 pt-2">
              {userRole === "candidate" ? (
                <>
                  <li className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span><strong>Unlimited</strong> company subscriptions</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span><strong>Instant Job Alerts</strong> via Email & n8n</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Priority application status notifications</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Verified Pro candidate badge</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span><strong>Unlimited</strong> active job postings</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span><strong>n8n AI Candidate Screening</strong> & match scores</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Top-of-search featured job placement</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Automated interview round scheduling</span>
                  </li>
                </>
              )}
            </ul>

            {currentUser?.subscriptionPlan === "pro" ? (
              <Button
                disabled
                className="w-full mt-6 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-600 text-white font-bold opacity-100 cursor-default"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Active Pro Plan</span>
              </Button>
            ) : (
              <Button
                className="w-full mt-6 flex items-center gap-2"
                onClick={() => handleSubscribe(userRole === "candidate" ? "candidate-pro" : "recruiter-pro")}
                disabled={loadingPlan !== null}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {loadingPlan ? "Processing..." : `Upgrade to ${userRole === "candidate" ? "Candidate Pro" : "Recruiter Pro"}`}
                </span>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
