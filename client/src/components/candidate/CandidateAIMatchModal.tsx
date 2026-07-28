"use client";

import React, { useEffect, useState } from "react";
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
  FileText,
  Loader2,
  XCircle,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import axiosInstance from "@/lib/axios";

interface CandidateAIMatchResult {
  score: number;
  strengths: string[];
  missingSkills: string[];
  summary: string;
  recommendation: string;
}

interface CandidateAIMatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
}

export function CandidateAIMatchModal({
  open,
  onOpenChange,
  jobId,
  jobTitle,
}: CandidateAIMatchModalProps) {
  const [result, setResult] = useState<CandidateAIMatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    console.log("CandidateAIMatchModal rendered");
    const fetchMatch = async () => {
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        const res = await axiosInstance.get(`/api/jobs/${jobId}/ai-match`);
        if (!cancelled && res.data?.success) {
          setResult(res.data.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("[CANDIDATE AI MATCH] Error:", err);
          setError(
            err?.response?.data?.message ||
            "Failed to generate AI match. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMatch();
    return () => {
      cancelled = true;
    };
  }, [open, jobId]);

  // Match score helper matching recruiter styling
  const matchScore = result?.score ?? 0;
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 70) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-rose-500 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <Award className="h-4 w-4 text-primary" />
            <span>AI Job Match Assessment</span>
          </div>
          <DialogTitle className="text-xl font-bold text-foreground mt-1">
            {jobTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Automated profile alignment &amp; AI fit analysis report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
                  Running AI Analysis&hellip;
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Comparing your profile and skills against job requirements
                </p>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <p className="text-sm font-semibold text-foreground">Analysis Failed</p>
              <p className="text-xs text-muted-foreground max-w-xs">{error}</p>
            </div>
          )}

          {!loading && !error && result && (
            <>
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
                    <h4 className="text-sm font-bold text-foreground">AI Profile Match Score</h4>
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
                    ? "High Match — Strong Fit"
                    : matchScore >= 60
                      ? "Moderate Match"
                      : "Low Match"}
                </Badge>
              </div>

              {/* Key Strengths */}
              {result.strengths.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-primary" /> Your Matching Strengths
                  </h4>
                  <div className="space-y-2">
                    {result.strengths.map((strength: string, index: number) => (
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
              {result.missingSkills.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-rose-500" /> Skill Gaps / Missing Requirements
                  </h4>
                  <div className="space-y-2">
                    {result.missingSkills.map((skill: string, index: number) => (
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
                  <FileText className="h-4 w-4 text-primary" /> Match Summary
                </h4>
                <div className="p-4 rounded-xl border border-border bg-card text-xs text-muted-foreground leading-relaxed">
                  {result.summary}
                </div>
              </div>

              {/* Recommendation */}
              {result.recommendation && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4 text-amber-500" /> AI Recommendation
                  </h4>
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-foreground leading-relaxed">
                    {result.recommendation}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="border-t border-border/50 pt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}