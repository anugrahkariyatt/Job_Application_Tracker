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

        // Fetch candidate profile details
        try {
          const profileResponse = await axiosInstance.get("/api/candidate");
          if (profileResponse.data?.success) {
            setProfile(profileResponse.data.data);
          }
        } catch (profileError: any) {
          if (profileError.response?.status === 404) {
            setProfileMissing(true);
          } else {
            throw profileError;
          }
        }

        // Fetch applications submitted by candidate
        const appsResponse = await axiosInstance.get("/api/application");
        if (
          appsResponse.data?.success &&
          Array.isArray(appsResponse.data.data)
        ) {
          const mappedApps: Application[] = appsResponse.data.data.map(
            mapApplicationToFrontend,
          );
          setApplications(mappedApps);

          // Build timeline events from applications
          const events = appsResponse.data.data.map(mapTimelineEventToFrontend);
          setTimeline(events.slice(0, 5));

          // Fetch real upcoming interviews
          try {
            const interviewRes = await axiosInstance.get('/api/interviews');
            if (interviewRes.data?.success && Array.isArray(interviewRes.data.data)) {
              const mappedInterviews = interviewRes.data.data
                .filter((iv: any) => iv.status === 'Scheduled')
                .map((iv: any) => {
                  const dateObj = new Date(iv.date);
                  return {
                    id: iv._id,
                    jobTitle: iv.jobId?.title || 'Position',
                    company: iv.companyId?.companyName || 'Company',
                    companyLogo: iv.companyId?.logo || '',
                    date: dateObj.toISOString(),
                    time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    format: iv.type === 'Video Call' ? 'Video' : iv.type,
                    round: iv.title,
                    link: iv.link,
                    notes: iv.notes,
                    status: iv.status,
                  };
                });
              setUpcomingInterviews(mappedInterviews);
            }
          } catch (ivErr) {
            console.error("Error fetching candidate interviews:", ivErr);
          }
        }

        // Fetch recommended open jobs
        const jobsResponse = await axiosInstance.get("/api/jobs");
        if (
          jobsResponse.data?.success &&
          Array.isArray(jobsResponse.data.data)
        ) {
          const mappedJobs = jobsResponse.data.data.map(mapJobToFrontend);
          setRecommendations(mappedJobs);
        }

        // Fetch user notifications
        const notifResponse = await axiosInstance.get("/api/notifications");
        if (
          notifResponse.data?.success &&
          Array.isArray(notifResponse.data.data)
        ) {
          const mappedNotifs = notifResponse.data.data.map(
            mapNotificationToFrontend,
          );
          setNotifications(mappedNotifs);
        }
      } catch (err: any) {
        console.error("Failed to load candidate dashboard:", err);
        toast.error("Failed to load dashboard statistics.");
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
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading dashboard metrics...
        </p>
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
                Welcome to Techno Careers,{" "}
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
      {/* Welcome + Profile Completion */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="flex items-center gap-4 p-6">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={profile?.profileImage || ""}
                alt={profile?.fullName || user?.name}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back,{" "}
                {(profile?.fullName || user?.name || "Candidate").split(" ")[0]}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {profile?.headline || "Job Seeker"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Profile Completion</CardTitle>
            <CardDescription>
              Complete your profile to get better matches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Progress
                value={calculateProfileCompletion(profile)}
                className="h-2"
              />
              <span className="text-sm font-semibold">
                {calculateProfileCompletion(profile)}%
              </span>
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
              <Link href="/candidate/profile">
                <User className="mr-2 h-4 w-4" />
                Complete Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/candidate/profile">
          <Card className="cursor-pointer transition-shadow hover:shadow-md h-full">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Complete Profile</p>
                <p className="text-xs text-muted-foreground">
                  Update your information
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/candidate/profile">
          <Card className="cursor-pointer transition-shadow hover:shadow-md h-full">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Upload Resume</p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOCX up to 5MB
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/candidate/jobs">
          <Card className="cursor-pointer transition-shadow hover:shadow-md h-full">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Find Jobs</p>
                <p className="text-xs text-muted-foreground">
                  Search new opportunities
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Applications Sent"
          value={stats.applicationsSent}
          icon={FileText}
        />
        <StatCard label="Under Review" value={stats.underReview} icon={Eye} />
        <StatCard label="Shortlisted" value={stats.shortlisted} icon={Star} />
        <StatCard label="Interviews" value={stats.interviews} icon={Video} />
        <StatCard label="Rejected" value={stats.rejected} icon={XCircle} />
        <StatCard label="Saved Jobs" value={stats.savedJobs} icon={Bookmark} />
      </div>

      {/* Recent Applications Table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Recent Applications</CardTitle>
            <CardDescription>Your latest job applications</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/candidate/applied">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              You haven't submitted any job applications yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Company
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Applied Date
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.slice(0, 5).map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <Link
                        href={`/candidate/jobs/${app.jobId}`}
                        className="font-medium hover:underline"
                      >
                        {app.job.title}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {app.job.company}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
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

      {/* Job Recommendations + Side Widgets */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Latest Job Recommendations
            </h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/candidate/jobs">View All</Link>
            </Button>
          </div>
          {recommendations.length === 0 ? (
            <div className="text-center py-12 border rounded-xl bg-card text-muted-foreground text-sm">
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

        <div className="space-y-6">
          {/* Upcoming Interviews */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Interviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingInterviews.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No upcoming interviews scheduled yet.
                </div>
              ) : (
                upcomingInterviews.map((iv) => (
                  <div key={iv.id} className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 rounded-lg">
                      <AvatarImage src={iv.companyLogo} alt={iv.company} />
                      <AvatarFallback className="rounded-lg">
                        {iv.company.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{iv.jobTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {iv.company} · {iv.round}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(iv.date)} at {iv.time}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="font-normal">
                          {iv.format}
                        </Badge>
                        {iv.link && (
                          <a
                            href={iv.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                          >
                            <ExternalLink className="h-3 w-3" /> Join Meet
                          </a>
                        )}
                      </div>
                      {iv.notes && (
                        <p className="mt-2 text-xs text-muted-foreground bg-muted/40 p-2 rounded border border-border/50">
                          {iv.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Notifications Widget */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Notifications</CardTitle>
              <Button variant="ghost" size="sm" asChild>
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
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          config.className,
                        )}
                      >
                        <config.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-tight">
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {n.message}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {relativeTime(n.time)}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application Activity</CardTitle>
          <CardDescription>
            Recent activity on your applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
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
                          "flex h-9 w-9 items-center justify-center rounded-full",
                          config.className,
                        )}
                      >
                        <config.icon className="h-4 w-4" />
                      </div>
                      {idx < timeline.length - 1 && (
                        <div className="w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
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
  );
}
