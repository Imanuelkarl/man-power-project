import { useState } from "react";
import { useData, useUsers } from "../../lib/store";
import { generateBatch } from "../../lib/dummy-data";
import { PageHeader } from "../../components/page-header";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { Check, Copy, Sparkles, Trash2} from "lucide-react";
import { Navigate } from "@tanstack/react-router";
import { useHydrated } from "../../hooks/use-hydrated";
import { useAuth } from "../../context/AuthContext";

export 
function AdminPage() {
  const { user}  = useAuth();
  const { users} = useUsers();
  const { manufacturers, questionnaires, clearAll, bulkSet } = useData();

  //const invites = useTokens((s) => s.invites);
  const [count, setCount] = useState(100);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const hydrated = useHydrated();

  if (!hydrated) return null;
  if (user?.role !== "admin") return <Navigate to="/dashboard" />;

  const handleGenerate = () => {
    const batch = generateBatch(count,users);
    bulkSet([...manufacturers, ...batch.manufacturers], [...questionnaires, ...batch.questionnaires]);
    toast.success(`Generated ${count} manufacturers with questionnaires`);
  };

  const inviteLink = (token: string) =>
    typeof window !== "undefined" ? `${window.location.origin}/invite/${token}` : `/invite/${token}`;

  const copyInvite = async (token: string) => {
    await navigator.clipboard.writeText(inviteLink(token));
    setCopiedToken(token);
    toast.success("Invite link copied");
    setTimeout(() => setCopiedToken(null), 1500);
  };

  const pendingInvites:any = [];//invites.filter((i) => !i.used);

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1200px]">
      <PageHeader title="Admin" subtitle="Dummy data generator and user management" />

      <div className="grid gap-6 lg:grid-cols-auto">
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
      </div>

      <Card className="p-6 space-y-4">
      
        {pendingInvites.length > 0 ? (
          <div className="pt-3 border-t border-border space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Pending invitations ({pendingInvites.length})
            </div>
            <div className="divide-y divide-border">
              {pendingInvites.map((i:any) => (
                <div key={i.token} className="flex items-center gap-3 py-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{i.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{i.email}</div>
                    <code className="text-[11px] font-mono text-muted-foreground truncate block mt-1">
                      {inviteLink(i.token)}
                    </code>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => copyInvite(i.token)}>
                    {copiedToken === i.token ? (
                      <><Check className="w-4 h-4 mr-2 text-primary" /> Copied</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-2" /> Copy link</>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ):(<div className="text-xs uppercase tracking-wider text-muted-foreground">
              No Pending Invite
            </div>)
        }
      </Card>
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