import { useMemo, useState } from "react";
import { useData } from "../../lib/store";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/page-header";
import { formatNaira } from "../../lib/format";
import { Search, Trash2, Mail } from "lucide-react";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { Select } from "../../components/ui/selector";

export function UsersManager() {
  const { manufacturers, questionnaires, removeManufacturer } = useData();
  const [query, setQuery] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteCompanyName, setInviteCompanyName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    // pretend to create invite
    toast.success(
      `Invite created for ${inviteName} <${inviteEmail}>${inviteRole ? ` as ${inviteRole}` : ""}`,
    );
    setInviteName("");
    setInviteEmail("");
    setInviteRole("");
    setInviteCompanyName("");
    setShowInvite(false);
  };

  const rows = useMemo(() => {
    const q = query.toLowerCase();
    return manufacturers
      .filter(
        (m) =>
          !q ||
          m.company.toLowerCase().includes(q) ||
          m.state.toLowerCase().includes(q) ||
          m.sectoralGroup.toLowerCase().includes(q),
      )
      .map((m) => {
        const qres = questionnaires.find((x) => x.manufacturerId === m.id);
        return { m, q: qres };
      });
  }, [manufacturers, questionnaires, query]);

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1400px]">
      <PageHeader
        title="Users"
        subtitle={`${manufacturers.length} companies on file`}
      />

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search company, state, sector…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="text-xs text-muted-foreground ml-auto">
            {rows.length} shown
          </div>
          <div>
            <Button onClick={() => setShowInvite(true)}>Invite User</Button>
          </div>
        </div>
        {showInvite && (
          <div className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowInvite(false)}
            />
            <div className="bg-background z-52 p-6 rounded shadow-lg w-[500px]">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-medium">Invite User</div>
                <Button variant="ghost" onClick={() => setShowInvite(false)}>
                  Close
                </Button>
              </div>
              <form
                onSubmit={handleInvite}
                className="grid gap-3 sm:grid-cols-[1fr_1fr_1] sm:items-end"
              >
                <div className="space-y-2">
                  <Label htmlFor="inv-name">Contact name</Label>
                  <Input
                    id="inv-name"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inv-email">Email</Label>
                  <Input
                    id="inv-email"
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Select
                    id="inv-role"
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option>--SELECT ROLE--</option>
                    <option value={"manufacturer"}>Manufacturer</option>
                    <option value={"investor"}>Investor</option>
                  </Select>
                </div>
                {(inviteRole&&inviteRole==="manufacturer")&&<div className="space-y-2">
                  <Label htmlFor="inv-com-name">Company Name</Label>
                  <Input
                    id="inv-com-name"
                    required
                    value={inviteCompanyName}
                    onChange={(e) => setInviteCompanyName(e.target.value)}
                  />
                </div>}
                <div className="flex items-end justify-end">
                  <Button type="submit">
                    <Mail className="w-4 h-4 mr-2" /> Create invite
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No User has been added yet.
                    page.
                  </td>
                </tr>
              )}
              {rows.map(({ m, q }) => (
                <tr key={m.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{m.company}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.contactPerson}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{m.city}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.state}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="font-normal">
                      {m.sectoralGroup}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {q ? `${q.capacityUtilization}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {q ? formatNaira(q.productionValue) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {q ? q.totalWorkers.toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        removeManufacturer(m.id);
                        toast.success(`Removed ${m.company}`);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
