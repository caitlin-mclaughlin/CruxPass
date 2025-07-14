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

export function formatAddress(location: {
      streetAddress: string;
      apartmentNumber?: string;
      city: string;
      state: string;
      zipCode: string;
    }): string {
  if (!location) return '';
  const apt = location.apartmentNumber ? `, Apt ${location.apartmentNumber}` : '';
  return `${location.streetAddress}${apt}, ${location.city}, ${location.state} ${location.zipCode}`;
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}
