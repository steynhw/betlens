"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DateRange } from "@/lib/types"

interface DateRangeFilterProps {
  value: DateRange
  onChange: (value: DateRange) => void
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const options: { value: DateRange; label: string }[] = [
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
    { value: "all", label: "All Time" },
  ]

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
      {options.map((option) => (
        <Button
          key={option.value}
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-3",
            value === option.value && "bg-background shadow-sm"
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
