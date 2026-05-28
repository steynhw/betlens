export interface Profile {
  id: string
  email: string | null
  starting_bankroll: number
  current_bankroll: number
  created_at: string
  updated_at: string
}

export type OddsFormat = 'decimal' | 'fractional' | 'american'

export interface SportsBet {
  id: string
  user_id: string
  sport: string
  league: string | null
  bookmaker: string | null
  bet_type: string
  odds: number
  odds_format: OddsFormat
  stake: number
  result: 'Pending' | 'Won' | 'Lost' | 'Push'
  profit_loss: number
  created_at: string
}

export interface CasinoSession {
  id: string
  user_id: string
  game_type: string
  casino_name: string | null
  buy_in: number
  cash_out: number
  duration_minutes: number
  profit_loss: number
  created_at: string
}

export type DateRange = '7d' | '30d' | '90d' | 'all'
