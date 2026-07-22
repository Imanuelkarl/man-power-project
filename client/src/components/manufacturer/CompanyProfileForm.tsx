import { useMemo, useState } from "react";
import {
  useAuth,
  useData,
  SECTORAL_GROUPS,
  NIGERIAN_STATES,
} from "../../lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../ui/input";;
import Field from "../forms/Field";
import Section from "../forms/Section";
import type { Manufacturer } from "../../types/manufacturer.types";
export function CompanyProfile() {
  const user = useAuth((s) => s.user)!;
  const { manufacturers, questionnaires, addManufacturer } = useData();

  const existing = useMemo(() => {
    if (user.companyId) {
      const m = manufacturers.find((x) => x.email === user.email);
      const q = questionnaires.find(
        (x) => x.manufacturerId === m?.id && x.period === "H1 2026",
      );
      return { m, q };
    }
    return { m: undefined, q: undefined };
  }, [manufacturers, questionnaires, user.companyId]);
  const [profile, setProfile] = useState({
    company: existing.m?.company ?? "",
    contactPerson: existing.m?.contactPerson ?? user.name,
    email: existing.m?.email ?? user.email,
    phone: existing.m?.phone ?? "",
    branch: existing.m?.branch ?? "",
    sectoralGroup: existing.m?.sectoralGroup ?? SECTORAL_GROUPS[0],
    subSector: existing.m?.subSector ?? "",
    state: existing.m?.state ?? NIGERIAN_STATES[0].state,
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let manufacturerId = user.companyId ?? existing.m?.id;
    if (!manufacturerId) {
      const loc =
        NIGERIAN_STATES.find((s) => s.state === profile.state) ??
        NIGERIAN_STATES[0];
      const jitter = () => (Math.random() - 0.5) * 0.08;
      const m: Manufacturer = {
        id: manufacturerId as number,
        ...profile,
        city: loc.city,
        lat: loc.lat + jitter(),
        lng: loc.lng + jitter(),
        createdAt: new Date().toISOString(),
      };
      addManufacturer(m);
      manufacturerId = m.id;
      // link company to user
      
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="A. Company Profile">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name of Company">
              <Input
                value={profile.company}
                onChange={(e) =>
                  setProfile({ ...profile, company: e.target.value })
                }
                required
              />
            </Field>
            <Field label="Contact Person">
              <Input
                value={profile.contactPerson}
                onChange={(e) =>
                  setProfile({ ...profile, contactPerson: e.target.value })
                }
                required
              />
            </Field>
            <Field label="E-mail">
              <Input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                required
              />
            </Field>
            <Field label="Mobile Telephone Number(s)">
              <Input
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                required
              />
            </Field>
            <Field label="Branch">
              <Input
                value={profile.branch}
                onChange={(e) =>
                  setProfile({ ...profile, branch: e.target.value })
                }
              />
            </Field>
            <Field label="State">
              <Select
                value={profile.state}
                onValueChange={(v) => setProfile({ ...profile, state: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(new Set(NIGERIAN_STATES.map((s) => s.state))).map(
                    (s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Sectoral Group">
              <Select
                value={profile.sectoralGroup}
                onValueChange={(v) =>
                  setProfile({ ...profile, sectoralGroup: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTORAL_GROUPS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Sub-sector">
              <Input
                value={profile.subSector}
                onChange={(e) =>
                  setProfile({ ...profile, subSector: e.target.value })
                }
              />
            </Field>
          </div>
        </Section>
      </form>
    </>
  );
}

export default CompanyProfile;