import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

// /invest is the parent layout for the investment flow.
export const Route = createFileRoute("/_authenticated/invest")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/invest") {
      throw redirect({ to: "/invest/portfolio" });
    }
  },
  component: () => <Outlet />,
});
