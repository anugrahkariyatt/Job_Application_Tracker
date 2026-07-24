"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Building,
  Headphones,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const contactCards = [
  {
    icon: Mail,
    title: "Email Support",
    detail: "support@nuvora.com",
    subtext: "24/7 dedicated support team",
  },
  {
    icon: Headphones,
    title: "Sales & Enterprise",
    detail: "sales@nuvora.com",
    subtext: "Custom recruiting plans & API access",
  },
  {
    icon: MapPin,
    title: "Global Headquarters",
    detail: "San Francisco, CA & Remote",
    subtext: "Operating globally for candidates & recruiters",
  },
  {
    icon: Clock,
    title: "Response Time",
    detail: "< 24 Hours Guarantee",
    subtext: "Prompt resolution for all inquiries",
  },
];

const faqs = [
  {
    question: "How does n8n AI Candidate Screening work?",
    answer:
      "When a candidate applies to a PRO recruiter's job posting, our n8n automated pipeline processes the resume and profile data against job requirements to calculate an instant AI Suitability Score and key candidate strengths.",
  },
  {
    question: "What is the difference between Candidate Pro and Recruiter Pro?",
    answer:
      "Candidate Pro unlocks unlimited company job alert subscriptions and priority application visibility. Recruiter Pro unlocks unlimited job posts, automated n8n AI candidate screening, and advanced talent analytics.",
  },
  {
    question: "How do candidates track their application status?",
    answer:
      "Every candidate has a live personal dashboard where application statuses (Applied, Under Review, Shortlisted, Interview, Hired) update automatically whenever recruiters take action.",
  },
  {
    question: "Can I cancel or upgrade my subscription anytime?",
    answer:
      "Yes! You can manage or update your subscription plan at any time directly through your account settings or pricing page without any hidden cancellation fees.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "candidate",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    // Simulate contact form submission delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLoading(false);
    toast.success("Thank you for reaching out! We've received your message and will respond within 24 hours.");
    setFormData({
      name: "",
      email: "",
      role: "candidate",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl pointer-events-none" />

      {/* Header / Hero */}
      <section className="relative pt-16 pb-12 px-6 max-w-7xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <MessageSquare className="h-4 w-4" />
          <span>Contact Nuvora Team</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
          We’d Love to Hear From You
        </h1>

        <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Have a question about our AI screening, recruiter plans, candidate tracking, or enterprise solutions? Send us a message and our team will get right back to you.
        </p>
      </section>

      {/* Quick Contact Cards */}
      <section className="py-6 px-6 max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md space-y-2 hover:border-primary/40 transition-all"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  {card.title}
                </h3>
                <p className="text-xs font-semibold text-primary">
                  {card.detail}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {card.subtext}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Form & Info Grid */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-7 p-8 rounded-3xl border border-border/60 bg-card/80 shadow-lg space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">
                Send Us a Message
              </h2>
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
                    placeholder="Alex Morgan"
                    required
                    className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
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
                    placeholder="alex@example.com"
                    required
                    className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    I am a...
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="candidate">Job Candidate</option>
                    <option value="recruiter">Recruiter / Employer</option>
                    <option value="enterprise">Enterprise Partner</option>
                    <option value="other">Other / General</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Recruiter Pro Plan Inquiry"
                    className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
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
                  placeholder="How can we help you today?"
                  required
                  className="w-full p-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                />
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

          {/* Info Side Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/40 space-y-6 shadow-sm">
              <div className="space-y-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-[11px] font-bold">
                  Quick Direct Contact
                </Badge>
                <h3 className="text-xl font-bold text-foreground">
                  Need Fast Answers?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Whether you are configuring your n8n AI screening webhooks, upgrading your candidate pro subscription, or setting up company profiles, we are here to assist.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Enterprise SLA & Security</h4>
                    <p className="text-[11px] text-muted-foreground">SOC2 compliant data protection and 99.9% uptime SLA.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 mt-0.5">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">AI Integration Support</h4>
                    <p className="text-[11px] text-muted-foreground">Dedicated technical support for custom webhook configurations.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-border/40 space-y-8">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <HelpCircle className="h-4 w-4" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
            Have Questions? We Have Answers.
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-border/60 bg-card/60 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-foreground hover:bg-muted/30 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
