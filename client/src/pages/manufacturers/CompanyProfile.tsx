import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  useData,
  SECTORAL_GROUPS,
  NIGERIAN_STATES,
} from "../../lib/store";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { PageHeader } from "../../components/page-header";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Section from "../../components/forms/Section";
import Field from "../../components/forms/Field";
import type { Manufacturer } from "../../types/manufacturer.types";

function CompanyProfile() {
  const { user } = useAuth(); //useAuth((s) => s.user)!;
  const { manufacturers, addManufacturer, updateManufacturer } = useData();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  if (!user) {
    return <>No user found</>;
  }

  const existing = useMemo(() => {
    if (user.email) {
      const m = manufacturers.find((x) => x.email === user.email);
      return { m };
    }
    return { m: undefined };
  }, [manufacturers, user.email]);

  const [profile, setProfile] = useState({
    company: existing.m?.company ?? "",
    contactPerson: existing.m?.contactPerson ?? user.name ?? "",
    email: existing.m?.email ?? user.email,
    phone: existing.m?.phone ?? "",
    branch: existing.m?.branch ?? "",
    sectoralGroup: existing.m?.sectoralGroup ?? SECTORAL_GROUPS[0],
    subSector: existing.m?.subSector ?? "",
    state: existing.m?.state ?? NIGERIAN_STATES[0].state,
    lat: existing.m?.lat?.toString() ?? "",
    lng: existing.m?.lng?.toString() ?? "",
  });

  const googleMapsApiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    process.env.REACT_APP_GOOGLE_MAPS_API_KEY ||
    "";

  const loadGoogleMapsScript = () => {
    return new Promise<void>((resolve, reject) => {
      if ((window as any).google?.maps) {
        resolve();
        return;
      }

      const scriptId = "google-maps-script";
      if (document.getElementById(scriptId)) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Unable to load Google Maps"));
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    if (!isMapOpen || !googleMapsApiKey) {
      return;
    }

    loadGoogleMapsScript()
      .then(() => {
        const google = (window as any).google;
        if (!mapRef.current || !google) {
          return;
        }

        const initialLat = parseFloat(profile.lat) || 6.5244;
        const initialLng = parseFloat(profile.lng) || 3.3792;
        const center = { lat: initialLat, lng: initialLng };

        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom: 6,
        });

        const marker = new google.maps.Marker({
          position: center,
          map,
        });

        map.addListener("click", (event: any) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          marker.setPosition({ lat, lng });
          setProfile((prev) => ({
            ...prev,
            lat: lat.toFixed(6),
            lng: lng.toFixed(6),
          }));
        });
      })
      .catch(() => {
        toast.error("Unable to load Google Maps");
      });
  }, [isMapOpen, googleMapsApiKey, profile.lat, profile.lng]);

  const captureCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setProfile((prev) => ({
          ...prev,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
        }));
        toast.success("Live location captured.");
      },
      () => {
        toast.error("Unable to capture live location.");
      },
    );
  };

  const openMapModal = () => {
    if (!googleMapsApiKey) {
      toast.error("Google Maps API key is not configured.");
      return;
    }

    setIsMapOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let manufacturerEmail = user.email ;//?? existing.m?.id;
      const manufacturer = findManufacturerByEmail(manufacturerEmail);
      if (!manufacturer) {
        const loc =
          NIGERIAN_STATES.find((s) => s.state === profile.state) ??
          NIGERIAN_STATES[0];
        const jitter = () => (Math.random() - 0.5) * 0.08;
        const m: Manufacturer = {
          id: manufacturers.length,
          ...profile,
          city: loc.city,
          lat: parseFloat(profile.lat) || loc.lat + jitter(),
          lng: parseFloat(profile.lng) || loc.lng + jitter(),
          createdAt: new Date().toISOString(),
        };
        addManufacturer(m);
        manufacturerEmail = m.email;
        console.log("adding new manufacturer");
        // link company to user
        user.email = m.email;
      } else {
        
        console.log(manufacturer);
        if (manufacturer) {
          const loc =
            NIGERIAN_STATES.find((s) => s.state === profile.state) ??
            NIGERIAN_STATES[0];
          updateManufacturer(manufacturer.id, {
            ...profile,
            city: loc.city,
            lat: parseFloat(profile.lat) || manufacturer.lat || loc.lat,
            lng: parseFloat(profile.lng) || manufacturer.lng || loc.lng,
          });
        }
      }
      toast.success("Company's profile updated");
    } catch (error) {
      console.error("Failed to update company's profile:", error);
      toast.error("Unable to update company's profile.");
    }
  };
  const findManufacturerByEmail =(email: string) =>{
    const manufacturer =manufacturers.find((m)=> m.email === email);
    return manufacturer;
  }

  return (
    <div className="p-6 lg:p-10 space-y-6 ">
      <PageHeader title="Company Profile for manufacturers" />

      <form onSubmit={handleSubmit} className="space-y-15 ">
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
            <Field label="Latitude">
              <Input
                value={profile.lat}
                onChange={(e) => setProfile({ ...profile, lat: e.target.value })}
                placeholder="Use live capture or map selection"
                required
              />
            </Field>
            <Field label="Longitude">
              <Input
                value={profile.lng}
                onChange={(e) => setProfile({ ...profile, lng: e.target.value })}
                placeholder="Use live capture or map selection"
                required
              />
            </Field>
            <Field label="Location capture">
              <div className="flex flex-col gap-2 grid sm:grid-cols-2">
                <Button type="button" onClick={captureCurrentLocation}>
                  Capture live location
                </Button>
                <Button type="button" onClick={openMapModal}>
                  Select location on map
                </Button>
              </div>
            </Field>
          </div>
        </Section>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Data is stored locally for this MVP. Nothing leaves your browser.
          </p>
          <Button type="submit" size="lg">
            <CheckCircle2 className="w-4 h-4 mr-2" /> Save Info
          </Button>
        </div>

        {isMapOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-background shadow-2xl">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="text-lg font-semibold">Select a location on the map</h2>
                <button
                  type="button"
                  className="text-sm text-muted-foreground"
                  onClick={() => setIsMapOpen(false)}
                >
                  Close
                </button>
              </div>
              <div ref={mapRef} className="h-96" />
              <div className="flex items-center justify-between gap-4 border-t px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Click on the map to set latitude and longitude.
                </p>
                <Button type="button" onClick={() => setIsMapOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </form>
    </div>
  );
}

export default CompanyProfile;
