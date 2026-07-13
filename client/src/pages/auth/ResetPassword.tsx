import { useState } from "react";
import { useTokens } from "../../lib/store";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import { ArrowLeft, Factory, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";


export const ForgotPasswordPage= () => {
  const createResetForEmail = useTokens((s) => s.createResetForEmail);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = createResetForEmail(email);
    setSubmitted(true);
    if (r.token && typeof window !== "undefined") {
      setDevLink(`${window.location.origin}/reset-password/${r.token}`);
    } else {
      setDevLink(null);
    }
  };

  const copyLink = async () => {
    if (!devLink) return;
    await navigator.clipboard.writeText(devLink);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary grid place-items-center text-primary-foreground">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold leading-none">Reset password</h2>
            <p className="text-xs text-muted-foreground mt-1">We'll send you a secure link</p>
          </div>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fp-email">Email</Label>
              <Input
                id="fp-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <Button type="submit" className="w-full">Send reset link</Button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If an account exists for <span className="text-foreground font-medium">{email}</span>,
              a password reset link has been sent.
            </p>
            {devLink && (
              <div className="space-y-2 rounded-md border border-dashed border-border p-3 bg-muted/30">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Demo link (frontend-only mock)
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono truncate">{devLink}</code>
                  <Button type="button" size="icon" variant="ghost" onClick={copyLink}>
                    {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <Link
          to="/login"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Back to sign in
        </Link>
      </Card>
    </div>
  );
}