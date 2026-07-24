"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusChip } from "@/lib/status";
import { JobCard } from "@/components/shared/JobCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Briefcase,
  Users,
  User,
  CalendarCheck,
  Award,
  PlusCircle,
  Building2,
  ArrowRight,
  TrendingUp,
  Activity,
  Bell,
  Video,
  ExternalLink,
  Clock,
} from "lucide-react";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import { useAppSelector } from "@/store/hooks";

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/company/dashboard-stats");
        if (response.data?.success) {
          setData(response.data.data);
        }
      } catch (error: any) {
        console.error("Error loading dashboard data:", error);
        if (error.response?.status === 404) {
          setErrorMsg("Company Profile Not Found");
        } else {
          setErrorMsg("Failed to load dashboard data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-12" />
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-6 space-y-4">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-48 w-full" />
          </Card>
          <Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-48 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (errorMsg === "Company Profile Not Found") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
        <div className="rounded-full bg-primary/10 p-4 text-primary">
          <Building2 className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight">Setup Your Company Profile</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Welcome <span className="font-semibold text-foreground">{user?.name}</span>! Set up your company profile to start posting jobs and reviewing candidate applications.
        </p>
        <Button asChild size="lg" className="font-bold">
          <Link href="/recruiter/company/edit">
            Create Company Profile
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center space-y-3 max-w-md mx-auto">
        <p className="text-destructive font-medium text-sm">{errorMsg}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry Loading
        </Button>
      </div>
    );
  }

  const {
    company,
    stats,
    applicationsPerJob,
    statusDistribution,
    recentApplications,
    recentNotifications,
    recentJobs,
    upcomingInterviews,
  } = data || {};

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <PageHeader
        title="Recruiter Dashboard"
        description={`Welcome back, ${user?.name || "Recruiter"}. Managing hiring pipeline for ${company?.name || "your company"}.`}
        breadcrumbs={[{ label: "Dashboard" }]}
        icon={TrendingUp}
        actions={
          <Button asChild className="font-bold gap-2 shadow-md">
            <Link href="/recruiter/jobs/new">
              <PlusCircle className="h-4 w-4" />
              Post New Job
            </Link>
          </Button>
        }
      />

      {/* Streamlined Stat Metric Summary Bar (4 High-Value Cards) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Job Openings"
          value={stats?.activeJobs || 0}
          delta={stats?.activeJobsDelta}
          icon={Briefcase}
        />
        <StatCard
          label="Total Candidate Applications"
          value={stats?.totalApplications || 0}
          delta={stats?.totalApplicationsDelta}
          icon={Users}
        />
        <StatCard
          label="Interviews Scheduled"
          value={stats?.interviewsScheduled || 0}
          delta={stats?.interviewsScheduledDelta}
          icon={CalendarCheck}
        />
        <StatCard
          label="Candidates Hired"
          value={stats?.hiredCandidates || 0}
          delta={stats?.hiredCandidatesDelta}
          icon={Award}
        />
      </div>

      {/* Main Split Layout: Left (2/3) & Right (1/3) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2/3 width) */}
        <div className="space-y-6 lg:col-span-2">
          {/* 1. Recent Applicants Table */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-primary" />
                  Recent Applicants
                </CardTitle>
                <CardDescription className="text-xs">
                  Latest candidate submissions for your open positions
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary hover:text-primary/80" asChild>
                <Link href="/recruiter/applicants">
                  View All
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentApplications && recentApplications.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {recentApplications.slice(0, 4).map((app: any) => (
                    <Link
                      key={app.id}
                      href={`/recruiter/applicants/${app.id}`}
                      className="rounded-xl border border-border/60 bg-card p-4 block hover:border-primary/40 transition-all shadow-xs"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 shrink-0 border border-border/50">
                          <AvatarImage src={app.photo} alt={app.name} />
                          <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                            {app.name ? app.name.charAt(0).toUpperCase() : "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-xs font-bold text-foreground">
                            {app.name}
                          </h4>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {app.headline || "Candidate Profile"}
                          </p>
                          <p className="mt-1 truncate text-[11px] text-muted-foreground">
                            Applied: <span className="font-semibold text-foreground">{app.jobTitle}</span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5">
                        <span className="text-[11px] text-muted-foreground">
                          {app.appliedDate}
                        </span>
                        <StatusChip status={app.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No job applications have been submitted to your company yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Active Job Postings */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Briefcase className="h-4.5 w-4.5 text-primary" />
                  Active Job Postings
                </CardTitle>
                <CardDescription className="text-xs">
                  Your open job listings & applicant pipelines
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary hover:text-primary/80" asChild>
                <Link href="/recruiter/jobs">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentJobs && recentJobs.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {recentJobs.slice(0, 4).map((job: any) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      showStats={true}
                      companyLogo={company?.logo}
                      companyName={company?.name}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground text-xs space-y-2">
                  <p>No active job postings found.</p>
                  <Button size="sm" asChild>
                    <Link href="/recruiter/jobs/new">Post First Job</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Applications per Job Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Applications Distribution per Job</CardTitle>
            </CardHeader>
            <CardContent>
              {applicationsPerJob && applicationsPerJob.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={applicationsPerJob} margin={{ left: -16, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="applications" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[180px] items-center justify-center text-xs text-muted-foreground">
                  No job applicant distribution statistics available yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6 lg:col-span-1">
          {/* 1. Upcoming Scheduled Interviews (Top Priority) */}
          <Card className="border-primary/20 bg-gradient-to-b from-primary/5 via-card to-card">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CalendarCheck className="h-4.5 w-4.5 text-primary" />
                  Upcoming Interviews
                </CardTitle>
                <CardDescription className="text-xs">
                  Scheduled candidate video rounds & meetings
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingInterviews && upcomingInterviews.length > 0 ? (
                upcomingInterviews.map((iv: any) => {
                  const dateObj = new Date(iv.date);
                  const formattedTime = dateObj.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const formattedDate = dateObj.toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <div
                      key={iv.id}
                      className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-card hover:border-primary/40 transition-all shadow-xs"
                    >
                      <Avatar className="h-9 w-9 shrink-0 border border-border/50 rounded-lg">
                        <AvatarImage src={iv.candidatePhoto} alt={iv.candidateName} className="rounded-lg object-cover" />
                        <AvatarFallback className="rounded-lg text-xs font-bold bg-primary/10 text-primary">
                          {iv.candidateName ? iv.candidateName.slice(0, 2).toUpperCase() : "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-foreground truncate">
                            {iv.candidateName}
                          </p>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {iv.type || "Video"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {iv.title} • <span className="font-medium text-foreground">{iv.jobTitle}</span>
                        </p>
                        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-border/40">
                          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3 text-primary" />
                            {formattedDate}, {formattedTime}
                          </span>
                          {iv.link && (
                            <a
                              href={iv.link.startsWith("http") ? iv.link : `https://${iv.link}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                            >
                              <Video className="h-3 w-3" /> Join Call <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No upcoming interviews scheduled yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Candidate Pipeline Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Candidate Pipeline Status</CardTitle>
            </CardHeader>
            <CardContent>
              {statusDistribution && statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                    >
                      {statusDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[180px] items-center justify-center text-xs text-muted-foreground">
                  No applicant status pipeline data yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Notifications & Alerts */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Bell className="h-4.5 w-4.5 text-primary" />
                Notifications
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary hover:text-primary/80" asChild>
                <Link href="/recruiter/notifications">All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentNotifications && recentNotifications.length > 0 ? (
                recentNotifications.slice(0, 5).map((n: any) => (
                  <div
                    key={n.id || n._id}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        n.isRead ? "bg-muted-foreground/30" : "bg-primary"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground leading-snug">
                        {n.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No notifications yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
