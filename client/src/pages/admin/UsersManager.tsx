import { useMemo, useState } from "react";
import { useUsers } from "../../lib/store";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/page-header";
import { Search, Trash2, Mail } from "lucide-react";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { Select } from "../../components/ui/selector";
import authService from "../../services/authService";
import type { User } from "../../types/user.types";

export function UsersManager() {
  const { users, addUser, removeUser } = useUsers();
  const [query, setQuery] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteCompanyName, setInviteCompanyName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    const newUser: User & { password: string } = {
      id: users.length,
      name: inviteName,
      role: inviteRole as User["role"],
      companyName: inviteCompanyName,
      email: inviteEmail,
      is_active: true,
      password: genSecurePass(),
    };
    try {
      const data = await authService.signup({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as "manufacturer" | "investor",
        password: newUser.password,
        companyName: newUser.companyName,
      });
      addUser(data.user as User & { password: string });
      toast.success(
        `Invite created for ${inviteName} <${inviteEmail}>${inviteRole ? ` as ${inviteRole}` : ""}`,
      );
    } catch (error) {
      console.error("Error uploading user", error);
    }

    setInviteName("");
    setInviteEmail("");
    setInviteRole("");
    setInviteCompanyName("");
    setShowInvite(false);
  };
  const genSecurePass = () => {
    return "RandomPass";
  };

  const rows = useMemo(() => {
    const q = query.toLowerCase();
    return users
      .filter(
        (m) =>
          !q ||
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q),
      )
      .map((m) => {
        return { m };
      });
  }, [users, query]);

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1400px]">
      <PageHeader
        title="Users"
        subtitle={`${users.length} ${users.length > 1 ? "users" : "user"} on file`}
      />

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, role, email..."
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
                {inviteRole && inviteRole === "manufacturer" && (
                  <div className="space-y-2">
                    <Label htmlFor="inv-com-name">Company Name</Label>
                    <Input
                      id="inv-com-name"
                      required
                      value={inviteCompanyName}
                      onChange={(e) => setInviteCompanyName(e.target.value)}
                    />
                  </div>
                )}
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
                <th className="text-left px-4 py-3">Role</th>
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
                    No User has been added yet. page.
                  </td>
                </tr>
              )}
              {rows.map(({ m }) => (
                <tr key={m.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{m.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-muted-foreground">
                      {m.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-muted-foreground">
                      {m.role}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={`font-normal ${m.is_active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                    >
                      <div>{m.is_active ? "Active" : "InActive"}</div>
                    </Badge>
                  </td>

                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        removeUser(m.id);
                        toast.success(`Removed ${m.name}`);
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
