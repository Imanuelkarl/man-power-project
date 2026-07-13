import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
} from "../../components/ui/tabs";
import { Factory } from "lucide-react";
import { toast } from "sonner";
import { useHydrated } from "../../hooks/use-hydrated";
import { useAuth } from "../../context/AuthContext";
import { ThemeToggle } from "../../components/ThemeToggle";
import Navigate, { navigate } from "../../components/navigate";
import { Link } from "react-router-dom";

const LoginPage: React.FC = () => {
  const { user, login} = useAuth();
  const hydrated = useHydrated();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (hydrated && user) return <Navigate to="/" title="Dashboard" />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-sidebar border-r border-sidebar-border relative overflow-hidden">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary grid place-items-center text-primary-foreground">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display font-semibold text-lg leading-none">
              MAN
            </div>
            <div className="text-xs text-muted-foreground">
              Manufacturing Intelligence
            </div>
          </div>
        </div>
        <div className="relative space-y-4 max-w-md">
          <h1 className="font-display text-4xl font-semibold leading-tight">
            Economic review, <span className="text-primary">reimagined.</span>
          </h1>
          <p className="text-muted-foreground">
            Submit the H1 2026 MAN questionnaire digitally, watch manufacturing
            clusters emerge across Nigeria on an interactive map, and export the
            whole review in a click.
          </p>
        </div>
        <div className="relative text-xs text-muted-foreground">
          Manufacturers Association of Nigeria · MVP preview
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-semibold">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Admin demo:{" "}
              <span className="font-mono text-foreground">
                admin@man.org.ng / admin123
              </span>
            </p>
          </div>
          <Tabs defaultValue="login">
            <TabsContent value="login" className="pt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="e1">Email</Label>
                  <Input
                    id="e1"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p1">Password</Label>
                  <Input
                    id="p1"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2 flex justify-end">
                  <Label
                    className="text-sm text-muted-foreground hover:underline cursor-pointer"
                    htmlFor="r1"
                  ><Link
                  to="/forgot-password"
                >
                  Forgot password?
                </Link></Label>
                </div>
                <Button type="submit" className="w-full">
                  Sign in
                </Button>
              </form>
            </TabsContent>
           
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
