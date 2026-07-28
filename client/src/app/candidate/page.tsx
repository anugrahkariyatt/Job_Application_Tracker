"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    className: "bg-primary/10 text-primary border border-primary/20",
  },
  review: {
    icon: Eye,
    className: "bg-primary/10 text-primary border border-primary/20",
  },
  interview: {
    icon: Video,
    className: "bg-primary/10 text-primary border border-primary/20",
  },
  offer: {
    icon: Star,
    className: "bg-primary/10 text-primary border border-primary/20",
  },
  rejected: {
    icon: XCircle,
    className: "bg-muted text-muted-foreground border border-border/50",
  },
};

const notificationIconMap = {
  application: {
    icon: FileText,
    className: "bg-primary/10 text-primary border border-primary/20",
  },
  job_alert: {
    icon: Bell,
    className: "bg-primary/10 text-primary border border-primary/20",
  },
  company: {
    icon: TrendingUp,
    className: "bg-primary/10 text-primary border border-primary/20",
  },
  interview: {
    icon: Video,
    className: "bg-primary/10 text-primary border border-primary/20",
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
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [profileMissing, setProfileMissing] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendations, setRecommendations] = useState<Job[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  const handleFilterChange = async (newStatus: string, newType: string, newSort: string) => {
    setStatusFilter(newStatus);
    setTypeFilter(newType);
    setSortOrder(newSort);
    try {
      const params: any = { sort: newSort };
      if (newStatus !== "all") params.status = newStatus;
      if (newType !== "all") params.type = newType;

      const response = await axiosInstance.get("/api/interviews", { params });
      if (response.data?.success && Array.isArray(response.data.data)) {
        const mapped = response.data.data.map((iv: any) => {
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
            format: iv.type === "Video Call" ? "Video" : (iv.type || "Video"),
            type: iv.type || "Video Call",
            round: iv.title,
            link: iv.link,
            notes: iv.notes,
            status: iv.status || "Scheduled",
          };
        });
        setUpcomingInterviews(mapped);
      }
    } catch (err) {
      console.error("Error fetching filtered interviews:", err);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("savedJobs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedJobIds(parsed.map((j: any) => j.id));
      } catch (e) { }
    }
  }, []);

  const handleToggleSave = (jobId: string) => {
    const saved = localStorage.getItem("savedJobs");
    let currentSaved: any[] = [];
    if (saved) {
      try {
        currentSaved = JSON.parse(saved);
      } catch (e) { }
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
                format: iv.type === "Video Call" ? "Video" : (iv.type || "Video"),
                type: iv.type || "Video Call",
                round: iv.title,
                link: iv.link,
                notes: iv.notes,
                status: iv.status || "Scheduled",
              };
            })
            .sort(
              (a: any, b: any) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
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
      const status = err.response?.status;
      const msg = err.response?.data?.message || "Failed to apply for job.";
      const isProfileMissing = status === 404 || msg.toLowerCase().includes("profile");

      if (isProfileMissing) {
        toast.error("Please create your candidate profile before applying.");
        router.push("/candidate/profile");
      } else {
        toast.error(msg);
      }
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
      {profileMissing && (
        <Card className="border-primary/30 bg-primary/10 shadow-sm">
          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Create Your Candidate Profile
                </h3>
                <p className="text-xs text-muted-foreground">
                  Complete your profile to stand out to recruiters and get matched with top tech jobs.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="font-semibold shrink-0">
              <Link href="/candidate/profile">
                Create Candidate Profile
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

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
                Welcome,{" "}
                {(profile?.fullName || user?.name || "Candidate").split(" ")[0]}!
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground font-medium">
                {profile?.headline || "Full Stack Developer · Job Seeker"}
              </p>
            </div>
          </div>

          {/* Inline Compact Profile Completion */}
          <div className="w-full sm:w-auto min-w-[220px] p-3.5 rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm space-y-2">
            <div className="flex items-center justify-between text-sm">
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
              className="inline-flex items-center justify-between w-full pt-1 text-xs font-bold text-primary hover:underline"
            >
              <span>{calculateProfileCompletion(profile) === 100 ? "View Profile" : "Update Profile Info"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
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
        {/* Left Column (2/3 width on desktop, 2nd on mobile) */}
        <div className="space-y-6 lg:col-span-2 order-2 lg:order-1">
          {/* 1. Recent Applications Table */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Recent Applications</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Your latest job applications</CardDescription>
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
                <div className="text-center py-6 text-xs sm:text-sm text-muted-foreground">
                  You haven't submitted any job applications yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-semibold">Job</TableHead>
                      <TableHead className="hidden md:table-cell text-xs font-semibold">
                        Company
                      </TableHead>
                      <TableHead className="hidden sm:table-cell text-xs font-semibold">
                        Applied Date
                      </TableHead>
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.slice(0, 5).map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <Link
                            href={`/candidate/jobs/${app.jobId}`}
                            className="font-semibold text-xs sm:text-sm text-foreground hover:text-primary transition-colors"
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
        </div>

        {/* Right Column (1/3 width on desktop, 1st on mobile so Upcoming Interviews appears at top) */}
        <div className="space-y-6 lg:col-span-1 order-1 lg:order-2">
          {/* 1. Upcoming & Recent Interviews */}
          <Card>
            <CardHeader className="pb-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Upcoming Interviews</CardTitle>
                <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                  {upcomingInterviews.length} {upcomingInterviews.length === 1 ? "interview" : "interviews"}
                </Badge>
              </div>

              {/* Backend Filter & Sort Dropdowns */}
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                <Select value={statusFilter} onValueChange={(val) => handleFilterChange(val, typeFilter, sortOrder)}>
                  <SelectTrigger className="h-7 text-[11px] px-2 bg-muted/30 border-border/60">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={(val) => handleFilterChange(statusFilter, val, sortOrder)}>
                  <SelectTrigger className="h-7 text-[11px] px-2 bg-muted/30 border-border/60">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Video Call">Video Call</SelectItem>
                    <SelectItem value="Onsite">Onsite</SelectItem>
                    <SelectItem value="Phone">Phone</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortOrder} onValueChange={(val) => handleFilterChange(statusFilter, typeFilter, val)}>
                  <SelectTrigger className="h-7 text-[11px] px-2 bg-muted/30 border-border/60">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {upcomingInterviews.length === 0 ? (
                <div className="text-center py-6 text-xs sm:text-sm text-muted-foreground">
                  No interviews found matching criteria.
                </div>
              ) : (
                <div className="max-h-[380px] overflow-y-auto pr-1 space-y-3 scrollbar-thin">
                  {upcomingInterviews.map((iv) => (
                    <div
                      key={iv.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-all",
                        iv.status === "Cancelled"
                          ? " border-red-200/60 dark:border-red-900/40"
                          : "bg-muted/20 border-border/50"
                      )}
                    >
                      <Avatar className="h-9 w-9 rounded-lg shrink-0 border border-border/40">
                        <AvatarImage src={iv.companyLogo} alt={iv.company} className="object-cover h-full w-full rounded-lg" />
                        <AvatarFallback className="rounded-lg text-xs font-semibold bg-primary/10 text-primary">
                          {iv.company ? iv.company.slice(0, 2).toUpperCase() : "CO"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{iv.jobTitle}</p>
                          {iv.status === "Cancelled" ? (
                            <Badge className="font-semibold text-[10px] px-1.5 py-0 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 shrink-0">
                              Cancelled
                            </Badge>
                          ) : iv.status === "Completed" ? (
                            <Badge className="font-semibold text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 shrink-0">
                              Completed
                            </Badge>
                          ) : (
                            <Badge className="font-semibold text-[10px] px-1.5 py-0 bg-primary/10 text-primary border border-primary/20 shrink-0">
                              Scheduled
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {iv.company} · {iv.round}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                          {formatDate(iv.date)} at {iv.time}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="font-medium text-[11px]">
                            {iv.format}
                          </Badge>
                          {iv.status !== "Cancelled" && iv.link && (
                            <a
                              href={iv.link.startsWith("http") ? iv.link : `https://${iv.link}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
                            >
                              <ExternalLink className="h-3.5 w-3.5" /> Join Meet
                            </a>
                          )}
                        </div>
                        {iv.notes && (
                          <p className="mt-2 text-xs text-muted-foreground bg-background/60 p-2 rounded border border-border/40">
                            {iv.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
