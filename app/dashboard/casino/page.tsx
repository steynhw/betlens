import { createClient } from "@/lib/supabase/server"
import { CasinoPageClient } from "./client"

export default async function CasinoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: casinoSessions } = await supabase
    .from("casino_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return <CasinoPageClient userId={user.id} casinoSessions={casinoSessions || []} />
}
