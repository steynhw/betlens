"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Percent, Target, Dice5 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SportsBet, CasinoSession } from "@/lib/types"

interface StatsCardsProps {
  sportsBets: SportsBet[]
  casinoSessions: CasinoSession[]
  currentBankroll: number
  startingBankroll: number
}

export function StatsCards({ 
  sportsBets, 
  casinoSessions, 
  currentBankroll, 
  startingBankroll 
}: StatsCardsProps) {
  // Sports stats
  const totalSportsBets = sportsBets.length
  const wonBets = sportsBets.filter((b) => b.result === "Won").length
  const sportsWinRate = totalSportsBets > 0 ? (wonBets / totalSportsBets) * 100 : 0
  const sportsProfitLoss = sportsBets.reduce((sum, bet) => sum + bet.profit_loss, 0)

  // Casino stats
  const totalSessions = casinoSessions.length
  const casinoProfitLoss = casinoSessions.reduce((sum, s) => sum + s.profit_loss, 0)
  const profitableSessions = casinoSessions.filter((s) => s.profit_loss > 0).length
  const casinoWinRate = totalSessions > 0 ? (profitableSessions / totalSessions) * 100 : 0

  // Total stats
  const totalProfitLoss = sportsProfitLoss + casinoProfitLoss
  const bankrollChange = currentBankroll - startingBankroll
  const bankrollChangePercent = startingBankroll > 0 
    ? ((bankrollChange / startingBankroll) * 100) 
    : 0

  const stats = [
    {
      title: "Total P/L",
      value: `$${Math.abs(totalProfitLoss).toLocaleString()}`,
      prefix: totalProfitLoss >= 0 ? "+" : "-",
      change: bankrollChangePercent,
      icon: DollarSign,
      positive: totalProfitLoss >= 0,
    },
    {
      title: "Sports Win Rate",
      value: `${sportsWinRate.toFixed(1)}%`,
      subtitle: `${wonBets}/${totalSportsBets} bets`,
      icon: Target,
      positive: sportsWinRate >= 50,
    },
    {
      title: "Sports P/L",
      value: `$${Math.abs(sportsProfitLoss).toLocaleString()}`,
      prefix: sportsProfitLoss >= 0 ? "+" : "-",
      icon: TrendingUp,
      positive: sportsProfitLoss >= 0,
    },
    {
      title: "Casino P/L",
      value: `$${Math.abs(casinoProfitLoss).toLocaleString()}`,
      prefix: casinoProfitLoss >= 0 ? "+" : "-",
      subtitle: `${totalSessions} sessions`,
      icon: Dice5,
      positive: casinoProfitLoss >= 0,
    },
  ]

  return (
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
              stat.positive ? "text-chart-1" : "text-destructive"
            )}>
              {stat.prefix}{stat.value}
            </div>
            {stat.subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
            )}
            {stat.change !== undefined && (
              <div className="flex items-center text-xs mt-1">
                {stat.change >= 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-chart-1" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-destructive" />
                )}
                <span className={stat.change >= 0 ? "text-chart-1" : "text-destructive"}>
                  {stat.change >= 0 ? "+" : ""}{stat.change.toFixed(1)}% from start
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
