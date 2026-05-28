import { createClient } from "@/lib/supabase/server"
import { InsightsPageClient } from "./client"

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: sportsBets } = await supabase
    .from("sports_bets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  const { data: casinoSessions } = await supabase
    .from("casino_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  return (
    <InsightsPageClient
      sportsBets={sportsBets || []}
      casinoSessions={casinoSessions || []}
    />
  )
}
