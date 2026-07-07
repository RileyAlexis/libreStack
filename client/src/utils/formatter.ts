export function formatNumber(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatStorageSize(kb: number): string {
  const mb = kb / 1024;
  const gb = mb / 1024;
  const tb = gb / 1024;

  if (tb >= 1) return `${formatNumber(tb)} TB`;
  if (gb >= 1) return `${formatNumber(gb)} GB`;
  return `${formatNumber(mb)} MB`;
}
