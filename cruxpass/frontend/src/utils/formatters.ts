import { COMPETITOR_GROUPS, CompetitionEnumMap } from '@/constants/enum'
import { Address } from '@/models/domain';

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
    } | Address): string {
  if (!location) return '';
  const line1 = location.apartmentNumber
    ? `${location.streetAddress}, Apt ${location.apartmentNumber}`
    : location.streetAddress

  const line2 = `${location.city}, ${location.state} ${location.zipCode}`

  return `${line1},\n${line2}`
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

export function formatGroupsInOrder(groups: string[]): string {
  const ordered = COMPETITOR_GROUPS.filter(competitorGroup => groups.includes(competitorGroup))
  return ordered.map(competitorGroup => CompetitionEnumMap[competitorGroup]).join(', ')
}

export function parseAddress(address: string) {
    // Naive parser: assumes "123 Main St, Madison, WI 53703"
    const parts = address.split(',')
    const streetAddress = parts[0]?.trim() || ''
    const city = parts[1]?.trim() || ''
    const stateZip = parts[2]?.trim().split(' ') || []

    return {
      streetAddress,
      apartmentNumber: null,
      city,
      state: stateZip[0] || '',
      zipCode: stateZip[1] || ''
    }
  }
