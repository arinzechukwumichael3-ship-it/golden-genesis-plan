import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, MessageSquare, Clock, Shield, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — YieldEmpireCapital" },
      {
        name: "description",
        content:
          "Get in touch with the YieldEmpireCapital support team. We're available 24/7 via email and live chat.",
      },
    ],
  }),
  component: Contact,
});

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const CONTACT_INFO = [
  {
    icon: Mail,
    title: "Email Support",
    value: "support@yieldempire.com",
    description: "We respond within 24 hours",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    value: "Available 24/7",
    description: "Chat with our support team instantly",
  },
  {
    icon: Clock,
    title: "Response Time",
    value: "Under 24 hours",
    description: "Average response for all inquiries",
  },
];

const TRUST_STRIP = [
  { icon: Shield, label: "Bank-grade encryption" },
  { icon: Clock, label: "24hr response guarantee" },
  { icon: CheckCircle2, label: "Expert support team" },
];

const SUBJECT_OPTIONS = [
  { value: "general", label: "General Inquiry" },
  { value: "deposit", label: "Deposit Help" },
  { value: "withdrawal", label: "Withdrawal Help" },
  { value: "investment", label: "Investment Question" },
  { value: "technical", label: "Technical Issue" },
];

function Contact() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubjectChange(value: string) {
    setForm((prev) => ({ ...prev, subject: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill in all fields before submitting.");
      return;
    }
    setSubmitting(true);
    // Simulate a brief async delay for UX polish, then show success
    setTimeout(() => {
      toast.success("Message sent! We'll respond within 24 hours.");
      setForm(EMPTY_FORM);
      setSubmitting(false);
    }, 600);
  }

  return (
    <SiteLayout>
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-4xl px-4 py-24 text-center"
      >
        <div className="text-sm uppercase tracking-widest text-[#16DB93] mb-3">
          Support
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Get in <span className="gold-text">touch</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Have a question or need help with your account? Our team is standing
          by around the clock to assist you.
        </p>
      </motion.section>

      {/* Main grid */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left: Contact info cards */}
          <motion.div
            className="lg:col-span-2 flex flex-col gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {CONTACT_INFO.map((info) => (
              <motion.div key={info.title} variants={fadeUp}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: "0 10px 30px rgba(22,219,147,0.1)" }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="surface-card border border-[rgba(22,219,147,0.08)] hover:border-[rgba(22,219,147,0.28)] rounded-xl p-5 flex items-start gap-4 transition-colors duration-300">
                    {/* Green icon well */}
                    <div className="shrink-0 w-11 h-11 rounded-lg bg-[rgba(22,219,147,0.12)] flex items-center justify-center">
                      <info.icon className="h-5 w-5 text-[#16DB93]" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">
                        {info.title}
                      </div>
                      <div className="font-semibold text-sm mb-0.5">
                        {info.value}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {info.description}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}

            {/* Secondary note */}
            <motion.div
              variants={fadeUp}
              className="text-sm text-muted-foreground leading-relaxed pt-2 px-1"
            >
              For urgent withdrawal or account security issues, mark your
              message subject as <span className="text-[#16DB93] font-medium">Withdrawal Help</span> or{" "}
              <span className="text-[#16DB93] font-medium">Technical Issue</span> to be escalated automatically.
            </motion.div>
          </motion.div>

          {/* Right: Contact form */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.1 }}
          >
            <Card className="surface-card border border-[rgba(22,219,147,0.1)] hover:border-[rgba(22,219,147,0.22)] transition-colors duration-300">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-1">Send us a message</h2>
                <p className="text-sm text-muted-foreground mb-7">
                  Fill in the form and we'll get back to you within 24 hours.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name & Email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Jane Doe"
                        value={form.name}
                        onChange={handleChange}
                        className="bg-white/[0.03] border-[rgba(22,219,147,0.12)] focus:border-[#16DB93] focus:ring-[#16DB93]/20 transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="jane@example.com"
                        value={form.email}
                        onChange={handleChange}
                        className="bg-white/[0.03] border-[rgba(22,219,147,0.12)] focus:border-[#16DB93] focus:ring-[#16DB93]/20 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Subject dropdown */}
                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </Label>
                    <Select
                      value={form.subject}
                      onValueChange={handleSubjectChange}
                    >
                      <SelectTrigger
                        id="subject"
                        className="bg-white/[0.03] border-[rgba(22,219,147,0.12)] focus:border-[#16DB93] focus:ring-[#16DB93]/20 transition-colors w-full"
                      >
                        <SelectValue placeholder="Select a subject…" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0e1012] border-[rgba(22,219,147,0.15)]">
                        {SUBJECT_OPTIONS.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className="focus:bg-[rgba(22,219,147,0.08)] focus:text-[#16DB93]"
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-sm font-medium">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Describe your question or issue in as much detail as possible…"
                      value={form.message}
                      onChange={handleChange}
                      className="min-h-[140px] bg-white/[0.03] border-[rgba(22,219,147,0.12)] focus:border-[#16DB93] focus:ring-[#16DB93]/20 transition-colors resize-none"
                      required
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="gold-gradient text-white font-semibold animate-glow-pulse w-full py-3 text-base disabled:opacity-60"
                  >
                    {submitting ? "Sending…" : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Trust strip */}
      <motion.section
        className="mx-auto max-w-4xl px-4 pb-24"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
      >
        <div className="surface-card border border-[rgba(22,219,147,0.08)] rounded-2xl py-6 px-8 flex flex-col sm:flex-row items-center justify-center gap-8">
          {TRUST_STRIP.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 text-sm text-muted-foreground"
            >
              <item.icon className="h-5 w-5 text-[#16DB93] shrink-0" />
              <span className="font-medium text-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.section>
    </SiteLayout>
  );
}
