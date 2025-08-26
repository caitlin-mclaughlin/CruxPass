// /utils/datetime.ts
import { parse, format, isValid } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

const MT_TZ = 'America/Denver';

export function parseBackendLocal(s?: string | null): Date | null {
  if (!s) return null;
  // backend sends "2025-08-17T17:00:00" (no zone)
  const normalized = s.replace(' ', 'T');
  const local = parse(normalized, "yyyy-MM-dd'T'HH:mm:ss", new Date());
  if (!isValid(local)) return null;

  return fromZonedTime(local, MT_TZ);
}

// What the backend expects when you put/PUT
export function formatForApi(d: Date): string {
  return formatInTimeZone(d, MT_TZ, 'yyyy-MM-dd HH:mm:ss');
}

// Pretty display with time kept intact
export function pretty(d: Date): string {
  return formatInTimeZone(d, MT_TZ, "h:mm a 'on' MMMM d, yyyy");
}

export function displayDateTime(s?: string | null): string {
  const time = s ? parseBackendLocal(s) : null;
  return time ? pretty(time) : '—';
}

/*
export function asMontanaWallClock(d: Date): Date {
  return toZonedTime(d, MT_TZ); // v3 name
}*/
