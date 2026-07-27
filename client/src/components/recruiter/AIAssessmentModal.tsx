"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  CheckCircle2,
  Sparkles,
  FileText,
  UserCheck,
  Calendar,
  Lock,
  Zap,
  ArrowRight,
  ShieldCheck,
  Loader2,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import axiosInstance from "@/lib/axios";

interface IAIScreening {
  score: number;
  strengths: string[];
  missingSkills: string[];
  summary: string;
  generatedAt?: string;
}

interface AIAssessmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicant: any;
  applicationId: string;
  onScreeningComplete?: (screening: IAIScreening) => void;
  onStatusChange?: (appId: string, newStatus: string) => void;
  onScheduleInterview?: (applicant: any) => void;
}

export function AIAssessmentModal({
  open,
  onOpenChange,
  applicant,
  applicationId,
  onScreeningComplete,
  onStatusChange,
  onScheduleInterview,
}: AIAssessmentModalProps) {
  const currentUser = useAppSelector((state) => state.auth.user);
  const isPro = currentUser?.subscriptionPlan === "pro";

  const [screening, setScreening] = useState<IAIScreening | null>(
    applicant?.aiScreening ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (applicant?.aiScreening) {
      setScreening(applicant.aiScreening);
    }
  }, [applicant]);

  // Use a ref to hold the latest screening value so the effect does not
  // need it as a dependency (avoids infinite re-fetch loop).
  const screeningRef = React.useRef(screening);
  screeningRef.current = screening;

  // Stable ref for the callback so fetchScreening identity stays constant.
  const onScreeningCompleteRef = React.useRef(onScreeningComplete);
  onScreeningCompleteRef.current = onScreeningComplete;

  // ── Fetch screening from API ────────────────────────────────────────────────
  const fetchScreening = useCallback(async () => {
    console.log(`[CLIENT AI MODAL] Fetching AI Screening for Application ID: ${applicationId}`);
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(
        `/api/application/${applicationId}/ai-screening`,
      );
      console.log(`[CLIENT AI MODAL] AI Screening API response received:`, res.data);
      if (res.data?.success) {
        setScreening(res.data.data);
        onScreeningCompleteRef.current?.(res.data.data);
      }
    } catch (err: any) {
      console.error(`[CLIENT AI MODAL ERROR] Failed to fetch AI screening:`, err);
      setError(
        err.response?.data?.message ?? "Failed to run AI screening.",
      );
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  // Auto-fetch when modal opens.
  useEffect(() => {
    if (!open || !applicationId) return;
    console.log(`[CLIENT AI MODAL] Modal opened for App ID: ${applicationId}. Initiating API request...`);
    fetchScreening();
  }, [open, applicationId, fetchScreening]);

  // All hooks are above this point — early return is safe here.
  if (!applicant) return null;

  const candidate = applicant.candidateId || {};
  const user = candidate.userId || {};
  const job = applicant.jobId || {};

  // ── Derived display values (strictly from Gemini AI screening) ──────────────
  const matchScore = screening?.score ?? 0;
  const strengths = screening?.strengths ?? [];
  const missingSkills = screening?.missingSkills ?? [];
  const summary = screening?.summary || "AI evaluation pending.";
  const generatedAt = screening?.generatedAt
    ? new Date(screening.generatedAt).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    })
    : null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 70) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-rose-500 bg-rose-500/10 border-rose-500/20";
  };

  const pricingLink =
    currentUser?.role === "candidate"
      ? "/candidate/pricing"
      : "/recruiter/pricing";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {!isPro ? (
          /* ── PRO PAYWALL ─────────────────────────────────────────────────── */
          <div className="py-2 text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-primary flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Lock className="h-8 w-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 px-3 py-1 font-bold text-xs uppercase tracking-wider"
              >
                <Sparkles className="h-3 w-3 mr-1.5 fill-amber-500" /> PRO Feature Locked
              </Badge>
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                Unlock AI Candidate Screening &amp; Resume Scores
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Automated AI resume match scores, skill assessments, and executive candidate screening reports are reserved for PRO plan subscribers.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card/60 text-left space-y-3 max-w-md mx-auto">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" /> Exclusive PRO Features Included:
              </h4>
              <ul className="space-y-2.5 text-xs text-foreground font-medium">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Instant AI Resume Match &amp; Candidate Suitability Scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>AI Executive Screening Summaries &amp; Key Strengths Report</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Missing Skills Gap Analysis &amp; Candidate Fit Report</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Unlimited Active Job Postings &amp; Priority Applicant Alerts</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                Close
              </Button>
              <Button
                asChild
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-primary text-white font-bold gap-2 shadow-md hover:opacity-95"
              >
                <Link href={pricingLink} onClick={() => onOpenChange(false)}>
                  <Zap className="h-4 w-4 fill-white" />
                  Upgrade to PRO Plan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          /* ── FULL AI ASSESSMENT (PRO) ─────────────────────────────────────── */
          <>
            <DialogHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                <Award className="h-4 w-4 text-primary" />
                <span>AI Candidate Screening</span>
              </div>
              <DialogTitle className="text-xl font-bold text-foreground mt-1">
                {user.name || "Candidate"} &mdash; {job.title || "Applicant"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Automated resume screening &amp; AI match analysis report
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* ── Loading State ─────────────────────────────────────────── */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                  <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                    <div className="relative h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Loader2 className="h-7 w-7 animate-spin text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Running AI Screening&hellip;
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Analysing resume, skills &amp; job requirements
                    </p>
                  </div>
                </div>
              )}

              {/* ── Error State ───────────────────────────────────────────── */}
              {!loading && error && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Screening Failed</p>
                  <p className="text-xs text-muted-foreground max-w-xs">{error}</p>
                  <Button size="sm" variant="outline" onClick={fetchScreening}>
                    Retry
                  </Button>
                </div>
              )}

              {/* ── Results ───────────────────────────────────────────────── */}
              {!loading && !error && (
                <>
                  {/* Cached badge */}
                  {generatedAt && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Screening cached &middot; Generated {generatedAt}
                    </div>
                  )}

                  {/* Match Score Card */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-16 w-16 rounded-2xl border flex flex-col items-center justify-center ${getScoreColor(matchScore)} font-extrabold text-xl shadow-sm`}
                      >
                        <span>{matchScore}%</span>
                        <span className="text-[10px] font-medium uppercase text-muted-foreground">
                          Match
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">AI Suitability Score</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Evaluated against job requirements &amp; skill alignment
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`px-3 py-1 text-xs font-semibold ${matchScore >= 80
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : matchScore >= 60
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                        }`}
                    >
                      {matchScore >= 80
                        ? "High Match — Recommended"
                        : matchScore >= 60
                          ? "Moderate Match"
                          : "Low Match"}
                    </Badge>
                  </div>

                  {/* Key Strengths */}
                  {strengths.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-primary" /> Key Candidate Strengths
                      </h4>
                      <div className="space-y-2">
                        {strengths.map((strength: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-2.5 p-3 rounded-lg border border-border/60 bg-muted/30 text-xs font-medium text-foreground"
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills */}
                  {missingSkills.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <XCircle className="h-4 w-4 text-rose-500" /> Skill Gaps / Missing Skills
                      </h4>
                      <div className="space-y-2">
                        {missingSkills.map((skill: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-2.5 p-3 rounded-lg border border-rose-500/20 bg-rose-500/5 text-xs font-medium text-foreground"
                          >
                            <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                            <span>{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Executive Summary */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-primary" /> Executive Screening Summary
                    </h4>
                    <div className="p-4 rounded-xl border border-border bg-card text-xs text-muted-foreground leading-relaxed">
                      {summary}
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="border-t border-border/50 pt-4 flex flex-col sm:flex-row gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Close
              </Button>

              {onStatusChange && (
                <Button
                  variant="default"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  onClick={() => {
                    onStatusChange(applicant._id, "Shortlisted");
                    onOpenChange(false);
                  }}
                >
                  <UserCheck className="h-4 w-4" />
                  Shortlist Candidate
                </Button>
              )}

              {onScheduleInterview && (
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    onOpenChange(false);
                    onScheduleInterview(applicant);
                  }}
                >
                  <Calendar className="h-4 w-4" />
                  Schedule Interview
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
