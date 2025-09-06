// src/components/ui/SegmentedDateInput.tsx
import { useEffect, useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";
import IMask from "imask";
import { Input } from "./Input";
import { MAX_AGE, MIN_AGE } from "@/constants/literal";

interface SegmentedDateInputProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
}

export default function SegmentedDateInput({ value, onChange }: SegmentedDateInputProps) {
  const [date, setDate] = useState<Date | null>(value ?? null);
  const [inputValue, setInputValue] = useState(value ? formatDate(value) : "");
  const [showPicker, setShowPicker] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const today = new Date();
  const minDate = new Date(today.getFullYear() - MAX_AGE, today.getMonth(), today.getDate());
  const maxDate = new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate());

  // --- format date to MM/DD/YYYY ---
  function formatDate(d: Date) {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = String(d.getFullYear());
    return `${mm}/${dd}/${yyyy}`;
  }

  // --- parse typed string to Date ---
  function parseInput(val: string) {
    if (!val || val.length !== 10) return null;
    const [mm, dd, yyyy] = val.split("/").map(Number);
    if (!mm || !dd || !yyyy) return null;
    const d = new Date(yyyy, mm - 1, dd);
    d.setHours(12);
    if (d >= minDate && d <= maxDate) return d;
    return null;
  }

  // --- sync parent value ---
  useEffect(() => {
    if (value) {
      setDate(value);
      setInputValue(formatDate(value));
    } else {
      setDate(null);
      setInputValue("");
    }
  }, [value]);

  // --- setup IMask for input ---
  useEffect(() => {
    if (!inputRef.current) return;

    const mask = IMask(inputRef.current, {
      mask: "MM/DD/YYYY",
      lazy: true,
      overwrite: true,
      autofix: true,
      blocks: {
        MM: { mask: IMask.MaskedRange, from: 1, to: 12, autofix: true },
        DD: { mask: IMask.MaskedRange, from: 1, to: 31, autofix: true },
        YYYY: { mask: "0000" }
      },
    });

    mask.value = inputValue;

    mask.on("accept", () => {
      setInputValue(mask.value);
      const parsed = parseInput(mask.value);
      setDate(parsed);
      onChange(parsed);
    });

    return () => mask.destroy();
  }, [inputValue, onChange]);

  const handleDateSelect = (d: Date | null) => {
    if (!d) return;
    d.setHours(12);
    setDate(d);
    setInputValue(formatDate(d));
    onChange(d);
    setShowPicker(false);
  };

  // --- close date picker on outside click ---
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
    <div className="relative w-full">
      <div className="flex items-center bg-shadow rounded-md pr-3">
        <Input
          ref={inputRef}
          placeholder="MM/DD/YYYY"
          value={inputValue}
          onChange={() => {}} // controlled by IMask
          className="bg-transparent border-none focus:outline-none shadow-none w-full"
        />
        <button
          type="button"
          onClick={() => setShowPicker((prev) => !prev)}
          className="ml-2 text-green flex items-center"
          aria-label="Toggle calendar"
        >
          <Calendar size={18} />
        </button>
      </div>

      {showPicker && (
        <div className="absolute z-50 mt-1 left-1/2 transform -translate-x-1/2">
          <DatePicker
            inline
            selected={date}
            onChange={handleDateSelect}
            minDate={minDate}
            maxDate={maxDate}
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={50}
          />
        </div>
      )}
    </div>
  );
}
