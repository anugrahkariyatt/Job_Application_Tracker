'use client';

import React, { useState } from "react";
import {
  Mail,
  Headphones,
  MapPin,
  Clock,
  Send,
  Loader2,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/shared/PageHeader";
import axiosInstance from "@/lib/axios";

const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
  email: z.string().trim().email("Invalid email format"),
  subject: z.string().trim().max(100, "Subject cannot exceed 100 characters").optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000, "Message cannot exceed 1000 characters"),
});

const contactCards = [
  {
    icon: Mail,
    title: "Recruiter Support",
    detail: "recruiters@nuvora.com",
    subtext: "24/7 employer assistance team",
  },
  {
    icon: Headphones,
    title: "Sales & Plans",
    detail: "sales@nuvora.com",
    subtext: "Recruiter Pro & custom enterprise plans",
  },
  {
    icon: MapPin,
    title: "Global Support",
    detail: "San Francisco, CA & Remote",
    subtext: "Worldwide support coverage",
  },
  {
    icon: Clock,
    title: "Response Time",
    detail: "< 24 Hours Guarantee",
    subtext: "Fast support resolution",
  },
];

const faqs = [
  {
    question: "How does Gemini AI Candidate Screening work?",
    answer:
      "When candidates submit applications for your job postings, Gemini AI evaluates resume details against job requirements to produce instant match scores.",
  },
  {
    question: "How do automated n8n candidate emails work?",
    answer:
      "When you update candidate statuses or schedule interviews as a Recruiter Pro user, automated n8n webhooks send personalized email updates directly to candidates.",
  },
  {
    question: "How do I update my company profile?",
    answer:
      "Navigate to Company Profile in your sidebar to update your company logo, cover image, industry, description, and website links anytime.",
  },
];

export default function RecruiterContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = contactFormSchema.safeParse(formData);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Please correct the form errors before submitting.");
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/api/contact", {
        ...formData,
        role: "recruiter",
      });
      if (res.data?.success) {
        toast.success(res.data.message || "Thank you for reaching out! We've received your message and will respond within 24 hours.");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        setErrors({});
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Recruiter Support"
        description="Have questions about job postings, recruiter subscription plans, or candidate pipeline management? Contact us anytime."
        breadcrumbs={[{ label: "Recruiter", href: "/recruiter/dashboard" }, { label: "Contact" }]}
      />

      {/* Quick Contact Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {contactCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-border/60 bg-card shadow-xs space-y-2 hover:border-primary/40 transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">{card.title}</h3>
              <p className="text-xs font-semibold text-primary">{card.detail}</p>
              <p className="text-[11px] text-muted-foreground">{card.subtext}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl border border-border/60 bg-card shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">Send Us a Message</h2>
            <p className="text-xs text-muted-foreground">
              Fill out the form below and our team will respond within 24 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Your Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Recruiter Name"
                  className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                    <span>⚠</span>
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="recruiter@company.com"
                  className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                    <span>⚠</span>
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g. Recruiter Pro Plan Inquiry"
                className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              {errors.subject && (
                <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                  <span>⚠</span>
                  {errors.subject}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Your Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help your team today?"
                className="w-full p-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                  <span>⚠</span>
                  {errors.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-primary text-white font-bold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending Message...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* FAQs */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl border border-border/60 bg-card shadow-sm space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <HelpCircle className="h-4 w-4" />
              <span>Recruiter FAQs</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border/60 bg-background/50 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs text-foreground hover:text-primary transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        isOpen ? "rotate-180 text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
