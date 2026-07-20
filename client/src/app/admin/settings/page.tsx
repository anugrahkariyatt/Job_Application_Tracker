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
import { useAppSelector } from '@/store/hooks';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [name, setName] = useState('Admin User');
  const [email, setEmail] = useState('admin@technocareers.com');
  const [platformName, setPlatformName] = useState('Techno Careers');
  const [supportEmail, setSupportEmail] = useState('support@technocareers.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      // Admin profile details are read-only or saved to configuration/preferences
      toast.success('Admin profile saved (simulation).');
    } catch (err) {
      toast.error('Failed to save profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    try {
      setUpdatingPassword(true);
      const res = await axiosInstance.post('/api/auth/update-password', {
        currentPassword,
        newPassword,
      });
      if (res.data?.success) {
        toast.success('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
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
              <Input id="admin-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
          <div className="space-y-2">
            <Label htmlFor="current-pw">Current password</Label>
            <Input id="current-pw" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-pw">New password</Label>
              <Input id="new-pw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw">Confirm new password</Label>
              <Input id="confirm-pw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleChangePassword} disabled={updatingPassword}>
            {updatingPassword ? 'Updating...' : 'Update password'}
          </Button>
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
            <Input id="p-name" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-support">Support email</Label>
            <Input id="p-support" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
