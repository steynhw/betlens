"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Loader2, Plus } from "lucide-react"

const GAME_TYPES = [
  "Blackjack",
  "Poker",
  "Roulette",
  "Slots",
  "Craps",
  "Baccarat",
  "Video Poker",
  "Sports Betting",
  "Live Casino",
  "Other",
]

interface AddSessionPanelProps {
  userId: string
  onSuccess?: () => void
}

export function AddSessionPanel({ userId, onSuccess }: AddSessionPanelProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    game_type: "",
    casino_name: "",
    buy_in: "",
    cash_out: "",
    duration_minutes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const buyIn = parseFloat(form.buy_in)
    const cashOut = parseFloat(form.cash_out)
    const duration = parseInt(form.duration_minutes) || 0

    if (isNaN(buyIn) || isNaN(cashOut)) {
      setError("Please enter valid numbers for buy-in and cash-out")
      setLoading(false)
      return
    }

    const profitLoss = cashOut - buyIn

    const { error: insertError } = await supabase.from("casino_sessions").insert({
      user_id: userId,
      game_type: form.game_type,
      casino_name: form.casino_name || null,
      buy_in: buyIn,
      cash_out: cashOut,
      duration_minutes: duration,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    // Update bankroll
    const { data: profile } = await supabase
      .from("profiles")
      .select("current_bankroll")
      .eq("id", userId)
      .single()

    if (profile) {
      await supabase
        .from("profiles")
        .update({ current_bankroll: profile.current_bankroll + profitLoss })
        .eq("id", userId)
    }

    setLoading(false)
    setOpen(false)
    setForm({
      game_type: "",
      casino_name: "",
      buy_in: "",
      cash_out: "",
      duration_minutes: "",
    })
    router.refresh()
    onSuccess?.()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Session
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Log Casino Session</SheetTitle>
          <SheetDescription>
            Record a casino session to track your performance.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="game_type">Game Type *</Label>
            <Select value={form.game_type} onValueChange={(v) => setForm({ ...form, game_type: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select game" />
              </SelectTrigger>
              <SelectContent>
                {GAME_TYPES.map((game) => (
                  <SelectItem key={game} value={game}>
                    {game}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="casino_name">Casino / Platform</Label>
            <Input
              id="casino_name"
              placeholder="e.g., Bellagio, BetMGM"
              value={form.casino_name}
              onChange={(e) => setForm({ ...form, casino_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buy_in">Buy-in ($) *</Label>
              <Input
                id="buy_in"
                type="number"
                step="0.01"
                placeholder="500"
                value={form.buy_in}
                onChange={(e) => setForm({ ...form, buy_in: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cash_out">Cash-out ($) *</Label>
              <Input
                id="cash_out"
                type="number"
                step="0.01"
                placeholder="750"
                value={form.cash_out}
                onChange={(e) => setForm({ ...form, cash_out: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="120"
              value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !form.game_type}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Session
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
