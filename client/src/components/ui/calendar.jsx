"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  selected,
  onSelect,
  mode = "single", // Add a mode prop to support single, multiple, range
  ...props
}) {
  // If onSelect is not provided, create a controlled component internally
  const [selectedDate, setSelectedDate] = React.useState(selected || undefined);
  
  // Handle selection changes
  const handleSelect = React.useCallback((date) => {
    if (onSelect) {
      // If onSelect is provided, use it (uncontrolled component)
      onSelect(date);
    } else {
      // Otherwise, handle selection internally (controlled component)
      setSelectedDate(date);
    }
  }, [onSelect]);
  
  // Use either the externally controlled selected value or the internal state
  const value = selected !== undefined ? selected : selectedDate;
  
  return (
    <DayPicker
      mode={mode}
      selected={value}
      onSelect={handleSelect}
      showOutsideDays={showOutsideDays}
      className={className}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-gray-500 rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md",
        day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
        day_today: "bg-gray-100",
        day_outside: "text-gray-400 opacity-50",
        day_disabled: "text-gray-400 opacity-50",
        day_range_middle: "aria-selected:bg-gray-100 aria-selected:text-gray-700",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
