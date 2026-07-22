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
                <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold">Recent Jobs</CardTitle>
          <SectionLink href="/admin/jobs" label="View all" />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Applications</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">
                    No jobs found
                  </TableCell>
                </TableRow>
              ) : (
                recentJobs.map((j) => {
                  const statusLabel = j.status === 'Open' ? 'Active' : 'Closed';
                  return (
                    <TableRow key={j._id}>
                      <TableCell className="text-sm font-medium">
                        {j.title}
                      </TableCell>
                      <TableCell className="text-sm">
                        {j.companyId?.companyName || 'Deleted Company'}
                      </TableCell>
                      <TableCell className="text-sm">{j.employmentType}</TableCell>
                      <TableCell>
                        <StatusBadge tone={statusTone(statusLabel)}>{statusLabel}</StatusBadge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {j.applicationsCount || 0}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold">Recent Companies</CardTitle>
          <SectionLink href="/admin/companies" label="View all" />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Jobs Posted</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">
                    No companies found
                  </TableCell>
                </TableRow>
              ) : (
                recentCompanies.map((c) => {
                  const statusLabel = c.isActive ? 'Active' : 'Disabled';
                  return (
                    <TableRow key={c._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold text-white bg-blue-600">
                            {c.companyName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{c.companyName}</span>
                            <span className="text-xs text-muted-foreground">{c.website || 'N/A'}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{c.industry}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.location || 'N/A'}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{c.jobsPosted || 0}</TableCell>
                      <TableCell>
                        <StatusBadge tone={statusTone(statusLabel)}>{statusLabel}</StatusBadge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold">Recent Users</CardTitle>
          <SectionLink href="/admin/users" label="View all" />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                recentUsers.map((u) => {
                  const statusLabel = u.isActive ? 'Active' : 'Disabled';
                  const initials = u.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                  const joinedDate = new Date(u.createdAt).toLocaleDateString();
                  const roleLabel = u.role.charAt(0).toUpperCase() + u.role.slice(1);
                  return (
                    <TableRow key={u._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{u.name}</span>
                            <span className="text-xs text-muted-foreground">{u.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{roleLabel}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{joinedDate}</TableCell>
                      <TableCell>
                        <StatusBadge tone={statusTone(statusLabel)}>{statusLabel}</StatusBadge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
