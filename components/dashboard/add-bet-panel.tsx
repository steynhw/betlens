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

const SPORTS = ["Football", "Basketball", "Baseball", "Hockey", "Soccer", "Tennis", "MMA", "Boxing", "Golf", "Other"]
const BET_TYPES = ["Moneyline", "Spread", "Over/Under", "Parlay", "Prop", "Futures", "Live Bet", "Other"]
const RESULTS = ["Pending", "Won", "Lost", "Push"]

interface AddBetPanelProps {
  userId: string
  onSuccess?: () => void
}

export function AddBetPanel({ userId, onSuccess }: AddBetPanelProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    sport: "",
    league: "",
    bookmaker: "",
    bet_type: "",
    odds: "",
    stake: "",
    result: "Pending",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const odds = parseFloat(form.odds)
    const stake = parseFloat(form.stake)

    if (isNaN(odds) || isNaN(stake)) {
      setError("Please enter valid numbers for odds and stake")
      setLoading(false)
      return
    }

    // Calculate profit/loss based on result
    let profitLoss = 0
    if (form.result === "Won") {
      // American odds calculation
      if (odds > 0) {
        profitLoss = stake * (odds / 100)
      } else {
        profitLoss = stake * (100 / Math.abs(odds))
      }
    } else if (form.result === "Lost") {
      profitLoss = -stake
    }

    const { error: insertError } = await supabase.from("sports_bets").insert({
      user_id: userId,
      sport: form.sport,
      league: form.league || null,
      bookmaker: form.bookmaker || null,
      bet_type: form.bet_type,
      odds,
      stake,
      result: form.result,
      profit_loss: profitLoss,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    // Update bankroll if result is final
    if (form.result !== "Pending") {
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
    }

    setLoading(false)
    setOpen(false)
    setForm({
      sport: "",
      league: "",
      bookmaker: "",
      bet_type: "",
      odds: "",
      stake: "",
      result: "Pending",
    })
    router.refresh()
    onSuccess?.()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Bet
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Log Sports Bet</SheetTitle>
          <SheetDescription>
            Add a new sports bet to track your performance.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="sport">Sport *</Label>
            <Select value={form.sport} onValueChange={(v) => setForm({ ...form, sport: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select sport" />
              </SelectTrigger>
              <SelectContent>
                {SPORTS.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="league">League</Label>
            <Input
              id="league"
              placeholder="NFL, NBA, etc."
              value={form.league}
              onChange={(e) => setForm({ ...form, league: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bookmaker">Bookmaker</Label>
            <Input
              id="bookmaker"
              placeholder="DraftKings, FanDuel, etc."
              value={form.bookmaker}
              onChange={(e) => setForm({ ...form, bookmaker: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bet_type">Bet Type *</Label>
            <Select value={form.bet_type} onValueChange={(v) => setForm({ ...form, bet_type: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select bet type" />
              </SelectTrigger>
              <SelectContent>
                {BET_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="odds">Odds (American) *</Label>
              <Input
                id="odds"
                type="number"
                placeholder="-110"
                value={form.odds}
                onChange={(e) => setForm({ ...form, odds: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stake">Stake ($) *</Label>
              <Input
                id="stake"
                type="number"
                step="0.01"
                placeholder="100"
                value={form.stake}
                onChange={(e) => setForm({ ...form, stake: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="result">Result</Label>
            <Select value={form.result} onValueChange={(v) => setForm({ ...form, result: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESULTS.map((result) => (
                  <SelectItem key={result} value={result}>
                    {result}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !form.sport || !form.bet_type}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Bet
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
