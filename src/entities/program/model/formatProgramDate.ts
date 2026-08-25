/** `2026-07-20` → `2026.07.20`. 형식이 다르면 원본을 그대로 돌려준다. */
export function formatProgramDate(value: string): string {
  const date = value.slice(0, 10).replaceAll('-', '.');
  return date.length === 10 ? date : value;
}

/** Figma는 기간을 en dash로 잇는다: `2026.07.20 – 2026.08.10`. */
export function formatProgramPeriod(startDate: string, endDate: string): string {
  return `${formatProgramDate(startDate)} – ${formatProgramDate(endDate)}`;
}
