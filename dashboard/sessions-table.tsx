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
import type { CasinoSession } from "@/lib/types"

interface SessionsTableProps {
  sessions: CasinoSession[]
}

export function SessionsTable({ sessions }: SessionsTableProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Session History</CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No sessions logged yet. Click &quot;Add Session&quot; to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>Casino</TableHead>
                  <TableHead>Buy-in</TableHead>
                  <TableHead>Cash-out</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">P/L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(session.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{session.game_type}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {session.casino_name || "-"}
                    </TableCell>
                    <TableCell>${session.buy_in.toLocaleString()}</TableCell>
                    <TableCell>${session.cash_out.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {session.duration_minutes > 0 ? formatDuration(session.duration_minutes) : "-"}
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-medium",
                      session.profit_loss > 0 && "text-chart-1",
                      session.profit_loss < 0 && "text-destructive"
                    )}>
                      {session.profit_loss >= 0 ? "+" : ""}${session.profit_loss.toLocaleString()}
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
