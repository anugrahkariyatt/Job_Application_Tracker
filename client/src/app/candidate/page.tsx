"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Eye,
  Star,
  Video,
  XCircle,
  Bookmark,
  User,
  Upload,
  Search,
  ArrowRight,
  Calendar,
  Bell,
  TrendingUp,
  Loader2,
  ExternalLink,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/candidate/stat-card";
import { JobCard } from "@/components/candidate/job-card";
import { StatusBadge } from "@/components/candidate/status-badge";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

import {
  formatDate,
  relativeTime,
  statusConfig,
  type TimelineEvent,
  type Application,
  type Job,
  type NotificationItem,
  type Interview,
} from "@/lib/candidate-data";

import {
  mapJobToFrontend,
  mapApplicationToFrontend,
  mapNotificationToFrontend,
  mapTimelineEventToFrontend,
} from "@/lib/candidate-mappers";

const timelineIconMap: Record<
  TimelineEvent["type"],
  { icon: React.ElementType; className: string }
> = {
  applied: {
    icon: FileText,
    className: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  },
  review: {
    icon: Eye,
    className:
      "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  },
  interview: {
    icon: Video,
    className: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400",
  },
  offer: {
    icon: Star,
    className:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  },
  rejected: {
    icon: XCircle,
    className: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400",
  },
};

const notificationIconMap = {
  application: {
    icon: FileText,
    className: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  },
  job_alert: {
    icon: Bell,
    className:
      "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  },
  company: {
    icon: TrendingUp,
    className:
      "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
  },
  interview: {
    icon: Video,
    className: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400",
  },
};

// Calculate profile completion percentage based on filled fields
const calculateProfileCompletion = (profile: any): number => {
  if (!profile) return 0;

  // Define fields and their weights
  const criticalFields = [
    { field: "phone", weight: 15 },
    { field: "resumeUrl", weight: 20 },
  ];

  const importantFields = [
    { field: "profileImage", weight: 15 },
    { field: "headline", weight: 15 },
    { field: "location", weight: 15 },
  ];

  const optionalFields = [
    { field: "bio", weight: 10 },
    { field: "portfolio", weight: 5 },
    { field: "github", weight: 5 },
    { field: "linkedin", weight: 5 },
  ];

  let completionScore = 0;

  // Check critical fields
  criticalFields.forEach(({ field, weight }) => {
    if (profile[field]) {
      completionScore += weight;
    }
  });

  // Check important fields
  importantFields.forEach(({ field, weight }) => {
    if (profile[field]) {
      completionScore += weight;
    }
  });

  // Check optional fields
  optionalFields.forEach(({ field, weight }) => {
    if (profile[field]) {
      completionScore += weight;
    }
  });

  return Math.min(100, completionScore);
};

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [profileMissing, setProfileMissing] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendations, setRecommendations] = useState<Job[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("savedJobs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedJobIds(parsed.map((j: any) => j.id));
      } catch (e) {}
    }
  }, []);

  const handleToggleSave = (jobId: string) => {
    const saved = localStorage.getItem("savedJobs");
    let currentSaved: any[] = [];
    if (saved) {
      try {
        currentSaved = JSON.parse(saved);
      } catch (e) {}
    }

    const isSaved = currentSaved.some((j) => j.id === jobId);
    if (isSaved) {
      currentSaved = currentSaved.filter((j) => j.id !== jobId);
      setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
      toast.success("Job unsaved successfully.");
    } else {
      const jobToAdd = recommendations.find((j) => j.id === jobId);
      if (jobToAdd) {
        currentSaved.push(jobToAdd);
        setSavedJobIds((prev) => [...prev, jobId]);
        toast.success("Job saved successfully.");
      }
    }
    localStorage.setItem("savedJobs", JSON.stringify(currentSaved));
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setProfileMissing(false);

        // Fetch candidate dashboard resources in parallel
        const [profileRes, appsRes, interviewRes, jobsRes, notifRes] =
          await Promise.allSettled([
            axiosInstance.get("/api/candidate"),
            axiosInstance.get("/api/application"),
            axiosInstance.get("/api/interviews"),
            axiosInstance.get("/api/jobs"),
            axiosInstance.get("/api/notifications"),
          ]);

        // Process profile
        if (
          profileRes.status === "fulfilled" &&
          profileRes.value.data?.success
        ) {
          setProfile(profileRes.value.data.data);
        } else if (
          profileRes.status === "rejected" &&
          profileRes.reason?.response?.status === 404
        ) {
          setProfileMissing(true);
        }

        // Process applications & timeline
        if (
          appsRes.status === "fulfilled" &&
          appsRes.value.data?.success &&
          Array.isArray(appsRes.value.data.data)
        ) {
          const mappedApps: Application[] = appsRes.value.data.data.map(
            mapApplicationToFrontend,
          );
          setApplications(mappedApps);

          const events = appsRes.value.data.data.map(
            mapTimelineEventToFrontend,
          );
          setTimeline(events.slice(0, 5));
        }

        // Process interviews
        if (
          interviewRes.status === "fulfilled" &&
          interviewRes.value.data?.success &&
          Array.isArray(interviewRes.value.data.data)
        ) {
          const mappedInterviews = interviewRes.value.data.data
            .filter((iv: any) => iv.status === "Scheduled")
            .map((iv: any) => {
              const dateObj = new Date(iv.date);
              return {
                id: iv._id,
                jobTitle: iv.jobId?.title || "Position",
                company: iv.companyId?.companyName || "Company",
                companyLogo: iv.companyId?.logo || "",
                date: dateObj.toISOString(),
                time: dateObj.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                format: iv.type === "Video Call" ? "Video" : iv.type,
                round: iv.title,
                link: iv.link,
                notes: iv.notes,
                status: iv.status,
              };
            });
          setUpcomingInterviews(mappedInterviews);
        }

        // Process recommendations
        if (
          jobsRes.status === "fulfilled" &&
          jobsRes.value.data?.success &&
          Array.isArray(jobsRes.value.data.data)
        ) {
          const mappedJobs = jobsRes.value.data.data.map(mapJobToFrontend);
          setRecommendations(mappedJobs);
        }

        // Process notifications
        if (
          notifRes.status === "fulfilled" &&
          notifRes.value.data?.success &&
          Array.isArray(notifRes.value.data.data)
        ) {
          const mappedNotifs = notifRes.value.data.data.map(
            mapNotificationToFrontend,
          );
          setNotifications(mappedNotifs);
        }
      } catch (err: any) {
        console.error("Failed to load candidate dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleApplyJob = async (jobId: string) => {
    try {
      const response = await axiosInstance.post("/api/application", { jobId });
      if (response.data?.success) {
        toast.success("Successfully applied for job!");
        // Refresh applications list
        const appsResponse = await axiosInstance.get("/api/application");
        if (
          appsResponse.data?.success &&
          Array.isArray(appsResponse.data.data)
        ) {
          setApplications(appsResponse.data.data.map(mapApplicationToFrontend));
        }
      }
    } catch (err: any) {
      console.error("Apply job error:", err);
      toast.error(err.response?.data?.message || "Failed to apply for job.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-1/3" />
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-6 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </Card>
          <Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-1/2" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </Card>
        </div>
      </div>
    );
  }

  if (profileMissing) {
    return (
      <div className="space-y-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-8 text-center space-y-6 max-w-xl mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight">
                Create Candidate Profile
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Welcome to Nuvora,{" "}
                <span className="font-semibold text-foreground">
                  {user?.name}
                </span>
                ! Before you can search and apply to jobs, you need to create
                your candidate profile. Tell employers about your skills and
                experience!
              </p>
            </div>
            <div className="flex justify-center pt-2">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto font-semibold"
              >
                <Link href="/candidate/profile">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    applicationsSent: applications.length,
    underReview: applications.filter((a) => a.status === "Under Review").length,
    shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
    interviews: applications.filter((a) => a.status === "Interview").length,
    rejected: applications.filter((a) => a.status === "Rejected").length,
    savedJobs: savedJobIds.length,
  };

  const initials = (profile?.fullName || user?.name || "Candidate")
    .split(" ")
    .map((n: any) => n[0])
    .join("");

  return (
    <div className="space-y-6">
      {/* Streamlined Hero Header Banner */}
      <Card className="border-border/60 shadow-sm bg-gradient-to-r from-card via-card to-primary/5 overflow-hidden">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-sm">
              <AvatarImage
                src={profile?.profileImage || ""}
                alt={profile?.fullName || user?.name}
              />
              <AvatarFallback className="font-bold text-base bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground">
                Welcome back,{" "}
                {(profile?.fullName || user?.name || "Candidate").split(" ")[0]}!
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground font-medium">
                {profile?.headline || "Full Stack Developer · Job Seeker"}
              </p>
            </div>
          </div>

          {/* Inline Compact Profile Completion */}
          <div className="w-full sm:w-auto min-w-[220px] p-3.5 rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Profile Strength</span>
              <span className="font-extrabold text-primary">
                {calculateProfileCompletion(profile)}%
              </span>
            </div>
            <Progress
              value={calculateProfileCompletion(profile)}
              className="h-2 bg-muted"
            />
            <Link
              href="/candidate/profile"
              className="inline-flex items-center justify-between w-full pt-1 text-[11px] font-bold text-primary hover:underline"
            >
              <span>{calculateProfileCompletion(profile) === 100 ? "View Profile" : "Update Profile Info"}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Streamlined Key Metric Summary Bar (4 High-Value Cards) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Applications Sent"
          value={stats.applicationsSent}
          icon={FileText}
        />
        <StatCard label="Under Review" value={stats.underReview} icon={Eye} />
        <StatCard label="Interviews Scheduled" value={stats.interviews} icon={Video} />
        <StatCard label="Saved Jobs" value={stats.savedJobs} icon={Bookmark} />
      </div>

      {/* Main Grid: Left (2/3) & Right (1/3) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* 1. Recent Applications Table */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base font-bold">Recent Applications</CardTitle>
                <CardDescription className="text-xs">Your latest job applications</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs gap-1 font-semibold text-primary hover:text-primary/80" asChild>
                <Link href="/candidate/applied">
                  View All
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  You haven't submitted any job applications yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs">Job</TableHead>
                      <TableHead className="hidden md:table-cell text-xs">
                        Company
                      </TableHead>
                      <TableHead className="hidden sm:table-cell text-xs">
                        Applied Date
                      </TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.slice(0, 5).map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <Link
                            href={`/candidate/jobs/${app.jobId}`}
                            className="font-semibold text-xs text-foreground hover:text-primary transition-colors"
                          >
                            {app.job.title}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                          {app.job.company}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                          {formatDate(app.appliedDate)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={app.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* 2. Latest Job Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Latest Job Recommendations
                </h2>
                <p className="text-xs text-muted-foreground">Tailored opportunities for your skills</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary hover:text-primary/80" asChild>
                <Link href="/candidate/jobs">View All</Link>
              </Button>
            </div>
            {recommendations.length === 0 ? (
              <div className="text-center py-8 border rounded-xl bg-card text-muted-foreground text-xs">
                No recommended jobs available at this time.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {recommendations.slice(0, 4).map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onApply={handleApplyJob}
                    saved={savedJobIds.includes(job.id)}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 3. Application Activity Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Application Activity</CardTitle>
              <CardDescription className="text-xs">
                Recent activity on your applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No recent application activity.
                </div>
              ) : (
                <div className="space-y-1">
                  {timeline.map((event, idx) => {
                    const config =
                      timelineIconMap[event.type] || timelineIconMap.applied;
                    return (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full shrink-0",
                              config.className,
                            )}
                          >
                            <config.icon className="h-3.5 w-3.5" />
                          </div>
                          {idx < timeline.length - 1 && (
                            <div className="w-px flex-1 bg-border/60" />
                          )}
                        </div>
                        <div className="pb-5">
                          <p className="text-xs font-bold text-foreground">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.description}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {relativeTime(event.time)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6 lg:col-span-1">
          {/* 1. Upcoming Interviews */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Upcoming Interviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingInterviews.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No upcoming interviews scheduled yet.
                </div>
              ) : (
                upcomingInterviews.map((iv) => (
                  <div key={iv.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
                    <Avatar className="h-9 w-9 rounded-lg shrink-0">
                      <AvatarImage src={iv.companyLogo} alt={iv.company} />
                      <AvatarFallback className="rounded-lg text-xs font-bold">
                        {iv.company.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{iv.jobTitle}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {iv.company} · {iv.round}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Calendar className="h-3 w-3 text-primary" />
                        {formatDate(iv.date)} at {iv.time}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="font-normal text-[10px]">
                          {iv.format}
                        </Badge>
                        {iv.link && (
                          <a
                            href={iv.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
                          >
                            <ExternalLink className="h-3 w-3" /> Join Meet
                          </a>
                        )}
                      </div>
                      {iv.notes && (
                        <p className="mt-2 text-[11px] text-muted-foreground bg-muted/50 p-2 rounded border border-border/40">
                          {iv.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* 2. Notifications Widget */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-bold">Notifications</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary hover:text-primary/80" asChild>
                <Link href="/candidate/notifications">All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No new notifications.
                </div>
              ) : (
                notifications.slice(0, 4).map((n) => {
                  const config =
                    notificationIconMap[n.type] ||
                    notificationIconMap.application;
                  return (
                    <div key={n.id} className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5",
                          config.className,
                        )}
                      >
                        <config.icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold leading-tight text-foreground truncate">
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">
                          {n.message}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {relativeTime(n.time)}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
