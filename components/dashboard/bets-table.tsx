"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { SportsBet } from "@/lib/types"

interface BetsTableProps {
  bets: SportsBet[]
}

export function BetsTable({ bets }: BetsTableProps) {
  const getResultColor = (result: string) => {
    switch (result) {
      case "Won":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20"
      case "Lost":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "Push":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-warning/10 text-warning border-warning/20"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Bet History</CardTitle>
      </CardHeader>
      <CardContent>
        {bets.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No bets logged yet. Click &quot;Add Bet&quot; to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Bet Type</TableHead>
                  <TableHead>Odds</TableHead>
                  <TableHead>Stake</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="text-right">P/L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bets.map((bet) => (
                  <TableRow key={bet.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(bet.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{bet.sport}</p>
                        {bet.league && (
                          <p className="text-xs text-muted-foreground">{bet.league}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{bet.bet_type}</TableCell>
                    <TableCell className="font-mono">
                      {bet.odds > 0 ? `+${bet.odds}` : bet.odds}
                    </TableCell>
                    <TableCell>${bet.stake.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getResultColor(bet.result)}>
                        {bet.result}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-medium",
                      bet.profit_loss > 0 && "text-chart-1",
                      bet.profit_loss < 0 && "text-destructive"
                    )}>
                      {bet.profit_loss >= 0 ? "+" : ""}${bet.profit_loss.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
