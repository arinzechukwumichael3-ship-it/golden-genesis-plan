import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, BadgeCheck, Award } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — YieldEmpireCapital" },
      { name: "description", content: "Our mission, team, and the security standards behind YieldEmpireCapital." },
    ],
  }),
  component: About,
});

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

function About() {
  return (
    <SiteLayout>
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-5xl px-4 py-24 text-center"
      >
        <div className="text-sm uppercase tracking-widest text-[#16DB93] mb-3">About us</div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6">Reinventing crypto investing for everyone</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We exist to make sophisticated crypto investment strategies accessible, transparent, and safe for investors of every size.
        </p>
      </motion.section>

      <motion.section
        className="mx-auto max-w-6xl px-4 py-12 grid md:grid-cols-2 gap-6"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <motion.div variants={fadeUp}>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="surface-card border-[rgba(22,219,147,0.08)] hover:border-[rgba(22,219,147,0.25)] transition-colors duration-300 h-full">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-3 gold-text">Our mission</h2>
                <p className="text-muted-foreground leading-relaxed">To democratize wealth-building through transparent, institutional-grade crypto investment products — without the gatekeeping, lock-ups, or hidden fees of legacy finance.</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        <motion.div variants={fadeUp}>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="surface-card border-[rgba(22,219,147,0.08)] hover:border-[rgba(22,219,147,0.25)] transition-colors duration-300 h-full">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-3 gold-text">Our vision</h2>
                <p className="text-muted-foreground leading-relaxed">A world where anyone with $100 has access to the same return-generating strategies used by family offices and hedge funds.</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <motion.h2
          className="text-3xl font-bold mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Leadership team
        </motion.h2>
        <motion.div
          className="grid md:grid-cols-4 gap-6"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {[
            { n: "Elena Marsh",  r: "CEO & Co-founder", b: "EM" },
            { n: "Daniel Okoye", r: "CTO",              b: "DO" },
            { n: "Priya Raman",  r: "Head of Trading",  b: "PR" },
            { n: "Lukas Vogel",  r: "Head of Security", b: "LV" },
          ].map((m) => (
            <motion.div key={m.n} variants={fadeUp}>
              <motion.div whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(22,219,147,0.12)" }} transition={{ duration: 0.2 }}>
                <Card className="surface-card border-[rgba(22,219,147,0.08)] hover:border-[rgba(22,219,147,0.25)] transition-colors duration-300 text-center">
                  <CardContent className="p-6">
                    <div className="h-20 w-20 mx-auto rounded-full gold-gradient grid place-items-center text-white text-2xl font-bold mb-4">{m.b}</div>
                    <div className="font-bold">{m.n}</div>
                    <div className="text-sm text-muted-foreground">{m.r}</div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <motion.h2
          className="text-3xl font-bold mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Security & trust
        </motion.h2>
        <motion.div
          className="grid md:grid-cols-4 gap-6"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {[
            { icon: Shield,    t: "SOC2 Type II" },
            { icon: Lock,      t: "256-bit encryption" },
            { icon: BadgeCheck, t: "KYC / AML compliant" },
            { icon: Award,     t: "Insured up to $250k" },
          ].map((x) => (
            <motion.div key={x.t} variants={fadeUp}>
              <motion.div
                whileHover={{ y: -4, boxShadow: "0 10px 30px rgba(22,219,147,0.1)" }}
                transition={{ duration: 0.2 }}
                className="surface-card rounded-xl p-6 text-center border border-[rgba(22,219,147,0.08)] hover:border-[rgba(22,219,147,0.28)] transition-colors duration-300"
              >
                <x.icon className="h-10 w-10 mx-auto text-[#16DB93] mb-3" />
                <div className="font-semibold">{x.t}</div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </SiteLayout>
  );
}
