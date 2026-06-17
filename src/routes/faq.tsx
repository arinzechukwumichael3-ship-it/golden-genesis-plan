import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — YieldEmpireCapital" },
      {
        name: "description",
        content:
          "Answers to the most common questions about deposits, returns, security, and getting started with YieldEmpireCapital.",
      },
    ],
  }),
  component: FAQ,
});

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

type FAQItem = { q: string; a: string };
type FAQCategory = { title: string; items: FAQItem[] };

const FAQ_DATA: FAQCategory[] = [
  {
    title: "Getting Started",
    items: [
      {
        q: "How do deposits work?",
        a: "Deposits are made via cryptocurrency transfer (BTC or USDT). After registering, you'll receive a unique wallet address to send funds to. Once your transaction is confirmed on-chain, your balance is credited and your selected plan activates automatically.",
      },
      {
        q: "What is the minimum investment amount?",
        a: "The minimum investment on our Basic Plan starts at €500. VIP Plan tiers begin at €1,000, and our Premium BTC Plan starts at 1 BTC. There is no maximum deposit limit across any plan.",
      },
      {
        q: "Which countries are supported?",
        a: "YieldEmpireCapital is available to investors in most countries worldwide, with the exception of jurisdictions under international sanctions. We support investors from Europe, the Americas, Asia-Pacific, and Africa. Create an account to confirm eligibility in your specific region.",
      },
      {
        q: "How long does account setup take?",
        a: "Account creation takes under two minutes. KYC verification — required before your first withdrawal — is typically completed within 24 hours. Once verified, you can deposit and begin investing immediately.",
      },
      {
        q: "Do I need prior crypto experience to invest?",
        a: "Not at all. Our platform is designed to be accessible for investors of every level. You simply deposit funds, select a plan, and our trading engine handles execution. Detailed guides are available in your dashboard for every step.",
      },
    ],
  },
  {
    title: "Investments & Returns",
    items: [
      {
        q: "What are the return timelines?",
        a: "All plans operate on a 72-hour payout window from the moment your deposit is confirmed on-chain. Returns are credited directly to your platform balance, from which you can withdraw or reinvest.",
      },
      {
        q: "What is the difference between the Basic, VIP, and Premium plans?",
        a: "Basic Plan uses short-term USDT copy trading and targets doubling your capital within 72 hours. VIP Plan uses premium algorithmic strategies with higher tier multipliers for larger capital sizes. Premium BTC Plan is exclusively denominated in Bitcoin and delivers up to 3x returns on your BTC position within the same 72-hour window.",
      },
      {
        q: "Can I reinvest my returns automatically?",
        a: "Yes. From your dashboard you can toggle auto-reinvest for any active plan. When enabled, credited returns are immediately rolled into a new cycle of the same plan without requiring manual action.",
      },
      {
        q: "How are payouts delivered?",
        a: "Payouts are credited to your YieldEmpireCapital balance. You may withdraw to any external wallet address at any time. Withdrawals are processed within 24 hours and sent as BTC or USDT depending on your plan.",
      },
    ],
  },
  {
    title: "Security & Trust",
    items: [
      {
        q: "How are my funds kept secure?",
        a: "Client funds are held in segregated, multi-signature cold storage wallets. No single party holds complete signing authority. Our infrastructure is SOC2 Type II certified and undergoes quarterly third-party security audits.",
      },
      {
        q: "Is my withdrawal always safe?",
        a: "Yes. Withdrawals are processed only to wallets that have been whitelisted by you and confirmed via email and two-factor authentication. No withdrawal can be initiated without your explicit approval through at least two verification channels.",
      },
      {
        q: "Is KYC mandatory?",
        a: "KYC is required before your first withdrawal. This is both a regulatory requirement and a security measure to ensure that only the verified account owner can access funds. Deposits and plan activation do not require KYC to be completed first.",
      },
      {
        q: "Do you use cold storage?",
        a: "The majority of client assets — over 95% — are held in air-gapped cold storage at any given time. Only a small operational reserve is maintained in hot wallets, protected by hardware security modules (HSMs) and strict access controls.",
      },
      {
        q: "What happens if the platform experiences downtime?",
        a: "Our infrastructure is distributed across multiple availability zones with 99.9% uptime SLAs. In the rare event of planned maintenance, active plan cycles are paused and resumed without any loss to your return window. You are notified in advance of any scheduled downtime.",
      },
    ],
  },
];

function FAQ() {
  return (
    <SiteLayout>
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-3xl px-4 py-24 text-center"
      >
        <div className="text-sm uppercase tracking-widest text-[#16DB93] mb-3">
          FAQ
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Frequently Asked{" "}
          <span className="gold-text">Questions</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Everything you need to know about depositing, earning, and keeping
          your funds secure on YieldEmpireCapital.
        </p>
      </motion.section>

      {/* FAQ Categories */}
      <section className="mx-auto max-w-3xl px-4 pb-24 space-y-14">
        {FAQ_DATA.map((category) => (
          <div key={category.title}>
            {/* Category heading */}
            <motion.h2
              className="text-2xl font-bold mb-6 gold-text"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {category.title}
            </motion.h2>

            {/* Accordion */}
            <Accordion type="single" collapsible className="space-y-3">
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="space-y-3"
              >
                {category.items.map((item, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeUp}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <AccordionItem
                      value={`${category.title}-${idx}`}
                      className="surface-card border border-[rgba(22,219,147,0.08)] rounded-xl px-5 overflow-hidden
                        data-[state=open]:border-l-2 data-[state=open]:border-[#16DB93] data-[state=open]:pl-4 transition-all duration-200"
                    >
                      <AccordionTrigger className="text-base font-medium text-left py-5 hover:no-underline hover:text-[#16DB93] transition-colors duration-200">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground leading-relaxed pb-2">
                          {item.a}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </motion.div>
            </Accordion>
          </div>
        ))}
      </section>

      {/* Bottom CTA */}
      <motion.section
        className="mx-auto max-w-3xl px-4 pb-28 text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="surface-card border border-[rgba(22,219,147,0.12)] rounded-2xl p-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[rgba(22,219,147,0.1)] mb-5">
            <MessageCircle className="h-7 w-7 text-[#16DB93]" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Still have questions?</h2>
          <p className="text-muted-foreground mb-7 max-w-sm mx-auto">
            Our support team is available 24/7 and typically responds within a
            few hours.
          </p>
          <Button
            className="gold-gradient text-white font-semibold px-8 py-3 animate-glow-pulse"
            asChild
          >
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </motion.section>
    </SiteLayout>
  );
}
