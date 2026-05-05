import { DEFAULT_COMPETITOR_GROUPS, DefaultCompetitorGroup, DefaultCompetitorGroupMap, Division, DivisionEnumMap, GroupDivisionKey } from '@/constants/enum'
import { Address } from '@/models/domain';

export function formatPhoneNumber(value: string): string {
  if (!value) return ""; 
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
} | Address): string {
  if (!location) return '';
  const line1 = location.apartmentNumber
    ? `${location.streetAddress}, Apt ${location.apartmentNumber}`
    : location.streetAddress

  const line2 = `${location.city}, ${location.state} ${location.zipCode}`

  return `${line1},\n${line2}`
}

export function formatCityState(location: {
  streetAddress: string;
  apartmentNumber?: string;
  city: string;
  state: string;
  zipCode: string;
} | Address): string {
  if (!location) return '';

  return `${location.city}, ${location.state}`
}

export function formatDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export function formatDateTimePretty(isoString: string): string {
  const date = new Date(isoString)

  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }

  // Format parts separately to insert "on" in the middle
  const formatter = new Intl.DateTimeFormat('en-US', options)
  const parts = formatter.formatToParts(date)

  const time = `${parts.find(p => p.type === 'hour')?.value}:${parts.find(p => p.type === 'minute')?.value} ${parts.find(p => p.type === 'dayPeriod')?.value}`
  const month = parts.find(p => p.type === 'month')?.value
  const day = parts.find(p => p.type === 'day')?.value
  const year = parts.find(p => p.type === 'year')?.value

  return `${time} on ${month} ${day}, ${year}`
}

export function formatGroupsInOrder(groups?: string[] | null): string {
  const safeGroups = Array.isArray(groups)
    ? groups.filter((g): g is string => typeof g === 'string' && g.length > 0)
    : [];
  if (safeGroups.length === 0) return "—";

  const ordered = DEFAULT_COMPETITOR_GROUPS.filter(competitorGroup => safeGroups.includes(competitorGroup))
  return ordered.length > 0
    ? ordered.map(competitorGroup => DefaultCompetitorGroupMap[competitorGroup]).join(', ')
    : safeGroups.join(', ')
}

export function formatGroupDivision(group: DefaultCompetitorGroup, division: Division): string {
  return `${DivisionEnumMap[division]}'s ${DefaultCompetitorGroupMap[group]}`
}

export function parseAddress(address: string): Address {
  // Naive parser: assumes "123 Main St, Madison, WI 53703"
  const parts = address.split(',')
  const streetAddress = parts[0]?.trim() || ''
  const city = parts[1]?.trim() || ''
  const stateZip = parts[2]?.trim().split(' ') || []

  return {
    streetAddress,
    city,
    state: stateZip[0] || '',
    zipCode: stateZip[1] || ''
  }
}

export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (from === to) return arr;

  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);

  return copy;
}
