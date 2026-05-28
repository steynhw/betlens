"use client"

import { useState } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { BankrollGauge } from "@/components/dashboard/bankroll-gauge"
import { TiltDetector } from "@/components/dashboard/tilt-detector"
import { ProfitChart } from "@/components/dashboard/profit-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { DateRangeFilter } from "@/components/dashboard/date-range-filter"
import type { Profile, SportsBet, CasinoSession, DateRange } from "@/lib/types"

interface DashboardClientProps {
  profile: Partial<Profile>
  sportsBets: SportsBet[]
  casinoSessions: CasinoSession[]
}

export function DashboardClient({ profile, sportsBets, casinoSessions }: DashboardClientProps) {
  const [dateRange, setDateRange] = useState<DateRange>("30d")

  // Filter data by date range
  const filterByDate = <T extends { created_at: string }>(items: T[]): T[] => {
    if (dateRange === "all") return items

    const now = new Date()
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    return items.filter((item) => new Date(item.created_at) >= cutoff)
  }

  const filteredBets = filterByDate(sportsBets)
  const filteredSessions = filterByDate(casinoSessions)

  const startingBankroll = profile.starting_bankroll ?? 1000
  const currentBankroll = profile.current_bankroll ?? 1000

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your betting performance and bankroll health.
          </p>
        </div>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      <StatsCards
        sportsBets={filteredBets}
        casinoSessions={filteredSessions}
        currentBankroll={currentBankroll}
        startingBankroll={startingBankroll}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <ProfitChart sportsBets={filteredBets} casinoSessions={filteredSessions} />
        <div className="space-y-6">
          <BankrollGauge
            currentBankroll={currentBankroll}
            startingBankroll={startingBankroll}
          />
          <TiltDetector sportsBets={sportsBets} casinoSessions={casinoSessions} />
        </div>
      </div>

      <RecentActivity sportsBets={sportsBets} casinoSessions={casinoSessions} />
    </div>
  )
}
