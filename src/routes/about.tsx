import { createFileRoute } from "@tanstack/react-router";
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

function About() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 py-24 text-center">
        <div className="text-sm uppercase tracking-widest text-[var(--gold)] mb-2">About us</div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6">Reinventing crypto investing for everyone</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We exist to make sophisticated crypto investment strategies accessible, transparent, and safe for investors of every size.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 grid md:grid-cols-2 gap-8">
        <Card className="surface-card border-white/5"><CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-3 gold-text">Our mission</h2>
          <p className="text-muted-foreground leading-relaxed">To democratize wealth-building through transparent, institutional-grade crypto investment products — without the gatekeeping, lock-ups, or hidden fees of legacy finance.</p>
        </CardContent></Card>
        <Card className="surface-card border-white/5"><CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-3 gold-text">Our vision</h2>
          <p className="text-muted-foreground leading-relaxed">A world where anyone with $100 has access to the same return-generating strategies used by family offices and hedge funds.</p>
        </CardContent></Card>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold mb-10 text-center">Leadership team</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { n: "Elena Marsh", r: "CEO & Co-founder", b: "EM" },
            { n: "Daniel Okoye", r: "CTO", b: "DO" },
            { n: "Priya Raman", r: "Head of Trading", b: "PR" },
            { n: "Lukas Vogel", r: "Head of Security", b: "LV" },
          ].map((m) => (
            <Card key={m.n} className="surface-card border-white/5 text-center">
              <CardContent className="p-6">
                <div className="h-20 w-20 mx-auto rounded-full gold-gradient grid place-items-center text-black text-2xl font-bold mb-4">{m.b}</div>
                <div className="font-bold">{m.n}</div>
                <div className="text-sm text-muted-foreground">{m.r}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold mb-10 text-center">Security & trust</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Shield, t: "SOC2 Type II" },
            { icon: Lock, t: "256-bit encryption" },
            { icon: BadgeCheck, t: "KYC / AML compliant" },
            { icon: Award, t: "Insured up to $250k" },
          ].map((x) => (
            <div key={x.t} className="surface-card rounded-xl p-6 text-center">
              <x.icon className="h-10 w-10 mx-auto text-[var(--gold)] mb-3" />
              <div className="font-semibold">{x.t}</div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
