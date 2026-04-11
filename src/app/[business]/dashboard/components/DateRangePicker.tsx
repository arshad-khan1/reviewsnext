"use client";

import * as React from "react";
import {
  format,
  startOfToday,
  endOfToday,
  subDays,
  startOfWeek,
  startOfMonth,
} from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  className?: string;
  value?: { from?: Date; to?: Date };
  onChange: (range: { from?: Date; to?: Date } | undefined) => void;
}

export function DateRangePicker({
  className,
  value,
  onChange,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(
    value ? { from: value.from, to: value.to } : undefined,
  );

  // Sync internal state with external value changes (e.g. clear all)
  React.useEffect(() => {
    if (!value?.from && !value?.to) {
      setDate(undefined);
    }
  }, [value]);

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (range?.from && range?.to) {
      onChange({ from: range.from, to: range.to });
    } else if (!range) {
      onChange(undefined);
    }
  };

  const applyPreset = (preset: string) => {
    let from: Date;
    let to: Date = new Date();

    switch (preset) {
      case "today":
        from = startOfToday();
        to = endOfToday();
        break;
      case "week":
        from = startOfWeek(new Date(), { weekStartsOn: 1 });
        break;
      case "month":
        from = startOfMonth(new Date());
        break;
      case "last7":
        from = subDays(new Date(), 7);
        break;
      case "last30":
        from = subDays(new Date(), 30);
        break;
      default:
        return;
    }

    const range = { from, to };
    setDate(range);
    onChange(range);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "h-10 w-[260px] justify-start text-left font-bold rounded-xl border-border/50 bg-card hover:bg-muted/50 transition-all",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Filter by Date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 flex flex-col md:flex-row"
          align="start"
        >
          <div className="flex flex-col gap-2 p-3 border-r border-border bg-muted/20 min-w-[140px]">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2 mb-1">
              Presets
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start font-bold h-8 text-xs hover:bg-primary/10 hover:text-primary"
              onClick={() => applyPreset("today")}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start font-bold h-8 text-xs hover:bg-primary/10 hover:text-primary"
              onClick={() => applyPreset("week")}
            >
              This Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start font-bold h-8 text-xs hover:bg-primary/10 hover:text-primary"
              onClick={() => applyPreset("month")}
            >
              This Month
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start font-bold h-8 text-xs hover:bg-primary/10 hover:text-primary"
              onClick={() => applyPreset("last7")}
            >
              Last 7 Days
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start font-bold h-8 text-xs hover:bg-primary/10 hover:text-primary"
              onClick={() => applyPreset("last30")}
            >
              Last 30 Days
            </Button>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={1}
            translate="no"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
