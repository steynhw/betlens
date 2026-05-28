"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface BankrollGaugeProps {
  currentBankroll: number
  startingBankroll: number
}

export function BankrollGauge({ currentBankroll, startingBankroll }: BankrollGaugeProps) {
  const percentage = startingBankroll > 0 
    ? Math.min(Math.max((currentBankroll / startingBankroll) * 100, 0), 200) 
    : 100
  
  const healthScore = Math.min(Math.round(percentage), 100)
  
  // Calculate color based on percentage
  const getColor = () => {
    if (percentage >= 100) return "text-chart-1" // Green - profit
    if (percentage >= 75) return "text-chart-4" // Yellow - slight loss
    if (percentage >= 50) return "text-warning" // Orange - moderate loss
    return "text-destructive" // Red - significant loss
  }

  const getStatus = () => {
    if (percentage >= 120) return "Excellent"
    if (percentage >= 100) return "Healthy"
    if (percentage >= 75) return "Caution"
    if (percentage >= 50) return "Warning"
    return "Critical"
  }

  // SVG arc calculations
  const radius = 80
  const strokeWidth = 12
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * Math.PI // Half circle
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-28">
            <svg
              height={radius + strokeWidth}
              width={radius * 2 + strokeWidth}
              className="transform -rotate-180"
            >
              {/* Background arc */}
              <circle
                stroke="currentColor"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset: 0 }}
                r={normalizedRadius}
                cx={radius + strokeWidth / 2}
                cy={radius}
                className="text-muted"
              />
              {/* Progress arc */}
              <circle
                stroke="currentColor"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset }}
                r={normalizedRadius}
                cx={radius + strokeWidth / 2}
                cy={radius}
                className={cn("transition-all duration-500", getColor())}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
              <span className={cn("text-4xl font-bold", getColor())}>{healthScore}</span>
              <span className="text-sm text-muted-foreground">Health Score</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className={cn("text-lg font-semibold", getColor())}>{getStatus()}</p>
            <p className="text-sm text-muted-foreground mt-1">
              ${currentBankroll.toLocaleString()} / ${startingBankroll.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
