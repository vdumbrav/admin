import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date and time",
  disabled,
}: DateTimePickerProps) {
  // Local state mirrors external value but lets the user pick parts in any order.
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(value);
  const [hour, setHour] = React.useState<string>(value ? format(value, "HH") : "00");
  const [minute, setMinute] = React.useState<string>(value ? format(value, "mm") : "00");
  const [isOpen, setIsOpen] = React.useState(false);

  // Keep local state in sync when parent value changes.
  React.useEffect(() => {
    setInternalDate(value);
    setHour(value ? format(value, "HH") : "00");
    setMinute(value ? format(value, "mm") : "00");
  }, [value]);

  const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")), []);
  const minutes = React.useMemo(() => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")), []);

  // Compose date + time and emit.
  const emit = (date: Date | undefined, hh = hour, mm = minute) => {
    if (!date) {
      onChange?.(undefined);
      return;
    }
    const d = new Date(date);
    d.setHours(Number(hh), Number(mm), 0, 0);
    setInternalDate(d);
    onChange?.(d);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "min-w-[260px] justify-start text-left font-normal",
            !internalDate && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {internalDate ? format(internalDate, "dd/MM/yyyy HH:mm") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          {/* Date picker */}
          <Calendar
            mode="single"
            selected={internalDate}
            onSelect={(d) => {
              setInternalDate(d);
              emit(d, hour, minute);
            }}
          />

          {/* Time picker (24h, no native input) */}
          <div className="mt-3 border-t pt-3">
            <label className="mb-2 block text-sm font-medium">Time</label>
            <div className="flex items-center gap-2">
              {/* Hours */}
              <Select
                value={hour}
                onValueChange={(h) => {
                  setHour(h);
                  emit(internalDate, h, minute);
                }}
              >
                <SelectTrigger className="w-[90px]">
                  <SelectValue placeholder="HH" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {hours.map((h) => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-sm text-muted-foreground">:</span>

              {/* Minutes */}
              <Select
                value={minute}
                onValueChange={(m) => {
                  setMinute(m);
                  emit(internalDate, hour, m);
                }}
              >
                <SelectTrigger className="w-[90px]">
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {minutes.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Done button */}
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
                disabled={!internalDate}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
