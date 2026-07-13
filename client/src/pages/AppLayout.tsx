// import { createFileRoute, Link, Navigate,  useNavigate } from "@tanstack/react-router";
import { type Role } from "../lib/store";
import { Button } from "../components/ui/button";
import {
  BarChart3,
  Factory,
  FileText,
  LogOut,
  Map,
  Settings,
  User,
  Users,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useHydrated } from "../hooks/use-hydrated";
import Navigate, { navigate } from "../components/navigate";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface AppLayoutProps {
  children: React.ReactNode;
}
export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  //export function AppLayout(){

  const { user, logout ,loading } = useAuth();

  const hydrated = useHydrated();
  console.log(user);

  if (!hydrated) return <div className="min-h-screen bg-background" />;
  if (loading) {
    return <>Loading...</>;
  }
  if ( !user) return <Navigate to="/login" />;

  const nav: Array<{
    to: string;
    label: string;
    icon: typeof BarChart3;
    roles: Role[];
  }> = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: BarChart3,
      roles: ["admin", "manufacturer"],
    },
    {
      to: "/questionnaire",
      label: "Questionnaire",
      icon: FileText,
      roles: ["admin", "manufacturer"],
    },
    {
      to: "/manufacturers",
      label: "Manufacturers",
      icon: Users,
      roles: ["admin"],
    },
    {
      to: "/clusters",
      label: "Cluster Map",
      icon: Map,
      roles: ["admin", "manufacturer"],
    },
    { to: "/users" ,label: "Users", icon: User, roles: ["admin"]},
    { to: "/admin", label: "Admin", icon: Settings, roles: ["admin"] },
  ];
  

  return (
    <div className="h-screen flex bg-background text-foreground">
      <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col">
        <div className="p-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-primary grid place-items-center text-primary-foreground">
            <Factory className="w-4 h-4" />
          </div>
          <div>
            <div className="font-display font-semibold text-sm leading-none">
              MAN
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Manufacturing Intel
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav
            .filter((n) => n.roles.includes(user.role))
            .map((item) => {
              const active = location.pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to as any}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    active
                      ? "bg-primary/15 text-primary font-medium"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <div className="px-3 py-2 rounded-md bg-sidebar-accent">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-[11px] text-muted-foreground capitalize">
              {user.role}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {children }
      </main>
    </div>
  );
};
