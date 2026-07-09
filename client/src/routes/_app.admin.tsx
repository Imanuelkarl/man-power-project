import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, useData, useUsers } from "@/lib/store";
import { generateBatch } from "@/lib/dummy-data";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AlertTriangle, Sparkles, Trash2, UserX } from "lucide-react";
import { Navigate } from "@tanstack/react-router";
import { useHydrated } from "@/hooks/use-hydrated";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({ meta: [{ title: "Admin — MAN" }] }),
  component: AdminPage,
});

function AdminPage() {
  const user = useAuth((s) => s.user);
  const { manufacturers, questionnaires, clearAll, bulkSet } = useData();
  const { users, removeUser } = useUsers();
  const [count, setCount] = useState(50);
  const hydrated = useHydrated();

  if (!hydrated) return null;
  if (user?.role !== "admin") return <Navigate to="/dashboard" />;

  const handleGenerate = () => {
    const batch = generateBatch(count);
    bulkSet([...manufacturers, ...batch.manufacturers], [...questionnaires, ...batch.questionnaires]);
    toast.success(`Generated ${count} manufacturers with questionnaires`);
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1200px]">
      <PageHeader title="Admin" subtitle="Dummy data generator and user management" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary grid place-items-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Generate dummy data</h3>
              <p className="text-xs text-muted-foreground">Realistic manufacturers spread across Nigerian industrial hubs.</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Number of manufacturers</Label>
            <Input type="number" min={1} max={500} value={count} onChange={(e) => setCount(Number(e.target.value))} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleGenerate} className="flex-1">
              <Sparkles className="w-4 h-4 mr-2" /> Generate
            </Button>
            <Button variant="outline" onClick={() => { clearAll(); toast.success("All data cleared"); }}>
              <Trash2 className="w-4 h-4 mr-2" /> Clear all
            </Button>
          </div>
          <div className="pt-3 border-t border-border grid grid-cols-2 gap-3 text-center">
            <Stat label="Manufacturers" value={manufacturers.length} />
            <Stat label="Questionnaires" value={questionnaires.length} />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-energy/15 text-energy grid place-items-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold">User accounts</h3>
              <p className="text-xs text-muted-foreground">Admin and manufacturer accounts in the system.</p>
            </div>
          </div>
          <div className="divide-y divide-border max-h-72 overflow-y-auto">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 py-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{u.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                </div>
                <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">{u.role}</Badge>
                {u.id !== user.id && (
                  <Button variant="ghost" size="icon" onClick={() => { removeUser(u.id); toast.success("User removed"); }}>
                    <UserX className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-2xl font-display font-semibold">{value.toLocaleString()}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}