// src/components/ui/SegmentedDateInput.tsx
import { useEffect, useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";
import IMask, { InputMask } from "imask";
import { Input } from "./Input";
import { MAX_AGE, MIN_AGE } from "@/constants/literal";
import { normalizeBackendDateOrDateTime } from "@/utils/datetime";

interface SegmentedDateInputProps {
  value?: Date | string | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  mode?: "birthday" | "generic"; // NEW
}

export default function SegmentedDateInput({
  value,
  onChange,
  minDate: propMin,
  maxDate: propMax,
  mode = "generic",
}: SegmentedDateInputProps) {
  const initial = normalizeBackendDateOrDateTime(
    value instanceof Date ? value.toISOString() : value
  );
  const [date, setDate] = useState<Date | null>(initial);
  const [showPicker, setShowPicker] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const maskRef = useRef<InputMask<any> | null>(null);
  const lastSyncedValueRef = useRef<string>("");

  // fallback for birthdays only
  const today = new Date();
  const birthdayMin = new Date(today.getFullYear() - MAX_AGE, today.getMonth(), today.getDate());
  const birthdayMax = new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate());

  const effectiveMin = propMin ?? (mode === "birthday" ? birthdayMin : undefined);
  const effectiveMax = propMax ?? (mode === "birthday" ? birthdayMax : undefined);

  function formatDate(d: Date) {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = String(d.getFullYear());
    return `${mm}/${dd}/${yyyy}`;
  }

  function parseInput(val: string) {
    if (!val || val.length !== 10) return null;
    const [mm, dd, yyyy] = val.split("/").map(Number);
    if (!mm || !dd || !yyyy) return null;
    const d = new Date(yyyy, mm - 1, dd);
    d.setHours(12);
    if (effectiveMin && d < effectiveMin) return null;
    if (effectiveMax && d > effectiveMax) return null;
    return d;
  }

  // set up IMask once
  useEffect(() => {
    if (!inputRef.current) return;

    maskRef.current = IMask(inputRef.current, {
      mask: "MM/DD/YYYY",
      lazy: true,
      autofix: true,
      blocks: {
        MM: { mask: IMask.MaskedRange, from: 1, to: 12 },
        DD: { mask: IMask.MaskedRange, from: 1, to: 31 },
        YYYY: { mask: "0000" },
      },
    });

    maskRef.current.on("accept", () => {
      const val = maskRef.current!.value;
      const parsed = parseInput(val);
      setDate(parsed);
      onChange(parsed);
    });

    return () => maskRef.current?.destroy();
  }, [onChange]);

  // update mask value when parent changes
  useEffect(() => {
    const d = normalizeBackendDateOrDateTime(
      value instanceof Date ? value.toISOString() : value
    );
    setDate(d);
    
    const formatted = d ? formatDate(d) : "";
    if (maskRef.current && lastSyncedValueRef.current !== formatted) {
      maskRef.current.value = formatted;
      lastSyncedValueRef.current = formatted;
    }
  }, [value]);

  const handleDateSelect = (d: Date | null) => {
    if (!d) return;
    d.setHours(12);
    setDate(d);
    if (maskRef.current) {
      maskRef.current.value = formatDate(d);
    }
    onChange(d);
    setShowPicker(false);
  };

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex items-center border border-green bg-transparent rounded-md pr-3">
        <Input
          ref={inputRef}
          placeholder="MM/DD/YYYY"
          className="bg-transparent border-none focus:outline-none shadow-none w-full"
        />
        <button
          type="button"
          onClick={() => setShowPicker((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 \
            hover:text-select focus-visible:outline-none focus-visible:text-select"
          aria-label="Toggle calendar"
        >
          <Calendar size={18} />
        </button>
      </div>

      {showPicker && (
        <div className="absolute z-50 mt-1 left-1/2 transform -translate-x-1/2">
          <DatePicker
            inline
            selected={date ?? undefined}
            openToDate={date ?? undefined} 
            onChange={handleDateSelect}
            minDate={effectiveMin}
            maxDate={effectiveMax}
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={50}
          />
        </div>
      )}
    </div>
  );
}
