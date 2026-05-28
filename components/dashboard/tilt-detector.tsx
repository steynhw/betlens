"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, TrendingDown } from "lucide-react"
import type { SportsBet, CasinoSession } from "@/lib/types"

interface TiltDetectorProps {
  sportsBets: SportsBet[]
  casinoSessions: CasinoSession[]
}

export function TiltDetector({ sportsBets, casinoSessions }: TiltDetectorProps) {
  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const recentBets = sportsBets.filter(
    (bet) => new Date(bet.created_at) >= sevenDaysAgo
  )
  const recentSessions = casinoSessions.filter(
    (session) => new Date(session.created_at) >= sevenDaysAgo
  )

  // Calculate consecutive losses
  const sortedBets = [...recentBets].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  
  let consecutiveLosses = 0
  for (const bet of sortedBets) {
    if (bet.result === "Lost") {
      consecutiveLosses++
    } else if (bet.result === "Won") {
      break
    }
  }

  // Calculate total recent losses
  const totalRecentLoss = 
    recentBets.reduce((sum, bet) => sum + (bet.profit_loss < 0 ? bet.profit_loss : 0), 0) +
    recentSessions.reduce((sum, session) => sum + (session.profit_loss < 0 ? session.profit_loss : 0), 0)

  // Calculate betting frequency (bets per day)
  const betsPerDay = recentBets.length / 7
  const sessionsPerDay = recentSessions.length / 7

  // Tilt warnings
  const warnings: { message: string; severity: "warning" | "danger" }[] = []

  if (consecutiveLosses >= 5) {
    warnings.push({
      message: `${consecutiveLosses} consecutive losses. Consider taking a break.`,
      severity: "danger",
    })
  } else if (consecutiveLosses >= 3) {
    warnings.push({
      message: `${consecutiveLosses} losses in a row. Stay disciplined.`,
      severity: "warning",
    })
  }

  if (totalRecentLoss < -500) {
    warnings.push({
      message: `$${Math.abs(totalRecentLoss).toLocaleString()} lost this week. Review your strategy.`,
      severity: "danger",
    })
  } else if (totalRecentLoss < -200) {
    warnings.push({
      message: `Down $${Math.abs(totalRecentLoss).toLocaleString()} this week.`,
      severity: "warning",
    })
  }

  if (betsPerDay > 10) {
    warnings.push({
      message: `High betting frequency (${Math.round(betsPerDay)} bets/day). Avoid chasing.`,
      severity: "warning",
    })
  }

  if (sessionsPerDay > 2) {
    warnings.push({
      message: `${Math.round(sessionsPerDay * 7)} casino sessions this week. Set limits.`,
      severity: "warning",
    })
  }

  if (warnings.length === 0) {
    return (
      <Card className="border-chart-1/30 bg-chart-1/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-chart-1">
            <TrendingDown className="w-4 h-4" />
            Tilt Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-chart-1">All clear! No tilt warnings detected.</p>
        </CardContent>
      </Card>
    )
  }

  const hasDanger = warnings.some((w) => w.severity === "danger")

  return (
    <Card className={hasDanger ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5"}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm font-medium flex items-center gap-2 ${hasDanger ? "text-destructive" : "text-warning"}`}>
          <AlertTriangle className="w-4 h-4" />
          Tilt Warning
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {warnings.map((warning, i) => (
            <li 
              key={i} 
              className={`text-sm ${warning.severity === "danger" ? "text-destructive" : "text-warning"}`}
            >
              {warning.message}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
