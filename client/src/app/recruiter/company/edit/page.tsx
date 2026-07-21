'use client';

import { useState, useEffect, useRef } from 'react';
import { z } from 'zod';

const optionalUrlSchema = z.preprocess((val) => {
  if (typeof val !== "string" || !val.trim()) return undefined;
  if (!/^https?:\/\//i.test(val)) return `https://${val}`;
  return val;
}, z.string().trim().url("Invalid URL format").optional().or(z.literal("")));

const companyProfileSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(3, "Company name must be at least 3 characters")
    .max(100, "Company name cannot exceed 100 characters"),
  industry: z
    .string()
    .trim()
    .min(2, "Industry must be at least 2 characters")
    .max(50, "Industry cannot exceed 50 characters"),
  companySize: z
    .string()
    .trim()
    .max(50, "Company size cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  website: optionalUrlSchema,
  email: z
    .string()
    .trim()
    .email("Invalid email format")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits")
    .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format. Must contain 10-15 digits, optionally starting with '+'")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters")
    .optional()
    .or(z.literal("")),
  foundedYear: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z
      .number()
      .int("Founded year must be an integer")
      .min(1800, "Founded year must be 1800 or later")
      .max(new Date().getFullYear() + 1, "Founded year cannot be in the future")
      .optional()
  ),
  headquarters: z
    .string()
    .trim()
    .max(100, "Headquarters location cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .max(200, "Address details cannot exceed 200 characters")
    .optional()
    .or(z.literal("")),
  linkedin: optionalUrlSchema,
  twitter: optionalUrlSchema,
  facebook: optionalUrlSchema,
});
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

  type FormErrors = {
    companyName?: string;
    industry?: string;
    companySize?: string;
    website?: string;
    email?: string;
    phone?: string;
    headquarters?: string;
    address?: string;
    foundedYear?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    description?: string;
  };
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

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
        } else {
          setNoCompany(true);
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
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
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
        setNoCompany(false);
      }
    } catch (err: any) {
      console.error('Logo upload error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to upload logo.';
      toast.error(errorMsg);
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
        setNoCompany(false);
      }
    } catch (err: any) {
      console.error('Cover upload error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to upload cover image.';
      toast.error(errorMsg);
    } finally {
      setCoverUploading(false);
    }
  };

  const handleSave = async () => {
    setFieldErrors({});
    // Validate with Zod
    const validation = companyProfileSchema.safeParse({
      ...form,
      foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined,
    });

    if (!validation.success) {
      const fe = validation.error.flatten().fieldErrors;
      setFieldErrors({
        companyName: fe.companyName?.[0],
        industry: fe.industry?.[0],
        companySize: fe.companySize?.[0],
        website: fe.website?.[0],
        email: fe.email?.[0],
        phone: fe.phone?.[0],
        headquarters: fe.headquarters?.[0],
        address: fe.address?.[0],
        foundedYear: fe.foundedYear?.[0],
        linkedin: fe.linkedin?.[0],
        twitter: fe.twitter?.[0],
        facebook: fe.facebook?.[0],
        description: fe.description?.[0],
      });
      return;
    }

    // Sanitize empty strings for URL fields to satisfy Zod validation
    const payload: any = {
      companyName: validation.data.companyName,
      industry: validation.data.industry,
    };

    if (validation.data.companySize) payload.companySize = validation.data.companySize;
    if (validation.data.website) payload.website = validation.data.website;
    if (validation.data.email) payload.email = validation.data.email;
    if (validation.data.phone) payload.phone = validation.data.phone;
    if (validation.data.description) payload.description = validation.data.description;
    if (validation.data.foundedYear) payload.foundedYear = validation.data.foundedYear;
    if (validation.data.headquarters) payload.headquarters = validation.data.headquarters;
    if (validation.data.address) payload.address = validation.data.address;
    if (validation.data.linkedin) payload.linkedin = validation.data.linkedin;
    if (validation.data.twitter) payload.twitter = validation.data.twitter;
    if (validation.data.facebook) payload.facebook = validation.data.facebook;

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
        router.push('/recruiter/company');
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
          { label: 'Dashboard', href: '/recruiter/dashboard' },
          { label: 'Company Profile', href: '/recruiter/company' },
          { label: 'Edit' },
        ]}
        actions={
          <>
            <Link href="/recruiter/company">
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
              onClick={() => !coverUploading && coverInputRef.current?.click()}
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
                onClick={() => !logoUploading && logoInputRef.current?.click()}
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
              error={fieldErrors.companyName}
            />
            <FormField
              label="Industry *"
              value={form.industry}
              onChange={(v) => handleChange('industry', v)}
              disabled={saving}
              error={fieldErrors.industry}
            />
            <FormField
              label="Company Size"
              placeholder="e.g. 10-50 employees"
              value={form.companySize}
              onChange={(v) => handleChange('companySize', v)}
              disabled={saving || noCompany}
              error={fieldErrors.companySize}
            />
            <FormField
              label="Founded Year"
              placeholder="e.g. 2016"
              value={form.foundedYear}
              onChange={(v) => handleChange('foundedYear', v)}
              disabled={saving || noCompany}
              error={fieldErrors.foundedYear}
            />
            <FormField
              label="Website"
              placeholder="https://example.com"
              value={form.website}
              onChange={(v) => handleChange('website', v)}
              disabled={saving || noCompany}
              error={fieldErrors.website}
            />
            <FormField
              label="Email"
              placeholder="hr@example.com"
              value={form.email}
              onChange={(v) => handleChange('email', v)}
              type="email"
              disabled={saving || noCompany}
              error={fieldErrors.email}
            />
            <FormField
              label="Phone"
              placeholder="+1 (555) 019-2834"
              value={form.phone}
              onChange={(v) => handleChange('phone', v)}
              disabled={saving || noCompany}
              error={fieldErrors.phone}
            />
            <FormField
              label="Headquarters"
              placeholder="e.g. San Francisco, CA"
              value={form.headquarters}
              onChange={(v) => handleChange('headquarters', v)}
              disabled={saving || noCompany}
              error={fieldErrors.headquarters}
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
            className={fieldErrors.description ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {fieldErrors.description && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{fieldErrors.description}</p>
          )}
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
              error={fieldErrors.linkedin}
            />
            <FormField
              label="Twitter"
              placeholder="https://twitter.com/example"
              value={form.twitter}
              onChange={(v) => handleChange('twitter', v)}
              disabled={saving}
              error={fieldErrors.twitter}
            />
            <FormField
              label="Facebook"
              placeholder="https://facebook.com/example"
              value={form.facebook}
              onChange={(v) => handleChange('facebook', v)}
              disabled={saving}
              error={fieldErrors.facebook}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Link href="/recruiter/company">
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
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
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
        className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{error}</p>
      )}
    </div>
  );
}
