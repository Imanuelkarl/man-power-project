
import { useMemo, useState } from "react";
import { useAuth, useTokens } from "../../lib/store";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import { Factory } from "lucide-react";
import { toast } from "sonner";
import { useHydrated } from "../../hooks/use-hydrated";
import { Link, useNavigate, useParams } from "react-router-dom";



export function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const invites = useTokens((s) => s.invites);
  const consumeInvite = useTokens((s) => s.consumeInvite);
  const login = useAuth((s) => s.login);

  const invite = useMemo(() => invites.find((i) => i.token === token), [invites, token]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    const r = token?consumeInvite(token, password):{"ok":false,"error":"No token found"};
    if (!r.ok) return toast.error(r.error ?? "Failed to accept invite");
    if (invite) login(invite.email, password);
    toast.success("Welcome to MAN Manufacturing Intelligence");
    navigate( "/dashboard" );
  };

  if (!hydrated) return null;

  const invalid = !invite || invite.used;

  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary grid place-items-center text-primary-foreground">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold leading-none">Accept your invitation</h2>
            {invite && !invite.used && (
              <p className="text-xs text-muted-foreground mt-1">
                {invite.name} · {invite.email}
              </p>
            )}
          </div>
        </div>

        {invalid ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This invitation link is invalid or has already been used. Contact your MAN
              administrator to request a new invitation.
            </p>
            <Link to="/login" className="text-sm text-primary hover:underline">
              Back to sign in →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="iv-1">Choose a password</Label>
              <Input id="iv-1" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iv-2">Confirm password</Label>
              <Input id="iv-2" type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Activate account</Button>
          </form>
        )}
      </Card>
    </div>
  );
}