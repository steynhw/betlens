"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { SportsBet, CasinoSession } from "@/lib/types"

interface RecentActivityProps {
  sportsBets: SportsBet[]
  casinoSessions: CasinoSession[]
}

export function RecentActivity({ sportsBets, casinoSessions }: RecentActivityProps) {
  // Combine and sort by date, take last 10
  const allActivity = [
    ...sportsBets.map((bet) => ({
      id: bet.id,
      type: "sports" as const,
      title: `${bet.sport} - ${bet.bet_type}`,
      subtitle: bet.bookmaker || bet.league || "",
      profitLoss: bet.profit_loss,
      status: bet.result,
      date: new Date(bet.created_at),
    })),
    ...casinoSessions.map((session) => ({
      id: session.id,
      type: "casino" as const,
      title: session.game_type,
      subtitle: session.casino_name || "",
      profitLoss: session.profit_loss,
      status: session.profit_loss >= 0 ? "Won" : "Lost",
      date: new Date(session.created_at),
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {allActivity.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No activity yet. Start logging bets!
          </p>
        ) : (
          <div className="space-y-4">
            {allActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Badge variant={item.type === "sports" ? "default" : "secondary"} className="shrink-0">
                    {item.type === "sports" ? "Sports" : "Casino"}
                  </Badge>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={cn(
                      "font-medium",
                      item.profitLoss >= 0 ? "text-chart-1" : "text-destructive"
                    )}
                  >
                    {item.profitLoss >= 0 ? "+" : ""}${item.profitLoss.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.date.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
