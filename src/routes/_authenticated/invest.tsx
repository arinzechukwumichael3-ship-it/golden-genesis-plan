import { createFileRoute, redirect } from "@tanstack/react-router";

// /invest now redirects to the portfolio (the multi-step flow lives at /invest/new etc.)
export const Route = createFileRoute("/_authenticated/invest")({
  beforeLoad: () => {
    throw redirect({ to: "/invest/portfolio" });
  },
});
