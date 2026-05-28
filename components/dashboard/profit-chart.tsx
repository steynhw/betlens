"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import type { SportsBet, CasinoSession } from "@/lib/types"

interface ProfitChartProps {
  sportsBets: SportsBet[]
  casinoSessions: CasinoSession[]
}

export function ProfitChart({ sportsBets, casinoSessions }: ProfitChartProps) {
  // Combine and sort all transactions by date
  const allTransactions = [
    ...sportsBets.map((bet) => ({
      date: new Date(bet.created_at),
      profitLoss: bet.profit_loss,
      type: "sports" as const,
    })),
    ...casinoSessions.map((session) => ({
      date: new Date(session.created_at),
      profitLoss: session.profit_loss,
      type: "casino" as const,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime())

  // Calculate cumulative profit/loss
  let cumulative = 0
  const chartData = allTransactions.map((t) => {
    cumulative += t.profitLoss
    return {
      date: t.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: cumulative,
      type: t.type,
    }
  })

  // Add starting point
  if (chartData.length > 0) {
    chartData.unshift({ date: "Start", value: 0, type: "sports" })
  }

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">Cumulative Profit/Loss</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length <= 1 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data yet. Start logging bets to see your progress.
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.2 145)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.65 0.2 145)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.22 25)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.55 0.22 25)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs" 
                  tick={{ fill: "oklch(0.65 0.01 250)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  className="text-xs" 
                  tick={{ fill: "oklch(0.65 0.01 250)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.18 0.02 250)",
                    border: "1px solid oklch(0.28 0.02 250)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "oklch(0.95 0.01 250)" }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "P/L"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="oklch(0.65 0.2 145)"
                  fill="url(#profitGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
