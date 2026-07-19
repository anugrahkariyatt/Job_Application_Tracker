"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusChip } from "@/lib/status";
import { JobCard } from "@/components/shared/JobCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  FileEdit,
  Users,
  User,
  UserPlus,
  CalendarCheck,
  Award,
  PlusCircle,
  Building2,
  ArrowRight,
  TrendingUp,
  Activity,
  Bell,
  Loader2,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import { useAppSelector } from "@/store/hooks";

const iconMap: Record<string, LucideIcon> = {
  UserPlus,
  CalendarCheck,
  Briefcase,
  UserCheck: Award,
  Award,
};

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

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-12" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-12" />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
        <h2 className="text-2xl font-bold tracking-tight">Setup Your Company</h2>
        <p className="text-muted-foreground text-sm">
          Welcome {user?.name}! Before accessing your recruiter dashboard, you need to set up a company profile so candidates can see who they are applying to.
        </p>
        <Link
          href="/recruiter/company/edit"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 font-medium text-primary-foreground hover:bg-primary-hover shadow-lg"
        >
          Create Company Profile
        </Link>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center space-y-3 max-w-md mx-auto">
        <p className="text-destructive font-medium">{errorMsg}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
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
    jobsOverTime,
    viewsVsApplications,
  } = data || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.name || "Recruiter"}. Here's what's happening at ${company?.name || "your company"}.`}
        breadcrumbs={[{ label: 'Dashboard', href: '/recruiter/dashboard' }, { label: 'Dashboard' }]}
        icon={TrendingUp}
        actions={
          <Link
            href="/recruiter/jobs/new"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            <PlusCircle className="h-4 w-4" />
            Post a Job
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Active Jobs"
          value={stats?.activeJobs || 0}
          delta={stats?.activeJobsDelta}
          icon={Briefcase}
        />
        <StatCard
          label="Draft Jobs"
          value={stats?.draftJobs || 0}
          delta={stats?.draftJobsDelta}
          icon={FileEdit}
          iconClassName="bg-muted text-muted-foreground"
        />
        <StatCard
          label="Total Applications"
          value={stats?.totalApplications || 0}
          delta={stats?.totalApplicationsDelta}
          icon={Users}
        />
        <StatCard
          label="New Applications"
          value={stats?.newApplications || 0}
          delta={stats?.newApplicationsDelta}
          icon={UserPlus}
        />
        <StatCard
          label="Interviews"
          value={stats?.interviewsScheduled || 0}
          delta={stats?.interviewsScheduledDelta}
          icon={CalendarCheck}
        />
        <StatCard
          label="Hired"
          value={stats?.hiredCandidates || 0}
          delta={stats?.hiredCandidatesDelta}
          icon={Award}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column: Job feed + analytics */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Briefcase className="h-4.5 w-4.5 text-primary" />
                Recent Job Postings
              </CardTitle>
              <Link
                href="/recruiter/jobs"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View all jobs <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {recentJobs && recentJobs.length > 0 ? (
                recentJobs.map((job: any) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    showStats={true}
                    companyLogo={company?.logo}
                    companyName={company?.name}
                  />
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center py-8 text-center text-muted-foreground text-sm">
                  <p>No job postings yet.</p>
                  <Link href="/recruiter/jobs/new" className="text-primary hover:underline font-medium mt-1">
                    Post your first job now!
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Activity className="h-4.5 w-4.5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentApplications && recentApplications.length > 0 ? (
                recentApplications.map((app: any) => (
                  <div key={app.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        New application from <span className="font-semibold">{app.name}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Applied for {app.jobTitle}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground/70">
                        {app.appliedDate}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No recent candidate activity yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Bell className="h-4.5 w-4.5 text-primary" />
                Notifications
              </CardTitle>
              <Link
                href="/recruiter/notifications"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-1">
              {recentNotifications && recentNotifications.length > 0 ? (
                recentNotifications.map((n: any) => (
                  <div
                    key={n.id || n._id}
                    className="flex items-start gap-3 rounded-md p-2.5 hover:bg-accent transition-colors"
                  >
                    <div
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? "bg-muted-foreground/30" : "bg-primary"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No notifications yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Applications per Job
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applicationsPerJob && applicationsPerJob.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={applicationsPerJob}
                  margin={{ left: -16, right: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    tickLine={false}
                    axisLine={false}
                    angle={-15}
                    height={50}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: "hsl(var(--muted-foreground))",
                    }}
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
                  <Bar
                    dataKey="applications"
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[240px] flex-col items-center justify-center text-center p-4">
                <p className="text-sm text-muted-foreground">No applications statistics yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusDistribution && statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
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
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[240px] flex-col items-center justify-center text-center p-4">
                <p className="text-sm text-muted-foreground">No applications received yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Jobs Posted Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart
                data={jobsOverTime}
                margin={{ left: -16, right: 8 }}
              >
                <defs>
                  <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 10,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: "hsl(var(--muted-foreground))",
                  }}
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
                <Area
                  type="monotone"
                  dataKey="jobs"
                  stroke="hsl(var(--chart-1))"
                  fillOpacity={1}
                  fill="url(#colorJobs)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Views vs Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart
                data={viewsVsApplications}
                margin={{ left: -16, right: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 10,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: "hsl(var(--muted-foreground))",
                  }}
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
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px" }}
                />
                <Bar
                  dataKey="views"
                  fill="hsl(var(--chart-4))"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                  name="Views"
                />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Applications"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Users className="h-4.5 w-4.5 text-primary" />
            Recent Applications
          </CardTitle>
          <Link
            href="/recruiter/applicants"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all applicants <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentApplications && recentApplications.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentApplications.map((app: any) => (
                <Link
                  key={app.id}
                  href={`/applicants/${app.id}`}
                  className="job-card-hover rounded-lg border border-border bg-card p-4 block"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative h-12 w-12 shrink-0">
                      {app.photo ? (
                        <Image
                          src={app.photo}
                          alt={app.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-border"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center ring-2 ring-border text-muted-foreground font-semibold">
                          {app.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-foreground">
                        {app.name}
                      </h3>
                      <p className="truncate text-xs text-muted-foreground">
                        {app.headline}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        Applied for:{" "}
                        <span className="font-medium text-foreground">
                          {app.jobTitle}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
                    <span className="text-xs text-muted-foreground">
                      {app.appliedDate}
                    </span>
                    <StatusChip status={app.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No job applications have been submitted to your company yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
