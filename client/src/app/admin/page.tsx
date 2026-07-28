'use client';

import * as React from 'react';
import Link from 'next/link';
import { Users, Building2, Briefcase, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { StatCard } from '@/components/admin/stat-card';
import { PageHeader } from '@/components/admin/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge, statusTone } from '@/components/admin/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axiosInstance from '@/lib/axios';

const fmt = (n: number) => n.toLocaleString('en-US');

function SectionLink({ href, label }: { href: string; label: string }) {
  return (
    <Button variant="ghost" size="sm" asChild>
      <Link href={href}>
        {label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalJobs: 0,
    totalApplications: 0,
  });
  const [recentJobs, setRecentJobs] = React.useState<any[]>([]);
  const [recentCompanies, setRecentCompanies] = React.useState<any[]>([]);
  const [recentUsers, setRecentUsers] = React.useState<any[]>([]);
  const [chartData, setChartData] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, companiesRes, jobsRes] = await Promise.all([
          axiosInstance.get('/api/admin/dashboard'),
          axiosInstance.get('/api/admin/users'),
          axiosInstance.get('/api/admin/companies'),
          axiosInstance.get('/api/admin/jobs'),
        ]);

        if (statsRes.data?.success) {
          setStats(statsRes.data.data);
          setChartData(statsRes.data.data.chartData || []);
        }

        if (usersRes.data?.success) {
          const sortedUsers = [...usersRes.data.data]
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
          setRecentUsers(sortedUsers);
        }

        if (companiesRes.data?.success) {
          const sortedCompanies = [...companiesRes.data.data]
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
          setRecentCompanies(sortedCompanies);
        }

        if (jobsRes.data?.success) {
          const sortedJobs = [...jobsRes.data.data]
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
          setRecentJobs(sortedJobs);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Platform overview — users, companies, and jobs."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Dashboard' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Users" value={fmt(stats.totalUsers)} icon={Users} tone="blue" />
        <StatCard label="Total Companies" value={fmt(stats.totalCompanies)} icon={Building2} tone="emerald" />
        <StatCard label="Total Jobs" value={fmt(stats.totalJobs)} icon={Briefcase} tone="amber" />
      </div>

      {/* Performance Analytics Graphs */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 bg-background/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base font-semibold">User & Company Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                <Bar name="Users" dataKey="Users" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar name="Companies" dataKey="Companies" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-background/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Jobs Posted Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ left: -16, right: 8 }}>
                <defs>
                  <linearGradient id="colorJobsAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Area
                  name="Jobs Posted"
                  type="monotone"
                  dataKey="Jobs"
                  stroke="hsl(var(--chart-3))"
                  fillOpacity={1}
                  fill="url(#colorJobsAdmin)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
