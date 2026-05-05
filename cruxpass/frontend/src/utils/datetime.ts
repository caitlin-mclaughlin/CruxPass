// /utils/datetime.ts
import { parse, isValid, format } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

const MT_TZ = 'America/Denver';

export function parseBackendLocal(s: string | null): Date | null {
  if (!s) return null;
  // backend sends "2025-08-17T17:00:00" (no zone)
  const normalized = s.replace(' ', 'T');
  const local = parse(normalized, "yyyy-MM-dd'T'HH:mm:ss", new Date());
  if (!isValid(local)) return null;

  return fromZonedTime(local, MT_TZ);
}

// What the backend expects when you POST/PUT
export function formatForApi(d: Date): string {
  return formatInTimeZone(d, MT_TZ, "yyyy-MM-dd'T'HH:mm:ss");
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

interface HeatTimeFormatOptions {
  showDate?: boolean;
  showWeekday?: boolean;
  timezone?: string;
}

export function formatHeatTimeRange(
  startTime: string | null,
  durationMinutes: number | null,
  {
    showDate = false,
    showWeekday = false,
    timezone,
  }: HeatTimeFormatOptions = {}
): string {
  if (!startTime || !durationMinutes) return "Time TBD";

  const start = new Date(startTime);

  const end = new Date(start.getTime() + durationMinutes * 60_000);

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  });

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(showWeekday && { weekday: "short" }),
    timeZone: timezone,
  });

  const timeRange =
    `${timeFormatter.format(start)} – ${timeFormatter.format(end)}`;

  if (!showDate) return timeRange;

  return `${dateFormatter.format(start)} • ${timeRange}`;
}

export function displayDateTime(s: string | null): string {
  const date = normalizeBackendDateOrDateTime(s);
  if (!date) return '—';

  // If input included a time component, show with time
  return s && s.includes("T")
    ? prettyDateTime(date)
    : prettyDate(date);
}

export function displayShortDateTime (s: string | null): string {
  const date = normalizeBackendDateOrDateTime(s);
  if (!date) return '—';

  // If input included a time component, show with time
  return s && s.includes("T")
    ? formatInTimeZone(date, MT_TZ, "h:mm a '–' MM/dd/yyyy")
    : prettyDate(date);
}

// Takes either yyyy-MM-dd or yyyy-MM-ddTHH:mm:ss and gives back a Date
export function normalizeBackendDateOrDateTime(s: string | null): Date | null {
  if (!s) return null;
  if(s.includes('.')) {
    s = s.split(".")[0];
  }

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

export function ensureDate(d: Date | string | null): Date | null {
  if (!d) return null;
  return d instanceof Date ? d : new Date(d);
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
            : formatForApi(date)
      };
    });
  };
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60000);
}
