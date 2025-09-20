// /utils/datetime.ts
import { parse, isValid } from 'date-fns';
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

// Takes either yyyy-MM-dd or yyyy-MM-ddTHH:mm:ss and gives back a Date
export function normalizeBackendDateOrDateTime(s?: string | null): Date | null {
  if (!s) return null;

  // If string already includes time
  if (s.includes("T")) {
    return parseBackendLocal(s); // already handles "yyyy-MM-ddTHH:mm:ss"
  }

  // If just a date (yyyy-MM-dd), treat it as midnight local
  const parsed = parse(s, "yyyy-MM-dd", new Date());
  return isValid(parsed) ? parsed : null;
}

/*
export function asMontanaWallClock(d: Date): Date {
  return toZonedTime(d, MT_TZ); // v3 name
}*/

/**
 * Creates an onChange handler for date inputs that updates a field in formData.
 * 
 * @param field - the field in formData to update (e.g. "deadline", "startDate")
 * @param setFormData - your setFormData state updater
 * @param mode - "date" (yyyy-MM-dd) or "datetime" (ISO string with time)
 */
export function makeDateChangeHandler<T extends object>(
  field: keyof T,
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  mode: "date" | "datetime" = "datetime"
) {
  return (date: Date | null) => {
    setFormData(prev => {
      if (!prev) return prev; // nothing to update if null

      return {
        ...prev,
        [field]:
          !date
            ? ""
            : mode === "date"
            ? date.toISOString().split("T")[0]
            : date.toISOString(),
      };
    });
  };
}
