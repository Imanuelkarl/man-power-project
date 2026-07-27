export function formatNaira(n: number): string {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toFixed(0)}`;
}

export function formatFullNaira(n: number): string {
  return `₦${n.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export function formatPower(watts: number): string {
  if (!isFinite(watts)) return "0 W";
  const n = Math.abs(watts);
  const sign = watts < 0 ? "-" : "";
  if (n >= 1_000_000_000) return `${sign}${(n / 1_000_000_000).toFixed(2)} GW`;
  if (n >= 1_000_000) return `${sign}${(n / 1_000_000).toFixed(2)} MW`;
  if (n >= 1_000) return `${sign}${(n / 1_000).toFixed(2)} kW`;
  return `${sign}${n.toFixed(0)} W`;
}
