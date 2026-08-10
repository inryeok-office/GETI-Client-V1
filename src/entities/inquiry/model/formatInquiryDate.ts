export function formatInquiryDate(value: string): string {
  const date = value.slice(0, 10).replaceAll('-', '.');
  return date.length === 10 ? date : value;
}
