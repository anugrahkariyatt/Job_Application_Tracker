'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Bell,
  Building2,
  AlertTriangle,
  Save,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setUser, clearUser } from '@/store/slices/authSlice';
import axiosInstance from '@/lib/axios';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [passwordVerifying, setPasswordVerifying] = useState(false);

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    applicationReceived: true,
    candidateWithdrew: true,
    jobExpiring: true,
    companyUpdates: false,
    systemAlerts: true,
  });

  // Company default preferences
  const [companyPrefs, setCompanyPrefs] = useState({
    defaultEmploymentType: 'Full-time',
    defaultWorkMode: 'Remote',
    defaultCurrency: 'USD',
    defaultDeadlineDays: '30',
  });

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/company');
        if (response.data?.success) {
          setCompany(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching company details for settings:', err);
      } finally {
        setLoading(false);
      }
    };

    const savedCompanyPrefs = localStorage.getItem('recruiter_company_prefs');
    if (savedCompanyPrefs) {
      try {
        setCompanyPrefs(JSON.parse(savedCompanyPrefs));
      } catch (e) {
        console.error(e);
      }
    }

    fetchCompanyData();
  }, []);

  useEffect(() => {
    if (user?.preferences) {
      setNotifPrefs({
        applicationReceived: user.preferences.applicationReceived ?? true,
        candidateWithdrew: user.preferences.candidateWithdrew ?? true,
        jobExpiring: user.preferences.jobExpiring ?? true,
        companyUpdates: user.preferences.companyUpdates ?? false,
        systemAlerts: user.preferences.systemAlerts ?? true,
      });
    }
  }, [user?.preferences]);

  const handleNotifToggle = (key: keyof typeof notifPrefs) => {
    setNotifPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCompanyPrefChange = (field: string, value: string) => {
    setCompanyPrefs((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePreferences = async (section: string) => {
    if (section === 'Company') {
      localStorage.setItem('recruiter_company_prefs', JSON.stringify(companyPrefs));
      toast.success('Company defaults saved successfully.');
    } else if (section === 'Notification') {
      try {
        const response = await axiosInstance.put('/api/auth/preferences', {
          preferences: notifPrefs,
        });
        if (response.data?.success) {
          if (user) {
            dispatch(setUser({
              ...user,
              preferences: response.data.preferences,
            }));
          }
          toast.success('Notification preferences saved to profile.');
        }
      } catch (err: any) {
        console.error('Failed to save preferences:', err);
        toast.error(err.response?.data?.message || 'Failed to save preferences.');
      }
    }
  };

  const handleVerifyPassword = async () => {
    if (!currentPassword) {
      toast.error('Current password is required.');
      return;
    }

    try {
      setPasswordVerifying(true);
      const verifyResponse = await axiosInstance.post('/api/auth/verify-password', {
        password: currentPassword,
      });

      if (verifyResponse.data?.success && verifyResponse.data?.verificationToken) {
        setVerificationToken(verifyResponse.data.verificationToken);
        setCurrentPassword('');
        toast.success('Identity verified! You can now set a new password.');
      } else {
        toast.error('Failed to verify password.');
      }
    } catch (err: any) {
      console.error('Password verification error:', err);
      toast.error(err.response?.data?.message || 'Invalid current password.');
    } finally {
      setPasswordVerifying(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!verificationToken) {
      toast.error('Identity not verified. Please verify your current password first.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error('All new password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    try {
      setPasswordUpdating(true);
      const updateResponse = await axiosInstance.post('/api/auth/update-password', {
        password: newPassword,
        token: verificationToken,
      });

      if (updateResponse.data?.success) {
        toast.success('Password updated successfully!');
        setVerificationToken(null);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(updateResponse.data?.message || 'Failed to update password.');
      }
    } catch (err: any) {
      console.error('Password update error:', err);
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPasswordUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account, notifications, and company preferences."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]}
        icon={SettingsIcon}
      />

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-2 sm:flex sm:w-auto">
          <TabsTrigger value="profile" className="gap-1.5">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="gap-1.5">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Password</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-1.5">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Company Defaults</span>
          </TabsTrigger>
          <TabsTrigger value="danger" className="gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Danger Zone</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                {company?.logo ? (
                  <img
                    src={company.logo}
                    alt="Avatar"
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-lg ring-2 ring-border">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold">{user?.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Managed through company logo branding.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block">Full Name</Label>
                  <Input value={user?.name || ''} readOnly className="bg-muted/30" />
                </div>
                <div>
                  <Label className="mb-1.5 block">Email Address</Label>
                  <Input type="email" value={user?.email || ''} readOnly className="bg-muted/30" />
                </div>
                <div>
                  <Label className="mb-1.5 block">User Role</Label>
                  <Input value={user?.role?.toUpperCase() || ''} readOnly className="bg-muted/30" />
                </div>
                {company && (
                  <div>
                    <Label className="mb-1.5 block">Company Association</Label>
                    <Input value={company.companyName} readOnly className="bg-muted/30" />
                  </div>
                )}
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-primary">
                Account identifiers (Name and Email) are locked. To edit your public-facing recruiter details or logo, please update your company profile.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!verificationToken ? (
                <>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-primary mb-2">
                    To change your password, you must first verify your current password.
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Current Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={passwordVerifying}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleVerifyPassword} disabled={passwordVerifying}>
                      {passwordVerifying ? (
                        <>
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-1.5 h-4 w-4" />
                          Verify Password
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-lg border border-success/20 bg-success/5 p-4 text-xs text-success mb-2 flex items-center justify-between">
                    <span>Identity verified. Enter your new password details below.</span>
                    <button
                      onClick={() => setVerificationToken(null)}
                      className="text-primary hover:underline font-semibold text-xs"
                    >
                      Reset Verification
                    </button>
                  </div>
                  <div>
                    <Label className="mb-1.5 block">New Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={passwordUpdating}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Confirm New Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={passwordUpdating}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handlePasswordUpdate} disabled={passwordUpdating}>
                      {passwordUpdating ? (
                        <>
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-1.5 h-4 w-4" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                {
                  key: 'applicationReceived' as const,
                  label: 'Application Received',
                  desc: 'Get notified when a candidate applies to your job.',
                },
                {
                  key: 'candidateWithdrew' as const,
                  label: 'Candidate Withdrew',
                  desc: 'Get notified when a candidate withdraws their application.',
                },
                {
                  key: 'jobExpiring' as const,
                  label: 'Job Expiring Soon',
                  desc: 'Get notified when a job posting is about to expire.',
                },
                {
                  key: 'companyUpdates' as const,
                  label: 'Company Updates',
                  desc: 'Receive product updates and company news.',
                },
                {
                  key: 'systemAlerts' as const,
                  label: 'System Alerts',
                  desc: 'Important system and maintenance notifications.',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 py-3 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifPrefs[item.key]}
                    onCheckedChange={() => handleNotifToggle(item.key)}
                  />
                </div>
              ))}
              <div className="flex justify-end pt-3">
                <Button onClick={() => handleSavePreferences('Notification')}>
                  <Save className="mr-1.5 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Company Preference Defaults</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block">Default Employment Type</Label>
                  <Input
                    value={companyPrefs.defaultEmploymentType}
                    onChange={(e) =>
                      handleCompanyPrefChange('defaultEmploymentType', e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block">Default Work Mode</Label>
                  <Input
                    value={companyPrefs.defaultWorkMode}
                    onChange={(e) => handleCompanyPrefChange('defaultWorkMode', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block">Default Currency</Label>
                  <Input
                    value={companyPrefs.defaultCurrency}
                    onChange={(e) => handleCompanyPrefChange('defaultCurrency', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block">Default Application Deadline (days)</Label>
                  <Input
                    type="number"
                    value={companyPrefs.defaultDeadlineDays}
                    onChange={(e) => handleCompanyPrefChange('defaultDeadlineDays', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSavePreferences('Company')}>
                  <Save className="mr-1.5 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="mt-4">
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Deactivate Account</p>
                  <p className="text-xs text-muted-foreground">
                    Temporarily disable your account. You can reactivate later.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Deactivate
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deactivate account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your account will be disabled and you will be signed out. You can reactivate
                        by signing in again.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          try {
                            const response = await axiosInstance.post('/api/auth/deactivate');
                            if (response.data?.success) {
                              toast.success('Account deactivated successfully.');
                              dispatch(clearUser());
                              setTimeout(() => {
                                window.location.href = '/login';
                              }, 1000);
                            }
                          } catch (err: any) {
                            console.error('Failed to deactivate account:', err);
                            toast.error(err.response?.data?.message || 'Failed to deactivate account.');
                          }
                        }}
                      >
                        Deactivate
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-destructive">Delete Account</p>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your account and all associated data. This cannot be undone.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and
                        remove all data associated with it.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          try {
                            const response = await axiosInstance.delete('/api/auth/delete-account');
                            if (response.data?.success) {
                              toast.success('Account deleted permanently.');
                              dispatch(clearUser());
                              setTimeout(() => {
                                window.location.href = '/login';
                              }, 1000);
                            }
                          } catch (err: any) {
                            console.error('Failed to delete account:', err);
                            toast.error(err.response?.data?.message || 'Failed to delete account.');
                          }
                        }}
                      >
                        Delete Forever
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
