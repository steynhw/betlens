"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, AlertTriangle } from "lucide-react"
import type { Profile } from "@/lib/types"

interface SettingsPageClientProps {
  userId: string
  email: string
  profile: Partial<Profile>
}

export function SettingsPageClient({ userId, email, profile }: SettingsPageClientProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    starting_bankroll: profile.starting_bankroll?.toString() || "1000",
    current_bankroll: profile.current_bankroll?.toString() || "1000",
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    const startingBankroll = parseFloat(form.starting_bankroll)
    const currentBankroll = parseFloat(form.current_bankroll)

    if (isNaN(startingBankroll) || isNaN(currentBankroll)) {
      setError("Please enter valid numbers")
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        starting_bankroll: startingBankroll,
        current_bankroll: currentBankroll,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setSuccess(true)
    router.refresh()
  }

  const handleResetBankroll = async () => {
    const startingBankroll = parseFloat(form.starting_bankroll)
    if (isNaN(startingBankroll)) return

    setForm({ ...form, current_bankroll: startingBankroll.toString() })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and bankroll settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bankroll Settings</CardTitle>
          <CardDescription>
            Set your starting bankroll to track performance over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-lg bg-chart-1/10 text-chart-1 text-sm">
                Settings saved successfully!
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="starting_bankroll">Starting Bankroll ($)</Label>
                <Input
                  id="starting_bankroll"
                  type="number"
                  step="0.01"
                  value={form.starting_bankroll}
                  onChange={(e) => setForm({ ...form, starting_bankroll: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Your initial bankroll amount for tracking ROI.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_bankroll">Current Bankroll ($)</Label>
                <Input
                  id="current_bankroll"
                  type="number"
                  step="0.01"
                  value={form.current_bankroll}
                  onChange={(e) => setForm({ ...form, current_bankroll: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Adjust if you deposit or withdraw funds.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={handleResetBankroll}>
                Reset to Starting
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions. Please be careful.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Deleting your data will permanently remove all bets and sessions. This cannot be undone.
          </p>
          <Button variant="destructive" disabled>
            Delete All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
