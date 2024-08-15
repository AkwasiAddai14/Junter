import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, DateRange, SelectSingleEventHandler, SelectRangeEventHandler } from "react-day-picker";
import { cn } from "@/app/lib/utils";
import { nl } from "date-fns/locale";
import { buttonVariants } from "@/app/components/ui/button";
import { format, parse } from "date-fns";
import { isValid } from "date-fns";

type SingleModeProps = {
  mode: "single";
  selectedDate?: Date;
  onDateChange?: (date: Date | undefined) => void;
};

type RangeModeProps = {
  mode: "range";
  selectedRange?: DateRange;
  onDateRangeChange?: (range: { from: Date | undefined; to: Date | undefined }) => void;
};

type CalendarProps = Omit<React.ComponentProps<typeof DayPicker>, 'selected' | 'onSelect' | 'mode'> & (SingleModeProps | RangeModeProps);

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [range, setRange] = React.useState<DateRange | undefined>(
    props.mode === "range" ? props.selectedRange : undefined
  );
  const [selected, setSelected] = React.useState<Date | undefined>(
    props.mode === "single" ? props.selectedDate : undefined
  );
  const [inputValue, setInputValue] = React.useState(
    props.mode === "single" && props.selectedDate ? format(props.selectedDate, "dd/MM/yyyy") : ""
  );

  const handleRangeSelect: SelectRangeEventHandler = (range: DateRange | undefined) => {
    setRange(range);
    if (range) {
      (props as RangeModeProps).onDateRangeChange?.({ from: range.from, to: range.to });
    }
  };

  const handleSingleSelect: SelectSingleEventHandler = (date: Date | undefined) => {
    setSelected(date);
    setInputValue(date ? format(date, "dd/MM/yyyy") : "");
    (props as SingleModeProps).onDateChange?.(date);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    const parsedDate = parse(e.target.value, "dd/MM/yyyy", new Date());

    if (isValid(parsedDate)) {
      setSelected(parsedDate);
      if (props.mode === "single") {
        (props as SingleModeProps).onDateChange?.(parsedDate);
      }
    } else {
      setSelected(undefined);
      if (props.mode === "single") {
        (props as SingleModeProps).onDateChange?.(undefined);
      }
    }
  };

  return (
    <div>
      <label>
        <strong>Selecteer datum: </strong>
      </label>
      <input
        style={{ fontSize: "inherit" }}
        type="text"
        value={inputValue}
        placeholder="dd/mm/yyyy"
        onChange={handleInputChange}
        className ="px-2"
      />
      {props.mode === "single" ? (
        <DayPicker
          {...props}
          mode="single"
          locale={nl}
          selected={selected}
          onSelect={handleSingleSelect}
          showOutsideDays={showOutsideDays}
          className={cn("p-3", className)}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell:
              "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: cn(
              buttonVariants({ variant: "ghost" }),
              "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
            ),
            day_range_end: "day-range-end",
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside:
              "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle:
              "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
            ...classNames,
          }}
          components={{
            IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
            IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
          }}
        />
      ) : (
        <DayPicker
          {...props}
          mode="range"
          locale={nl}
          selected={range}
          onSelect={handleRangeSelect}
          showOutsideDays={showOutsideDays}
          className={cn("p-3", className)}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell:
              "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: cn(
              buttonVariants({ variant: "ghost" }),
              "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
            ),
            day_range_end: "day-range-end",
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside:
              "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle:
              "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
            ...classNames,
          }}
          components={{
            IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
            IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
          }}
        />
      )}
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
