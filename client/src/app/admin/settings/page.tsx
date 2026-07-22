'use client';

import { useState, useEffect } from 'react';
import { Save, KeyRound, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageHeader } from '@/components/admin/page-header';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(3, 'Full name must be at least 3 characters.').max(50),
  email: z.string().email('Invalid email address.'),
  platformName: z.string().min(2, 'Platform name must be at least 2 characters.').max(50),
  supportEmail: z.string().email('Invalid support email address.'),
});

const passwordVerifySchema = z.object({
  currentPassword: z.string().min(8, 'Password must be at least 8 characters.'),
});

const passwordUpdateSchema = z.object({
  newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters.'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

export default function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [name, setName] = useState('Admin User');
  const [email, setEmail] = useState('admin@technocareers.com');
  const [platformName, setPlatformName] = useState('Techno Careers');
  const [supportEmail, setSupportEmail] = useState('support@technocareers.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordStep, setPasswordStep] = useState(1);
  const [verificationToken, setVerificationToken] = useState('');

  // Form errors states
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Load platform details from backend settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axiosInstance.get('/api/settings');
        if (res.data?.success && res.data.data) {
          setPlatformName(res.data.data.platformName);
          setSupportEmail(res.data.data.supportEmail);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveProfile = async () => {
    setProfileErrors({});
    const validation = profileSchema.safeParse({
      name,
      email,
      platformName,
      supportEmail,
    });

    if (!validation.success) {
      const errorsMap: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errorsMap[err.path[0]] = err.message;
        }
      });
      setProfileErrors(errorsMap);
      toast.error('Please correct the errors in the profile form.');
      return;
    }

    try {
      setSavingProfile(true);
      
      // Save profile details to DB
      const profilePromise = axiosInstance.put('/api/auth/profile', { name, email });
      
      // Save platform details to DB
      const settingsPromise = axiosInstance.put('/api/settings', {
        platformName,
        supportEmail,
      });

      const [profileRes, settingsRes] = await Promise.all([profilePromise, settingsPromise]);

      if (profileRes.data?.success && settingsRes.data?.success) {
        if (user) {
          dispatch(setUser({ ...user, name, email }));
        }
        
        // Also sync local storage for offline or legacy components
        localStorage.setItem('platform_name', platformName);
        localStorage.setItem('platform_support_email', supportEmail);
        
        toast.success('Admin profile and platform settings saved successfully.');
      }
    } catch (err: any) {
      console.error('Error saving profile or settings:', err);
      toast.error(err.response?.data?.message || 'Failed to save admin configurations.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleVerifyCurrentPassword = async () => {
    setPasswordErrors({});
    const validation = passwordVerifySchema.safeParse({ currentPassword });

    if (!validation.success) {
      const errorsMap: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errorsMap[err.path[0]] = err.message;
        }
      });
      setPasswordErrors(errorsMap);
      return;
    }

    try {
      setUpdatingPassword(true);
      const verifyRes = await axiosInstance.post('/api/auth/verify-password', {
        password: currentPassword,
      });

      if (verifyRes.data?.success && verifyRes.data?.verificationToken) {
        setVerificationToken(verifyRes.data.verificationToken);
        setPasswordStep(2);
        toast.success('Identity verified! You can now set a new password.');
      } else {
        toast.error('Failed to verify password.');
      }
    } catch (err: any) {
      console.error('Password verification error:', err);
      toast.error(err.response?.data?.message || 'Invalid current password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordErrors({});
    const validation = passwordUpdateSchema.safeParse({ newPassword, confirmPassword });

    if (!validation.success) {
      const errorsMap: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errorsMap[err.path[0]] = err.message;
        }
      });
      setPasswordErrors(errorsMap);
      return;
    }

    try {
      setUpdatingPassword(true);
      
      const res = await axiosInstance.post('/api/auth/update-password', {
        token: verificationToken,
        password: newPassword,
      });

      if (res.data?.success) {
        toast.success('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setVerificationToken('');
        setPasswordStep(1);
      }
    } catch (err: any) {
      console.error('Password change error:', err);
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your admin profile, password and platform details."
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Settings' }]}
        actions={
          <Button onClick={handleSaveProfile} disabled={savingProfile}>
            <Save className="h-4 w-4" />
            {savingProfile ? 'Saving...' : 'Save changes'}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Admin Profile</CardTitle>
          <CardDescription>Your administrator account information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{name}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Full name</Label>
              <Input
                id="admin-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (profileErrors.name) setProfileErrors((prev) => ({ ...prev, name: '' }));
                }}
              />
              {profileErrors.name && (
                <p className="text-xs text-red-500 font-medium mt-1">{profileErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (profileErrors.email) setProfileErrors((prev) => ({ ...prev, email: '' }));
                }}
              />
              {profileErrors.email && (
                <p className="text-xs text-red-500 font-medium mt-1">{profileErrors.email}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <KeyRound className="h-4 w-4" />
            Change Password
          </CardTitle>
          <CardDescription>Update your administrator password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {passwordStep === 1 ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-primary mb-2">
                To change your password, you must first verify your current password.
              </div>
              <div className="space-y-2">
                <Label htmlFor="current-pw">Current Password</Label>
                <Input
                  id="current-pw"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (passwordErrors.currentPassword) {
                      setPasswordErrors((prev) => ({ ...prev, currentPassword: '' }));
                    }
                  }}
                  disabled={updatingPassword}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-red-500 font-medium mt-1">{passwordErrors.currentPassword}</p>
                )}
              </div>
              <Button onClick={handleVerifyCurrentPassword} disabled={updatingPassword}>
                {updatingPassword ? 'Verifying...' : 'Verify Password'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-emerald-600 mb-2 flex items-center justify-between">
                <span>Identity verified. Enter your new password details below.</span>
                <button
                  onClick={() => {
                    setPasswordStep(1);
                    setVerificationToken('');
                    setPasswordErrors({});
                  }}
                  className="text-primary hover:underline font-semibold text-xs"
                >
                  Reset Verification
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-pw">New Password</Label>
                  <Input
                    id="new-pw"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordErrors.newPassword) setPasswordErrors((prev) => ({ ...prev, newPassword: '' }));
                    }}
                    disabled={updatingPassword}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-xs text-red-500 font-medium mt-1">{passwordErrors.newPassword}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-pw">Confirm New Password</Label>
                  <Input
                    id="confirm-pw"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordErrors.confirmPassword) setPasswordErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }}
                    disabled={updatingPassword}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-red-500 font-medium mt-1">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleChangePassword} disabled={updatingPassword}>
                  {updatingPassword ? 'Updating...' : 'Update Password'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPasswordStep(1);
                    setCurrentPassword('');
                    setVerificationToken('');
                    setPasswordErrors({});
                  }}
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <User className="h-4 w-4" />
            Platform
          </CardTitle>
          <CardDescription>Core platform information shown across the app.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="p-name">Platform name</Label>
            <Input
              id="p-name"
              value={platformName}
              onChange={(e) => {
                setPlatformName(e.target.value);
                if (profileErrors.platformName) setProfileErrors((prev) => ({ ...prev, platformName: '' }));
              }}
            />
            {profileErrors.platformName && (
              <p className="text-xs text-red-500 font-medium mt-1">{profileErrors.platformName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-support">Support email</Label>
            <Input
              id="p-support"
              type="email"
              value={supportEmail}
              onChange={(e) => {
                setSupportEmail(e.target.value);
                if (profileErrors.supportEmail) setProfileErrors((prev) => ({ ...prev, supportEmail: '' }));
              }}
            />
            {profileErrors.supportEmail && (
              <p className="text-xs text-red-500 font-medium mt-1">{profileErrors.supportEmail}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
