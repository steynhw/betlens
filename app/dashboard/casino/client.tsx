"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddSessionPanel } from "@/components/dashboard/add-session-panel"
import { SessionsTable } from "@/components/dashboard/sessions-table"
import { DateRangeFilter } from "@/components/dashboard/date-range-filter"
import { Dice5, TrendingUp, Clock, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CasinoSession, DateRange } from "@/lib/types"

interface CasinoPageClientProps {
  userId: string
  casinoSessions: CasinoSession[]
}

export function CasinoPageClient({ userId, casinoSessions }: CasinoPageClientProps) {
  const [dateRange, setDateRange] = useState<DateRange>("30d")

  const filterByDate = (items: CasinoSession[]): CasinoSession[] => {
    if (dateRange === "all") return items

    const now = new Date()
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    return items.filter((item) => new Date(item.created_at) >= cutoff)
  }

  const filteredSessions = filterByDate(casinoSessions)

  // Calculate stats
  const totalSessions = filteredSessions.length
  const profitableSessions = filteredSessions.filter((s) => s.profit_loss > 0).length
  const winRate = totalSessions > 0 ? (profitableSessions / totalSessions) * 100 : 0
  const totalProfitLoss = filteredSessions.reduce((sum, s) => sum + s.profit_loss, 0)
  const totalBuyIn = filteredSessions.reduce((sum, s) => sum + s.buy_in, 0)
  const totalDuration = filteredSessions.reduce((sum, s) => sum + s.duration_minutes, 0)
  const avgSessionLength = totalSessions > 0 ? totalDuration / totalSessions : 0
  const hourlyRate = totalDuration > 0 ? (totalProfitLoss / totalDuration) * 60 : 0

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const stats = [
    { title: "Total Sessions", value: totalSessions.toString(), icon: Dice5 },
    { 
      title: "Win Rate", 
      value: `${winRate.toFixed(1)}%`, 
      subtitle: `${profitableSessions} profitable`,
      icon: TrendingUp,
      positive: winRate >= 50
    },
    { 
      title: "Total P/L", 
      value: `$${Math.abs(totalProfitLoss).toLocaleString()}`, 
      prefix: totalProfitLoss >= 0 ? "+" : "-",
      icon: DollarSign,
      positive: totalProfitLoss >= 0
    },
    { 
      title: "Hourly Rate", 
      value: `$${Math.abs(hourlyRate).toFixed(0)}`, 
      prefix: hourlyRate >= 0 ? "+" : "-",
      subtitle: `Avg ${formatDuration(avgSessionLength)}/session`,
      icon: Clock,
      positive: hourlyRate >= 0
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Casino Sessions</h1>
          <p className="text-muted-foreground">
            Track your casino gaming sessions and performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <AddSessionPanel userId={userId} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                stat.positive !== undefined && (stat.positive ? "text-chart-1" : "text-destructive")
              )}>
                {stat.prefix}{stat.value}
              </div>
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <SessionsTable sessions={filteredSessions} />
    </div>
  )
}
