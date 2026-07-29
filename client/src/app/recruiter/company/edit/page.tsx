'use client';

import { useState, useEffect, useRef } from 'react';
import { z } from 'zod';
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
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import axiosInstance from '@/lib/axios';
import { Skeleton } from '@/components/ui/skeleton';

const PREDEFINED_INDUSTRIES = [
  "Information Technology & Software",
  "Software Development",
  "Finance & Banking",
  "Healthcare & Life Sciences",
  "E-Commerce & Retail",
  "Education & EdTech",
  "Manufacturing & Industrial",
  "Marketing & Advertising",
  "Real Estate & Construction",
  "Telecommunications",
  "Media & Entertainment",
  "Management Consulting",
  "Logistics & Supply Chain",
  "Hospitality & Tourism",
  "Energy & Clean Tech",
  "Non-Profit & NGO",
  "Automotive",
  "Aerospace & Defense",
  "Others",
];

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
    .max(100, "Company name cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s&.,'/-]+$/, "Company name contains invalid characters"),
  industry: z
    .string()
    .trim()
    .min(2, "Industry must be at least 2 characters")
    .max(50, "Industry cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9\s&.,'/-]+$/, "Industry contains invalid characters"),
  
  companySize: z
    .string()
    .trim()
    .min(1, "Company size (number of employees) is required")
    .max(50, "Company size cannot exceed 50 characters")
    .regex(/^[0-9+\-\s]+$/, "Only numbers and symbols (e.g., 10-50, 500+) are allowed"),

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
    .regex(/^[0-9+\-\(\)\s]*$/, "Only numbers and phone symbols (+, -, ()) are allowed")
    .refine((val) => {
      if (!val) return true; 
      const digitCount = val.replace(/\D/g, "").length;
      return digitCount >= 10 && digitCount <= 15;
    }, "Phone number must have between 10 and 15 digits")
    .optional()
    .or(z.literal("")),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters")
    .optional()
    .or(z.literal("")),
  foundedYear: z
    .string()
    .trim()
    .regex(/^[0-9]*$/, "Founded year must contain numbers only")
    .refine((val) => {
      if (!val) return true;
      const num = Number(val);
      return num >= 1800 && num <= new Date().getFullYear() + 1;
    }, `Founded year must be a valid 4-digit year between 1800 and ${new Date().getFullYear() + 1}`)
    .optional()
    .or(z.literal("")),
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

    if (noCompany) {
      toast.error('Please save your Company Name and Industry first before uploading a logo.');
      return;
    }

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

    if (noCompany) {
      toast.error('Please save your Company Name and Industry first before uploading a cover image.');
      return;
    }

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
      foundedYear: form.foundedYear ? String(form.foundedYear).trim() : "",
    });

    if (!validation.success) {
      const fe = validation.error.flatten().fieldErrors;
      const newErrors: FormErrors = {
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
      };
      setFieldErrors(newErrors);

      const firstErr = Object.values(newErrors).find(Boolean);
      toast.error(firstErr ? `Validation Error: ${firstErr}` : "Please check the form for errors.");
      return;
    }

    // Build payload
    const payload: any = {
      companyName: validation.data.companyName,
      industry: validation.data.industry,
    };

    if (form.companySize) payload.companySize = form.companySize;
    if (form.website) payload.website = form.website;
    if (form.email) payload.email = form.email;
    if (form.phone) payload.phone = form.phone;
    if (form.description) payload.description = form.description;
    if (validation.data.foundedYear) payload.foundedYear = Number(validation.data.foundedYear);
    if (form.headquarters) payload.headquarters = form.headquarters;
    if (form.address) payload.address = form.address;
    if (form.linkedin) payload.linkedin = form.linkedin;
    if (form.twitter) payload.twitter = form.twitter;
    if (form.facebook) payload.facebook = form.facebook;

    try {
      setSaving(true);
      let response;
      if (noCompany) {
        // Create company profile first
        await axiosInstance.post('/api/company', {
          companyName: payload.companyName,
          industry: payload.industry,
        });
        // Update full profile details
        response = await axiosInstance.patch('/api/company', payload);
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
        const errMsgs = Object.entries(errors)
          .map(([k, v]: [string, any]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(', ');
        toast.error(errMsgs || 'Validation failed');
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
    <div className="space-y-6 pb-12">
      <PageHeader
        title={noCompany ? 'Setup Company Profile' : 'Edit Company Profile'}
        description="Update your company's information and branding."
        breadcrumbs={[
          { label: 'Dashboard', href: '/recruiter/dashboard' },
          { label: 'Company Profile', href: '/recruiter/company' },
          { label: 'Edit' },
        ]}
        actions={
          <Link href="/recruiter/company">
            <Button variant="outline" size="sm">
              <X className="mr-1.5 h-4 w-4" />
              Cancel
            </Button>
          </Link>
        }
      />

      {noCompany && (
        <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Profile Setup Required</p>
            <p className="text-primary/90 mt-0.5">
              Fill out your company details below and click <strong>Save Changes</strong> to create your official company profile.
            </p>
          </div>
        </div>
      )}

      {/* BRANDING CARD */}
      <Card>
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
              className="relative h-36 w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
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
                      Click to upload cover image
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
                <div className="h-16 w-16 rounded-xl border border-border bg-muted flex items-center justify-center text-muted-foreground font-semibold text-sm">
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

      {/* BASIC INFORMATION CARD */}
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
            <div className="space-y-2">
              <Label className="text-sm font-medium">Industry *</Label>
              <Select
                value={
                  PREDEFINED_INDUSTRIES.includes(form.industry)
                    ? form.industry
                    : "Others"
                }
                onValueChange={(val) => {
                  if (val === "Others") {
                    const customVal = PREDEFINED_INDUSTRIES.includes(form.industry) ? "Others" : form.industry;
                    handleChange("industry", customVal);
                  } else {
                    handleChange("industry", val);
                  }
                }}
                disabled={saving}
              >
                <SelectTrigger className={cn("w-full h-10", fieldErrors.industry && "border-destructive")}>
                  <SelectValue placeholder="Select Industry" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(!PREDEFINED_INDUSTRIES.includes(form.industry) || form.industry === "Others") && (
                <Input
                  placeholder="Enter custom industry (e.g. BioTech, Robotics)"
                  value={form.industry === "Others" ? "" : form.industry}
                  onChange={(e) => handleChange("industry", e.target.value || "Others")}
                  disabled={saving}
                  className="mt-2"
                />
              )}

              {fieldErrors.industry && (
                <p className="text-xs text-destructive">{fieldErrors.industry}</p>
              )}
            </div>
            <FormField
              label="Company Size"
              placeholder="e.g. 10-50 employees"
              value={form.companySize}
              onChange={(v) => handleChange('companySize', v)}
              disabled={saving}
              error={fieldErrors.companySize}
            />
            <FormField
              label="Founded Year"
              placeholder="e.g. 2016"
              type="number"
              value={form.foundedYear}
              onChange={(v) => handleChange('foundedYear', v)}
              disabled={saving}
              error={fieldErrors.foundedYear}
            />
            <FormField
              label="Website"
              placeholder="https://example.com"
              value={form.website}
              onChange={(v) => handleChange('website', v)}
              disabled={saving}
              error={fieldErrors.website}
            />
            <FormField
              label="Email"
              placeholder="hr@example.com"
              value={form.email}
              onChange={(v) => handleChange('email', v)}
              type="email"
              disabled={saving}
              error={fieldErrors.email}
            />
            <FormField
              label="Phone"
              placeholder="+1 (555) 019-2834"
              value={form.phone}
              onChange={(v) => handleChange('phone', v)}
              disabled={saving}
              error={fieldErrors.phone}
            />
            <FormField
              label="Headquarters"
              placeholder="e.g. San Francisco, CA"
              value={form.headquarters}
              onChange={(v) => handleChange('headquarters', v)}
              disabled={saving}
              error={fieldErrors.headquarters}
            />
          </div>
          <div className="mt-4">
            <Label className="mb-2 block">Address</Label>
            <Textarea
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows={2}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* DESCRIPTION CARD */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={5}
            disabled={saving}
            placeholder="Tell candidates what makes your company unique..."
            className={fieldErrors.description ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {fieldErrors.description && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">{fieldErrors.description}</p>
          )}
        </CardContent>
      </Card>

      {/* SOCIAL LINKS CARD */}
      <Card>
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

      {/* ACTION BAR */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link href="/recruiter/company">
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </Link>
        <Button type="button" onClick={handleSave} disabled={saving} className="px-6">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
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
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
          <span>⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}
