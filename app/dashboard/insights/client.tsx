"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangeFilter } from "@/components/dashboard/date-range-filter"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { SportsBet, CasinoSession, DateRange } from "@/lib/types"

interface InsightsPageClientProps {
  sportsBets: SportsBet[]
  casinoSessions: CasinoSession[]
}

export function InsightsPageClient({ sportsBets, casinoSessions }: InsightsPageClientProps) {
  const [dateRange, setDateRange] = useState<DateRange>("30d")

  const filterByDate = <T extends { created_at: string }>(items: T[]): T[] => {
    if (dateRange === "all") return items

    const now = new Date()
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    return items.filter((item) => new Date(item.created_at) >= cutoff)
  }

  const filteredBets = filterByDate(sportsBets)
  const filteredSessions = filterByDate(casinoSessions)

  // Cumulative P/L chart data
  const cumulativeData = (() => {
    const all = [
      ...filteredBets.map((b) => ({ date: new Date(b.created_at), pl: b.profit_loss, type: "Sports" })),
      ...filteredSessions.map((s) => ({ date: new Date(s.created_at), pl: s.profit_loss, type: "Casino" })),
    ].sort((a, b) => a.date.getTime() - b.date.getTime())

    let cumulative = 0
    return all.map((item) => {
      cumulative += item.pl
      return {
        date: item.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: cumulative,
      }
    })
  })()

  // Sport breakdown
  const sportBreakdown = (() => {
    const bySort: Record<string, { bets: number; pl: number; wins: number }> = {}
    filteredBets.forEach((bet) => {
      if (!bySort[bet.sport]) {
        bySort[bet.sport] = { bets: 0, pl: 0, wins: 0 }
      }
      bySort[bet.sport].bets++
      bySort[bet.sport].pl += bet.profit_loss
      if (bet.result === "Won") bySort[bet.sport].wins++
    })
    return Object.entries(bySort).map(([sport, data]) => ({
      sport,
      bets: data.bets,
      pl: data.pl,
      winRate: data.bets > 0 ? (data.wins / data.bets) * 100 : 0,
    }))
  })()

  // Bet type breakdown
  const betTypeBreakdown = (() => {
    const byType: Record<string, { bets: number; pl: number; wins: number }> = {}
    filteredBets.forEach((bet) => {
      if (!byType[bet.bet_type]) {
        byType[bet.bet_type] = { bets: 0, pl: 0, wins: 0 }
      }
      byType[bet.bet_type].bets++
      byType[bet.bet_type].pl += bet.profit_loss
      if (bet.result === "Won") byType[bet.bet_type].wins++
    })
    return Object.entries(byType).map(([type, data]) => ({
      type,
      bets: data.bets,
      pl: data.pl,
      winRate: data.bets > 0 ? (data.wins / data.bets) * 100 : 0,
    }))
  })()

  // Game type breakdown for casino
  const gameBreakdown = (() => {
    const byGame: Record<string, { sessions: number; pl: number }> = {}
    filteredSessions.forEach((session) => {
      if (!byGame[session.game_type]) {
        byGame[session.game_type] = { sessions: 0, pl: 0 }
      }
      byGame[session.game_type].sessions++
      byGame[session.game_type].pl += session.profit_loss
    })
    return Object.entries(byGame).map(([game, data]) => ({
      game,
      sessions: data.sessions,
      pl: data.pl,
    }))
  })()

  // P/L distribution (sports vs casino)
  const plDistribution = [
    { name: "Sports", value: filteredBets.reduce((sum, b) => sum + b.profit_loss, 0) },
    { name: "Casino", value: filteredSessions.reduce((sum, s) => sum + s.profit_loss, 0) },
  ]

  const COLORS = ["oklch(0.65 0.2 145)", "oklch(0.65 0.18 250)", "oklch(0.75 0.15 85)", "oklch(0.6 0.2 300)"]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Insights</h1>
          <p className="text-muted-foreground">
            Detailed analytics and performance breakdowns.
          </p>
        </div>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* Cumulative P/L Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cumulative Profit/Loss</CardTitle>
        </CardHeader>
        <CardContent>
          {cumulativeData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available for the selected period.
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.65 0.2 145)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.65 0.2 145)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fill: "oklch(0.65 0.01 250)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "oklch(0.65 0.01 250)", fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.18 0.02 250)",
                      border: "1px solid oklch(0.28 0.02 250)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "P/L"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="oklch(0.65 0.2 145)"
                    fill="url(#colorValue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sport Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance by Sport</CardTitle>
          </CardHeader>
          <CardContent>
            {sportBreakdown.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No sports bets logged.
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sportBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fill: "oklch(0.65 0.01 250)", fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                    <YAxis dataKey="sport" type="category" tick={{ fill: "oklch(0.65 0.01 250)", fontSize: 12 }} width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.18 0.02 250)",
                        border: "1px solid oklch(0.28 0.02 250)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === "pl" ? "P/L" : name]}
                    />
                    <Bar dataKey="pl" fill="oklch(0.65 0.2 145)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bet Type Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance by Bet Type</CardTitle>
          </CardHeader>
          <CardContent>
            {betTypeBreakdown.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No sports bets logged.
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={betTypeBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fill: "oklch(0.65 0.01 250)", fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                    <YAxis dataKey="type" type="category" tick={{ fill: "oklch(0.65 0.01 250)", fontSize: 12 }} width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.18 0.02 250)",
                        border: "1px solid oklch(0.28 0.02 250)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === "pl" ? "P/L" : name]}
                    />
                    <Bar dataKey="pl" fill="oklch(0.65 0.18 250)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Casino Game Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Casino Performance by Game</CardTitle>
          </CardHeader>
          <CardContent>
            {gameBreakdown.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No casino sessions logged.
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gameBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fill: "oklch(0.65 0.01 250)", fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                    <YAxis dataKey="game" type="category" tick={{ fill: "oklch(0.65 0.01 250)", fontSize: 12 }} width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.18 0.02 250)",
                        border: "1px solid oklch(0.28 0.02 250)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === "pl" ? "P/L" : name]}
                    />
                    <Bar dataKey="pl" fill="oklch(0.75 0.15 85)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* P/L Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">P/L by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {plDistribution.every((d) => d.value === 0) ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No data available.
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={plDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                    >
                      {plDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.18 0.02 250)",
                        border: "1px solid oklch(0.28 0.02 250)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "P/L"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
