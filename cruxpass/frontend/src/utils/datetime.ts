// /utils/datetime.ts
import { parse, isValid, format } from 'date-fns';
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

// What the backend expects when you POST/PUT
export function formatForApi(d: Date): string {
  return formatInTimeZone(d, MT_TZ, 'yyyy-MM-dd HH:mm:ss');
}

// Pretty display with time included
export function prettyDateTime(d: Date): string {
  return formatInTimeZone(d, MT_TZ, "h:mm a '–' MMMM d, yyyy");
}

// Pretty display for date-only (no time)
export function prettyDate(d: Date): string {
  return formatInTimeZone(d, MT_TZ, "MMMM d, yyyy");
}

// Collapsed view: MM/dd/yyyy
export function formatDate(d: Date): string {
  return formatInTimeZone(d, MT_TZ, "MM/dd/yyyy");
}

export function displayDateTime(s: string | null): string {
  const date = normalizeBackendDateOrDateTime(s);
  if (!date) return '—';

  // If input included a time component, show with time
  return s && s.includes("T")
    ? prettyDateTime(date)
    : prettyDate(date);
}

// Takes either yyyy-MM-dd or yyyy-MM-ddTHH:mm:ss and gives back a Date
export function normalizeBackendDateOrDateTime(s: string | null): Date | null {
  if (!s) return null;

  if (s.includes("T")) {
    return parseBackendLocal(s); // handles datetime
  }

  // Just a date (yyyy-MM-dd), parse as plain date
  const parsed = parse(s, "yyyy-MM-dd", new Date());
  return isValid(parsed) ? parsed : null;
}

// Collapsed view: MM/dd/yyyy from backend string
export function formatDateFromString(s: string | null): string {
  const date = normalizeBackendDateOrDateTime(s);
  return date ? formatDate(date) : "—";
}

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
