import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/store";
import { useHydrated } from "@/hooks/use-hydrated";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const user = useAuth((s) => s.user);
  const hydrated = useHydrated();
  if (!hydrated) return <div className="min-h-screen bg-background" />;
  return <Navigate to={user ? "/dashboard" : "/login"} />;
}
