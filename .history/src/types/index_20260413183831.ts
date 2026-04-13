// ============================================================
// Launch Library 2 API types (subset used by Launch Atlas)
// ============================================================

export interface LLLaunch {
  id: string
  name: string
  net: string // ISO date string
  status: { id: number; name: string; abbrev: string }
  launch_service_provider: {
    id: number
    name: string
    country_code?: string
    type: string
  }
  rocket: {
    configuration: {
      id: number
      name: string
      reusable: boolean
      manufacturer: { name: string; country_code: string }
    }
  }
  mission: {
    name: string
    type: string
    orbit: { name: string; abbrev: string } | null
  } | null
}

export interface LLResponse {
  count: number
  next: string | null
  previous: string | null
  results: LLLaunch[]
}

// ============================================================
// Processed / aggregated types
// ============================================================

export type CountryKey = 'USA' | 'Russia' | 'China' | 'Europe' | 'Japan' | 'India' | 'SpaceX' | 'Other'

export interface YearCountryData {
  year: number
  country: CountryKey
  launches: number
  reusable: number
}

export interface RaceFrame {
  year: number
  bars: { country: CountryKey; cumulative: number }[]
}

export interface LineSeriesPoint {
  year: number
  launches: number
}

export interface LineSeries {
  country: CountryKey
  points: LineSeriesPoint[]
}
