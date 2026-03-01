// src/components/DateField.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, parse, isValid } from "date-fns";

// Format used in the input
const DISPLAY_FMT = "dd/MM/yyyy";

// Convert ISO string -> Date
function isoToDate(iso?: string | null) {
  if (!iso) return undefined;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? undefined : d;
}

// Convert Date -> ISO "yyyy-MM-dd"
function dateToISO(d?: Date) {
  if (!d) return undefined;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Convert display text -> Date (dd/MM/yyyy)
function textToDate(s: string) {
  const d = parse(s, DISPLAY_FMT, new Date());
  return isValid(d) ? d : undefined;
}

export type DateFieldProps = {
  label: string;
  value?: string;                  // ISO string (yyyy-MM-dd)
  onChange: (iso?: string) => void;
  placeholder?: string;            // default "dd/mm/yyyy"
  fromDate?: Date;                 // optional min
  toDate?: Date;                   // optional max
};

export default function DateField({
  label,
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
  fromDate,
  toDate,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(() => isoToDate(value), [value]);

  const displayValue = useMemo(
    () => (selected ? format(selected, DISPLAY_FMT) : ""),
    [selected]
  );

  const pick = (d?: Date) => {
    onChange(d ? dateToISO(d) : undefined);
    setOpen(false);
  };

  const onTextChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const txt = e.target.value;
    const d = textToDate(txt);
    if (d) onChange(dateToISO(d));
    else if (!txt) onChange(undefined);
  };

  return (
    <div className="grid gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>

      <div ref={anchorRef} className="relative">
        <div className="flex items-center rounded-md border border-slate-300 px-3 py-2 focus-within:ring ring-sky-200">
          <input
            type="text" // IMPORTANT: not "date"
            className="w-full outline-none"
            placeholder={placeholder}
            value={displayValue}
            onChange={onTextChange}
            onFocus={() => setOpen(true)}
          />
          <button
            type="button"
            className="ml-2 text-slate-500"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open calendar"
          >
            <i className="fa-solid fa-calendar" />
          </button>
        </div>

        {open && (
          <div
            className="absolute z-[3000] mt-1 rounded-md border border-slate-200 bg-white p-2 shadow-xl"
            onMouseDown={(e) => e.preventDefault()} // keep focus in input
          >
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={pick}
              captionLayout="dropdown-buttons"
              fromYear={2000}
              toYear={2100}
              fromDate={fromDate}
              toDate={toDate}
              footer={
                <div className="flex items-center justify-between px-2 pt-2 text-sky-700">
                  <button
                    type="button"
                    onClick={() => pick(undefined)}
                    className="hover:underline"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => pick(new Date())}
                    className="hover:underline"
                  >
                    Today
                  </button>
                </div>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
