'use client';

import * as React from 'react';
import { User, Lock, Mail, Bell, Trash2, Eye, EyeOff, Loader2, CreditCard, Zap, Check, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/candidate/page-header';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearUser, setUser } from '@/store/slices/authSlice';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [profile, setProfile] = React.useState<any>(null);
  
  // Preferences state
  const [preferences, setPreferences] = React.useState({
    applicationReceived: true,
    candidateWithdrew: true,
    jobExpiring: true,
    companyUpdates: true,
    systemAlerts: true,
  });

  // Password Wizard states
  const [passwordStep, setPasswordStep] = React.useState(1);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [verificationToken, setVerificationToken] = React.useState('');
  const [verifyingPassword, setVerifyingPassword] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      // Fetch profile
      try {
        const res = await axiosInstance.get('/api/candidate');
        if (res.data?.success) setProfile(res.data.data);
      } catch (profileError) {
        // Silent catch if no candidate profile exists yet
      }

      // Load user preferences
      if (user?.preferences) {
        setPreferences({
          applicationReceived: user.preferences.applicationReceived ?? true,
          candidateWithdrew: user.preferences.candidateWithdrew ?? true,
          jobExpiring: user.preferences.jobExpiring ?? true,
          companyUpdates: user.preferences.companyUpdates ?? true,
          systemAlerts: user.preferences.systemAlerts ?? true,
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSettingsData();
  }, [user]);

  const handlePreferenceToggle = async (key: keyof typeof preferences, checked: boolean) => {
    const updatedPrefs = { ...preferences, [key]: checked };
    setPreferences(updatedPrefs);

    try {
      const res = await axiosInstance.put('/api/auth/preferences', { preferences: updatedPrefs });
      if (res.data?.success) {
        if (user) {
          dispatch(setUser({ ...user, preferences: updatedPrefs }));
        }
        toast.success('Notification preferences updated.');
      }
    } catch (err: any) {
      console.error('Preference update error:', err);
      toast.error('Failed to update preferences.');
    }
  };

  const handleVerifyCurrentPassword = async () => {
    if (!currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }

    try {
      setVerifyingPassword(true);
      const res = await axiosInstance.post('/api/auth/verify-password', {
        password: currentPassword,
      });

      if (res.data?.success && res.data?.verificationToken) {
        setVerificationToken(res.data.verificationToken);
        setPasswordStep(2);
        toast.success('Password verified. You may now enter a new password.');
      }
    } catch (err: any) {
      console.error('Verify password error:', err);
      toast.error(err.response?.data?.message || 'Verification failed. Incorrect password.');
    } finally {
      setVerifyingPassword(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please enter both password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    try {
      setVerifyingPassword(true);
      const res = await axiosInstance.post('/api/auth/update-password', {
        token: verificationToken,
        password: newPassword,
      });

      if (res.data?.success) {
        toast.success('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setVerificationToken('');
        setPasswordStep(1);
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setVerifyingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await axiosInstance.delete('/api/auth/delete-account');
      if (res.data?.success) {
        dispatch(clearUser());
        toast.success('Account permanently deleted.');
        router.push('/login');
      }
    } catch (err: any) {
      console.error('Delete account error:', err);
      toast.error('Failed to delete account.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-20 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account and preferences" />

      <Tabs defaultValue="account">
        <TabsList className="flex-wrap">
          <TabsTrigger value="account" className="gap-1.5"><User className="h-4 w-4" />Account</TabsTrigger>
          <TabsTrigger value="password" className="gap-1.5"><Lock className="h-4 w-4" />Password</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5"><Bell className="h-4 w-4" />Notifications</TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5"><CreditCard className="h-4 w-4" />Subscription & Billing</TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Account Information</CardTitle>
              <CardDescription>Your basic account registration details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="settings-name">Full Name</Label>
                <Input id="settings-name" value={profile?.fullName || user?.name || ''} disabled className="bg-muted text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-email">Email</Label>
                <Input id="settings-email" type="email" value={user?.email || ''} disabled className="bg-muted text-muted-foreground" />
              </div>
              {profile?.phone && (
                <div className="space-y-2">
                  <Label htmlFor="settings-phone">Phone</Label>
                  <Input id="settings-phone" value={profile.phone} disabled className="bg-muted text-muted-foreground" />
                </div>
              )}
              {profile?.location && (
                <div className="space-y-2">
                  <Label htmlFor="settings-loc">Location</Label>
                  <Input id="settings-loc" value={profile.location} disabled className="bg-muted text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-base text-destructive font-semibold">Delete Account</CardTitle>
              <CardDescription>Permanently delete your account and all associated applications or details</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action is permanent and cannot be undone. All your applications, resume, and profile data will be permanently purged from Nuvora.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete Forever
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Change Password Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Change Password</CardTitle>
              <CardDescription>Protect your candidate profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordStep === 1 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-pw">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-pw"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-10 w-10"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleVerifyCurrentPassword} disabled={verifyingPassword}>
                    {verifyingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Verify Password
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-pw">New Password</Label>
                    <Input
                      id="new-pw"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-pw">Confirm New Password</Label>
                    <Input
                      id="confirm-pw"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleChangePassword} disabled={verifyingPassword}>
                      {verifyingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Update Password
                    </Button>
                    <Button variant="outline" onClick={() => { setPasswordStep(1); setCurrentPassword(''); }}>
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Preference Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Notification Preferences</CardTitle>
              <CardDescription>Control your in-app and email updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                { key: 'applicationReceived', label: 'Application Updates', desc: 'Alerts for status changes on submitted applications' },
                { key: 'jobExpiring', label: 'Job Alerts', desc: 'Alerts when new matching jobs are published or expiring' },
                { key: 'companyUpdates', label: 'Company Updates', desc: 'News and job lists from subscribed employers' },
              ].map((item, idx) => (
                <div key={item.key}>
                  {idx > 0 && <Separator />}
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={preferences[item.key as keyof typeof preferences] ?? true}
                      onCheckedChange={(checked) => handlePreferenceToggle(item.key as keyof typeof preferences, checked)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Subscription & Plan Billing</CardTitle>
                  <CardDescription>View your candidate subscription plan and features</CardDescription>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  user?.subscriptionPlan === "pro"
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                    : "bg-muted text-muted-foreground border border-border"
                }`}>
                  {user?.subscriptionPlan === "pro" ? "Pro Plan Active" : "Free Plan Tier"}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Plan Summary */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Zap className="h-6 w-6 text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {user?.subscriptionPlan === "pro" ? "Candidate Pro Plan" : "Free Candidate Plan"}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {user?.subscriptionPlan === "pro"
                        ? "Unlimited company subscriptions & instant n8n alerts enabled"
                        : "Limited to 10 company subscriptions"}
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" className="gap-1.5 shrink-0">
                  <Link href="/candidate/pricing">
                    <ShieldCheck className="h-4 w-4" />
                    {user?.subscriptionPlan === "pro" ? "Manage Plan" : "Upgrade to Candidate Pro"}
                  </Link>
                </Button>
              </div>

              {/* Plan Limits & Features */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Candidate Plan Inclusions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-lg border border-border bg-muted/20 flex items-center gap-3">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div className="text-xs font-medium">
                      <span>Company Subscriptions: </span>
                      <strong className="text-foreground">{user?.subscriptionPlan === "pro" ? "Unlimited" : "Max 10 Companies"}</strong>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-lg border border-border bg-muted/20 flex items-center gap-3">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div className="text-xs font-medium">
                      <span>Instant Job Alerts: </span>
                      <strong className="text-foreground">{user?.subscriptionPlan === "pro" ? "Instant via n8n" : "Standard Email"}</strong>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-lg border border-border bg-muted/20 flex items-center gap-3">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div className="text-xs font-medium">
                      <span>Priority Status Updates: </span>
                      <strong className="text-foreground">Enabled</strong>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-lg border border-border bg-muted/20 flex items-center gap-3">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div className="text-xs font-medium">
                      <span>Verified Candidate Badge: </span>
                      <strong className="text-foreground">{user?.subscriptionPlan === "pro" ? "Pro Badge Active" : "Standard Profile"}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
