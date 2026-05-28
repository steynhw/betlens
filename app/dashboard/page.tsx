import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "./client"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Fetch sports bets
  const { data: sportsBets } = await supabase
    .from("sports_bets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch casino sessions
  const { data: casinoSessions } = await supabase
    .from("casino_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <DashboardClient
      profile={profile || { starting_bankroll: 1000, current_bankroll: 1000 }}
      sportsBets={sportsBets || []}
      casinoSessions={casinoSessions || []}
    />
  )
}
