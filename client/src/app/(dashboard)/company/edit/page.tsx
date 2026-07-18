'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, Save, X, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditCompanyPage() {
  const router = useRouter();
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [noCompany, setNoCompany] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const [companyLogo, setCompanyLogo] = useState('');
  const [companyCover, setCompanyCover] = useState('');

  const [form, setForm] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    email: '',
    phone: '',
    headquarters: '',
    address: '',
    foundedYear: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    description: '',
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/company');
        if (response.data?.success && response.data?.data) {
          const c = response.data.data;
          setForm({
            companyName: c.companyName || '',
            industry: c.industry || '',
            companySize: c.companySize || '',
            website: c.website || '',
            email: c.email || '',
            phone: c.phone || '',
            headquarters: c.headquarters || '',
            address: c.address || '',
            foundedYear: c.foundedYear ? String(c.foundedYear) : '',
            linkedin: c.linkedin || '',
            twitter: c.twitter || '',
            facebook: c.facebook || '',
            description: c.description || '',
          });
          setCompanyLogo(c.logo || '');
          setCompanyCover(c.coverImage || '');
          setNoCompany(false);
        }
      } catch (err: any) {
        console.error('Error fetching company details:', err);
        if (err.response?.status === 404) {
          setNoCompany(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      setLogoUploading(true);
      const response = await axiosInstance.patch('/api/company/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data?.success) {
        setCompanyLogo(response.data.data.logo);
        toast.success('Logo uploaded successfully!');
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      toast.error('Failed to upload logo.');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('coverImage', file);

    try {
      setCoverUploading(true);
      const response = await axiosInstance.patch('/api/company/cover-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data?.success) {
        setCompanyCover(response.data.data.coverImage);
        toast.success('Cover image uploaded successfully!');
      }
    } catch (err) {
      console.error('Cover upload error:', err);
      toast.error('Failed to upload cover image.');
    } finally {
      setCoverUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.companyName || !form.industry) {
      toast.error('Company Name and Industry are required.');
      return;
    }

    // Sanitize empty strings for URL fields to satisfy Zod validation
    const payload: any = {
      companyName: form.companyName,
      industry: form.industry,
    };

    if (form.companySize) payload.companySize = form.companySize;
    if (form.website?.trim()) payload.website = form.website.trim();
    if (form.email?.trim()) payload.email = form.email.trim();
    if (form.phone?.trim()) payload.phone = form.phone.trim();
    if (form.description?.trim()) payload.description = form.description.trim();
    if (form.foundedYear) payload.foundedYear = Number(form.foundedYear);
    if (form.headquarters?.trim()) payload.headquarters = form.headquarters.trim();
    if (form.address?.trim()) payload.address = form.address.trim();
    if (form.linkedin?.trim()) payload.linkedin = form.linkedin.trim();
    if (form.twitter?.trim()) payload.twitter = form.twitter.trim();
    if (form.facebook?.trim()) payload.facebook = form.facebook.trim();

    try {
      setSaving(true);
      let response;
      if (noCompany) {
        // Create company profile
        response = await axiosInstance.post('/api/company', {
          companyName: form.companyName,
          industry: form.industry,
        });
      } else {
        // Update company profile
        response = await axiosInstance.patch('/api/company', payload);
      }

      if (response.data?.success) {
        toast.success('Company profile saved successfully.');
        router.push('/company');
      }
    } catch (err: any) {
      console.error('Error saving company profile:', err);
      const errors = err.response?.data?.errors?.fieldErrors;
      if (errors) {
        Object.keys(errors).forEach((key) => {
          toast.error(`${key}: ${errors[key].join(', ')}`);
        });
      } else {
        toast.error(err.response?.data?.message || 'Failed to save company profile.');
      }
    } finally {
      setSaving(false);
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
          <Skeleton className="h-24 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={noCompany ? 'Setup Company Profile' : 'Edit Company Profile'}
        description="Update your company's information and branding."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Company Profile', href: '/company' },
          { label: 'Edit' },
        ]}
        actions={
          <>
            <Link href="/company">
              <Button variant="outline" size="sm">
                <X className="mr-1.5 h-4 w-4" />
                Cancel
              </Button>
            </Link>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </>
        }
      />

      {noCompany && (
        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Profile Setup Required</p>
            <p className="text-primary/90 mt-0.5">
              Enter your Company Name and Industry, and click **Save Changes** below to initialize your company profile. Once saved, you can upload your Logo and Cover Image.
            </p>
          </div>
        </div>
      )}

      <Card className={noCompany ? 'opacity-60 pointer-events-none' : ''}>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label className="mb-2 block">Cover Image</Label>
            <input
              type="file"
              accept="image/*"
              ref={coverInputRef}
              onChange={handleCoverUpload}
              className="hidden"
            />
            <div
              onClick={() => !noCompany && !coverUploading && coverInputRef.current?.click()}
              className="relative h-36 w-full overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              {companyCover ? (
                <img
                  src={companyCover}
                  alt="Cover preview"
                  className="h-full w-full object-cover opacity-60"
                />
              ) : (
                <div className="h-full w-full bg-muted/20" />
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                {coverUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <p className="text-xs font-medium text-muted-foreground">
                      Click to upload a new cover image
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          <div>
            <Label className="mb-2 block">Company Logo</Label>
            <input
              type="file"
              accept="image/*"
              ref={logoInputRef}
              onChange={handleLogoUpload}
              className="hidden"
            />
            <div className="flex items-center gap-4">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt="Logo preview"
                  className="h-16 w-16 rounded-xl border border-border object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-xl border border-border bg-muted flex items-center justify-center text-muted-foreground font-semibold text-lg">
                  Logo
                </div>
              )}
              <div
                onClick={() => !noCompany && !logoUploading && logoInputRef.current?.click()}
                className="flex h-16 cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-border px-6 hover:border-primary/30 hover:bg-primary/5 transition-colors"
              >
                {logoUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <Upload className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium text-muted-foreground">
                  {logoUploading ? 'Uploading...' : 'Upload logo'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Company Name *"
              value={form.companyName}
              onChange={(v) => handleChange('companyName', v)}
              disabled={saving}
            />
            <FormField
              label="Industry *"
              value={form.industry}
              onChange={(v) => handleChange('industry', v)}
              disabled={saving}
            />
            <FormField
              label="Company Size"
              placeholder="e.g. 10-50 employees"
              value={form.companySize}
              onChange={(v) => handleChange('companySize', v)}
              disabled={saving || noCompany}
            />
            <FormField
              label="Founded Year"
              placeholder="e.g. 2016"
              value={form.foundedYear}
              onChange={(v) => handleChange('foundedYear', v)}
              disabled={saving || noCompany}
            />
            <FormField
              label="Website"
              placeholder="https://example.com"
              value={form.website}
              onChange={(v) => handleChange('website', v)}
              disabled={saving || noCompany}
            />
            <FormField
              label="Email"
              placeholder="hr@example.com"
              value={form.email}
              onChange={(v) => handleChange('email', v)}
              type="email"
              disabled={saving || noCompany}
            />
            <FormField
              label="Phone"
              placeholder="+1 (555) 019-2834"
              value={form.phone}
              onChange={(v) => handleChange('phone', v)}
              disabled={saving || noCompany}
            />
            <FormField
              label="Headquarters"
              placeholder="e.g. San Francisco, CA"
              value={form.headquarters}
              onChange={(v) => handleChange('headquarters', v)}
              disabled={saving || noCompany}
            />
          </div>
          <div className="mt-4">
            <Label className="mb-2 block">Address</Label>
            <Textarea
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows={2}
              disabled={saving || noCompany}
            />
          </div>
        </CardContent>
      </Card>

      <Card className={noCompany ? 'opacity-60 pointer-events-none' : ''}>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={5}
            disabled={saving}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Tell candidates what makes your company unique.
          </p>
        </CardContent>
      </Card>

      <Card className={noCompany ? 'opacity-60 pointer-events-none' : ''}>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Social Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              label="LinkedIn"
              placeholder="https://linkedin.com/company/example"
              value={form.linkedin}
              onChange={(v) => handleChange('linkedin', v)}
              disabled={saving}
            />
            <FormField
              label="Twitter"
              placeholder="https://twitter.com/example"
              value={form.twitter}
              onChange={(v) => handleChange('twitter', v)}
              disabled={saving}
            />
            <FormField
              label="Facebook"
              placeholder="https://facebook.com/example"
              value={form.facebook}
              onChange={(v) => handleChange('facebook', v)}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Link href="/company">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-1.5 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
