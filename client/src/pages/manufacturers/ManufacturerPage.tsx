import { useEffect, useMemo, useState } from "react";
import { useData } from "../../lib/store";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/page-header";
import { formatNaira } from "../../lib/format";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function ManufacturersPage() {
  const {
    manufacturers,
    questionnaires,
    removeManufacturer,
    fetchManufacturers,
    manufacturersHydrated,
    loadingManufacturers,
    addManufacturer,
  } = useData();
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!manufacturersHydrated && !loadingManufacturers) {
      void fetchManufacturers();
    }
  }, [fetchManufacturers, loadingManufacturers, manufacturersHydrated]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    try {
      const manufacturer = await addManufacturer({
        name: newName.trim(),
        email: newEmail.trim(),
      });
      toast.success(`${manufacturer.name} was created`);
      setNewName("");
      setNewEmail("");
      setShowCreate(false);
    } catch {
      toast.error("Unable to create manufacturer.");
    } finally {
      setCreating(false);
    }
  };

  const rows = useMemo(() => {
    const q = query.toLowerCase();
    return manufacturers
      .filter(
        (m) =>
          !q ||
          m.name.toLowerCase().includes(q) ||
          m.state?.toLowerCase().includes(q) ||
          m.sectoral_group?.toLowerCase().includes(q),
      )
      .map((m) => {
        const ques = questionnaires.find((x) => x.manufacturerId === m.manId);
        return { m, q: ques };
      });
  }, [manufacturers, questionnaires, query]);

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1400px]">
      <PageHeader
        title="Manufacturers"
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
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create manufacturer
          </Button>
        </div>
        {showCreate && (
          <div className="border-b border-border p-4">
            <form
              onSubmit={handleCreate}
              className="flex flex-wrap items-end gap-3"
            >
              <div className="space-y-2">
                <label
                  htmlFor="manufacturer-name"
                  className="text-xs font-medium"
                >
                  Company name
                </label>
                <Input
                  id="manufacturer-name"
                  required
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="manufacturer-email"
                  className="text-xs font-medium"
                >
                  Company email
                </label>
                <Input
                  id="manufacturer-email"
                  type="email"
                  required
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                />
              </div>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
            </form>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Location</th>
                <th className="text-left px-4 py-3">Sector</th>
                <th className="text-right px-4 py-3">Capacity</th>
                <th className="text-right px-4 py-3">Production</th>
                <th className="text-right px-4 py-3">Workers</th>
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
                    No manufacturers yet. Generate dummy data from the Admin
                    page.
                  </td>
                </tr>
              )}
              {rows.map(({ m, q }) => (
                <tr key={m.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.contact_person}
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
                      {m.sectoral_group}
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
