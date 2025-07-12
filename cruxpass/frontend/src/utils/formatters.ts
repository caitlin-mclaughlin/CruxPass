export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10); // max 10 digits

  const parts = [];
  if (digits.length > 0) parts.push("(" + digits.slice(0, 3));
  if (digits.length >= 4) parts.push(") " + digits.slice(3, 6));
  if (digits.length >= 7) parts.push("-" + digits.slice(6, 10));

  return parts.join("");
}

export function stripNonDigits(str: string): string {
  return str.replace(/\D/g, '');
}
