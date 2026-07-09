export function formatNaira(n: number): string {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toFixed(0)}`;
}

export function formatFullNaira(n: number): string {
  return `₦${n.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}