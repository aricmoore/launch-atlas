import type { LLResponse, LLLaunch, YearCountryData, RaceFrame, LineSeries, CountryKey } from '@/types'

// ============================================================
// Country normalisation
// Map launch service provider country codes → our 8 buckets
// ============================================================

const COUNTRY_MAP: Record<string, CountryKey> = {
  // USA commercial — SpaceX gets its own bucket (dominant reuse story)
  // We check by provider name first (see classifyLaunch), then fall back here
  USA: 'USA',
  US:  'USA',

  // Russia / Soviet successor
  RUS: 'Russia',
  SUN: 'Russia', // Soviet Union legacy entries
  KAZ: 'Russia', // Baikonur launches attributed to Russia

  // China
  CHN: 'China',

  // European ESA/Arianespace consortium
  FRA: 'Europe',
  DEU: 'Europe',
  ITA: 'Europe',
  GBR: 'Europe',
  NLD: 'Europe',
  BEL: 'Europe',
  ESP: 'Europe',
  SWE: 'Europe',

  // Japan
  JPN: 'Japan',

  // India ISRO
  IND: 'India',
}

function classifyLaunch(launch: LLLaunch): CountryKey {
  const providerName = launch.launch_service_provider?.name ?? ''
  const countryCode = launch.launch_service_provider?.country_code
    ?? launch.rocket?.configuration?.manufacturer?.country_code
    ?? ''

  // SpaceX bucket — reuse revolution story
  if (providerName.toLowerCase().includes('spacex')) return 'SpaceX'

  const mapped = COUNTRY_MAP[countryCode.toUpperCase()]
  return mapped ?? 'Other'
}

function getYear(launch: LLLaunch): number {
  return new Date(launch.net).getFullYear()
}

// ============================================================
// API fetch — paginate through all launches 2025
// ============================================================

const BASE_URL = 'https://ll.thespacedevs.com/2.2.0'
const PAGE_SIZE = 100

export async function fetchAllLaunches(
  onProgress?: (fetched: number, total: number) => void
): Promise<LLLaunch[]> {
  const launches: LLLaunch[] = []

  // Successful launches only, 2000-01-01 → 2025-12-31
  let url: string | null =
    `${BASE_URL}/launch/previous/?format=json&limit=${PAGE_SIZE}` +
    `&net__gte=2000-01-01T00:00:00Z` +
    `&net__lte=2025-12-31T23:59:59Z` +
    `&ordering=net`

  while (url) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Launch Library API error: ${res.status}`)
    const data: LLResponse = await res.json()
    launches.push(...data.results)
    onProgress?.(launches.length, data.count)
    url = data.next
    // Respect free-tier rate limit: 15 req/hour → add small delay
    if (url) await new Promise(r => setTimeout(r, 250))
  }

  return launches
}

// ============================================================
// Aggregate
// ============================================================

export function aggregateLaunches(launches: LLLaunch[]): YearCountryData[] {
  const map = new Map<string, YearCountryData>()

  for (const launch of launches) {
    const year    = getYear(launch)
    if (year < 2000 || year > 2025) continue
    const country = classifyLaunch(launch)
    const key     = `${year}-${country}`
    const reusable = launch.rocket?.configuration?.reusable ? 1 : 0

    if (!map.has(key)) {
      map.set(key, { year, country, launches: 0, reusable: 0 })
    }
    const entry = map.get(key)!
    entry.launches += 1
    entry.reusable += reusable
  }

  return Array.from(map.values()).sort((a, b) => a.year - b.year || a.country.localeCompare(b.country))
}

// ============================================================
// Build bar chart race frames
// ============================================================

export function buildRaceFrames(data: YearCountryData[]): RaceFrame[] {
  const countries: CountryKey[] = ['USA', 'Russia', 'China', 'Europe', 'Japan', 'India', 'SpaceX', 'Other']
  const cumulative: Record<CountryKey, number> = {
    USA: 0, Russia: 0, China: 0, Europe: 0, Japan: 0, India: 0, SpaceX: 0, Other: 0
  }

  const frames: RaceFrame[] = []
  const years = Array.from(new Set(data.map(d => d.year))).sort()

  for (const year of years) {
    const yearData = data.filter(d => d.year === year)
    for (const d of yearData) {
      cumulative[d.country] += d.launches
    }
    frames.push({
      year,
      bars: countries
        .map(country => ({ country, cumulative: cumulative[country] }))
        .sort((a, b) => b.cumulative - a.cumulative),
    })
  }

  return frames
}

// ============================================================
// Build line chart series
// ============================================================

export function buildLineSeries(data: YearCountryData[]): LineSeries[] {
  const countries: CountryKey[] = ['USA', 'Russia', 'China', 'Europe', 'Japan', 'India', 'SpaceX', 'Other']
  const years = Array.from(new Set(data.map(d => d.year))).sort()

  return countries.map(country => ({
    country,
    points: years.map(year => {
      const found = data.find(d => d.year === year && d.country === country)
      return { year, launches: found?.launches ?? 0 }
    }),
  }))
}

// ============================================================
// Static fallback data (used if API is unavailable / rate-limited)
// Sourced from public CSIS Aerospace Security / Gunter's Space Page tallies
// ============================================================

export const STATIC_LAUNCH_DATA: YearCountryData[] = [
  // USA (excl SpaceX)
  { year: 2000, country: 'USA', launches: 28, reusable: 0 },
  { year: 2001, country: 'USA', launches: 23, reusable: 0 },
  { year: 2002, country: 'USA', launches: 19, reusable: 0 },
  { year: 2003, country: 'USA', launches: 24, reusable: 0 },
  { year: 2004, country: 'USA', launches: 17, reusable: 0 },
  { year: 2005, country: 'USA', launches: 20, reusable: 0 },
  { year: 2006, country: 'USA', launches: 19, reusable: 0 },
  { year: 2007, country: 'USA', launches: 20, reusable: 0 },
  { year: 2008, country: 'USA', launches: 16, reusable: 0 },
  { year: 2009, country: 'USA', launches: 22, reusable: 0 },
  { year: 2010, country: 'USA', launches: 16, reusable: 0 },
  { year: 2011, country: 'USA', launches: 18, reusable: 0 },
  { year: 2012, country: 'USA', launches: 13, reusable: 0 },
  { year: 2013, country: 'USA', launches: 18, reusable: 0 },
  { year: 2014, country: 'USA', launches: 19, reusable: 0 },
  { year: 2015, country: 'USA', launches: 17, reusable: 0 },
  { year: 2016, country: 'USA', launches: 16, reusable: 0 },
  { year: 2017, country: 'USA', launches: 14, reusable: 0 },
  { year: 2018, country: 'USA', launches: 15, reusable: 0 },
  { year: 2019, country: 'USA', launches: 14, reusable: 0 },
  { year: 2020, country: 'USA', launches: 13, reusable: 0 },
  { year: 2021, country: 'USA', launches: 16, reusable: 0 },
  { year: 2022, country: 'USA', launches: 16, reusable: 0 },
  { year: 2023, country: 'USA', launches: 12, reusable: 0 },
  { year: 2024, country: 'USA', launches: 10, reusable: 0 },
  { year: 2025, country: 'USA', launches: 8, reusable: 0 },
  // SpaceX
  { year: 2006, country: 'SpaceX', launches: 1, reusable: 0 },
  { year: 2008, country: 'SpaceX', launches: 2, reusable: 0 },
  { year: 2010, country: 'SpaceX', launches: 2, reusable: 0 },
  { year: 2012, country: 'SpaceX', launches: 2, reusable: 0 },
  { year: 2013, country: 'SpaceX', launches: 3, reusable: 0 },
  { year: 2014, country: 'SpaceX', launches: 6, reusable: 0 },
  { year: 2015, country: 'SpaceX', launches: 7, reusable: 0 },
  { year: 2016, country: 'SpaceX', launches: 8, reusable: 1 },
  { year: 2017, country: 'SpaceX', launches: 18, reusable: 5 },
  { year: 2018, country: 'SpaceX', launches: 21, reusable: 12 },
  { year: 2019, country: 'SpaceX', launches: 13, reusable: 9 },
  { year: 2020, country: 'SpaceX', launches: 26, reusable: 22 },
  { year: 2021, country: 'SpaceX', launches: 31, reusable: 29 },
  { year: 2022, country: 'SpaceX', launches: 61, reusable: 59 },
  { year: 2023, country: 'SpaceX', launches: 96, reusable: 94 },
  { year: 2024, country: 'SpaceX', launches: 134, reusable: 132 },
  { year: 2025, country: 'SpaceX', launches: 40, reusable: 40 },
  // Russia
  { year: 2000, country: 'Russia', launches: 36, reusable: 0 },
  { year: 2001, country: 'Russia', launches: 24, reusable: 0 },
  { year: 2002, country: 'Russia', launches: 25, reusable: 0 },
  { year: 2003, country: 'Russia', launches: 21, reusable: 0 },
  { year: 2004, country: 'Russia', launches: 23, reusable: 0 },
  { year: 2005, country: 'Russia', launches: 26, reusable: 0 },
  { year: 2006, country: 'Russia', launches: 25, reusable: 0 },
  { year: 2007, country: 'Russia', launches: 26, reusable: 0 },
  { year: 2008, country: 'Russia', launches: 27, reusable: 0 },
  { year: 2009, country: 'Russia', launches: 32, reusable: 0 },
  { year: 2010, country: 'Russia', launches: 31, reusable: 0 },
  { year: 2011, country: 'Russia', launches: 35, reusable: 0 },
  { year: 2012, country: 'Russia', launches: 24, reusable: 0 },
  { year: 2013, country: 'Russia', launches: 32, reusable: 0 },
  { year: 2014, country: 'Russia', launches: 32, reusable: 0 },
  { year: 2015, country: 'Russia', launches: 29, reusable: 0 },
  { year: 2016, country: 'Russia', launches: 19, reusable: 0 },
  { year: 2017, country: 'Russia', launches: 20, reusable: 0 },
  { year: 2018, country: 'Russia', launches: 20, reusable: 0 },
  { year: 2019, country: 'Russia', launches: 25, reusable: 0 },
  { year: 2020, country: 'Russia', launches: 17, reusable: 0 },
  { year: 2021, country: 'Russia', launches: 25, reusable: 0 },
  { year: 2022, country: 'Russia', launches: 21, reusable: 0 },
  { year: 2023, country: 'Russia', launches: 19, reusable: 0 },
  { year: 2024, country: 'Russia', launches: 17, reusable: 0 },
  { year: 2025, country: 'Russia', launches: 4, reusable: 0 },
  // China
  { year: 2000, country: 'China', launches: 5, reusable: 0 },
  { year: 2001, country: 'China', launches: 1, reusable: 0 },
  { year: 2002, country: 'China', launches: 4, reusable: 0 },
  { year: 2003, country: 'China', launches: 6, reusable: 0 },
  { year: 2004, country: 'China', launches: 8, reusable: 0 },
  { year: 2005, country: 'China', launches: 5, reusable: 0 },
  { year: 2006, country: 'China', launches: 6, reusable: 0 },
  { year: 2007, country: 'China', launches: 10, reusable: 0 },
  { year: 2008, country: 'China', launches: 11, reusable: 0 },
  { year: 2009, country: 'China', launches: 6, reusable: 0 },
  { year: 2010, country: 'China', launches: 15, reusable: 0 },
  { year: 2011, country: 'China', launches: 19, reusable: 0 },
  { year: 2012, country: 'China', launches: 19, reusable: 0 },
  { year: 2013, country: 'China', launches: 14, reusable: 0 },
  { year: 2014, country: 'China', launches: 16, reusable: 0 },
  { year: 2015, country: 'China', launches: 19, reusable: 0 },
  { year: 2016, country: 'China', launches: 22, reusable: 0 },
  { year: 2017, country: 'China', launches: 18, reusable: 0 },
  { year: 2018, country: 'China', launches: 39, reusable: 0 },
  { year: 2019, country: 'China', launches: 34, reusable: 0 },
  { year: 2020, country: 'China', launches: 39, reusable: 0 },
  { year: 2021, country: 'China', launches: 55, reusable: 0 },
  { year: 2022, country: 'China', launches: 64, reusable: 2 },
  { year: 2023, country: 'China', launches: 67, reusable: 4 },
  { year: 2024, country: 'China', launches: 70, reusable: 8 },
  { year: 2025, country: 'China', launches: 22, reusable: 4 },
  // Europe
  { year: 2000, country: 'Europe', launches: 12, reusable: 0 },
  { year: 2001, country: 'Europe', launches: 9, reusable: 0 },
  { year: 2002, country: 'Europe', launches: 11, reusable: 0 },
  { year: 2003, country: 'Europe', launches: 4, reusable: 0 },
  { year: 2004, country: 'Europe', launches: 3, reusable: 0 },
  { year: 2005, country: 'Europe', launches: 5, reusable: 0 },
  { year: 2006, country: 'Europe', launches: 5, reusable: 0 },
  { year: 2007, country: 'Europe', launches: 6, reusable: 0 },
  { year: 2008, country: 'Europe', launches: 6, reusable: 0 },
  { year: 2009, country: 'Europe', launches: 7, reusable: 0 },
  { year: 2010, country: 'Europe', launches: 7, reusable: 0 },
  { year: 2011, country: 'Europe', launches: 8, reusable: 0 },
  { year: 2012, country: 'Europe', launches: 11, reusable: 0 },
  { year: 2013, country: 'Europe', launches: 10, reusable: 0 },
  { year: 2014, country: 'Europe', launches: 11, reusable: 0 },
  { year: 2015, country: 'Europe', launches: 9, reusable: 0 },
  { year: 2016, country: 'Europe', launches: 11, reusable: 0 },
  { year: 2017, country: 'Europe', launches: 10, reusable: 0 },
  { year: 2018, country: 'Europe', launches: 8, reusable: 0 },
  { year: 2019, country: 'Europe', launches: 6, reusable: 0 },
  { year: 2020, country: 'Europe', launches: 6, reusable: 0 },
  { year: 2021, country: 'Europe', launches: 5, reusable: 0 },
  { year: 2022, country: 'Europe', launches: 5, reusable: 0 },
  { year: 2023, country: 'Europe', launches: 3, reusable: 0 },
  { year: 2024, country: 'Europe', launches: 2, reusable: 0 },
  { year: 2025, country: 'Europe', launches: 1, reusable: 0 },
  // Japan
  { year: 2000, country: 'Japan', launches: 1, reusable: 0 },
  { year: 2001, country: 'Japan', launches: 1, reusable: 0 },
  { year: 2002, country: 'Japan', launches: 2, reusable: 0 },
  { year: 2003, country: 'Japan', launches: 3, reusable: 0 },
  { year: 2005, country: 'Japan', launches: 2, reusable: 0 },
  { year: 2006, country: 'Japan', launches: 1, reusable: 0 },
  { year: 2007, country: 'Japan', launches: 2, reusable: 0 },
  { year: 2008, country: 'Japan', launches: 1, reusable: 0 },
  { year: 2009, country: 'Japan', launches: 3, reusable: 0 },
  { year: 2010, country: 'Japan', launches: 2, reusable: 0 },
  { year: 2012, country: 'Japan', launches: 2, reusable: 0 },
  { year: 2013, country: 'Japan', launches: 3, reusable: 0 },
  { year: 2014, country: 'Japan', launches: 4, reusable: 0 },
  { year: 2015, country: 'Japan', launches: 4, reusable: 0 },
  { year: 2016, country: 'Japan', launches: 4, reusable: 0 },
  { year: 2017, country: 'Japan', launches: 7, reusable: 0 },
  { year: 2018, country: 'Japan', launches: 6, reusable: 0 },
  { year: 2019, country: 'Japan', launches: 2, reusable: 0 },
  { year: 2020, country: 'Japan', launches: 4, reusable: 0 },
  { year: 2021, country: 'Japan', launches: 3, reusable: 0 },
  { year: 2022, country: 'Japan', launches: 3, reusable: 0 },
  { year: 2023, country: 'Japan', launches: 2, reusable: 0 },
  { year: 2024, country: 'Japan', launches: 3, reusable: 0 },
  { year: 2025, country: 'Japan', launches: 1, reusable: 0 },
  // India
  { year: 2001, country: 'India', launches: 1, reusable: 0 },
  { year: 2002, country: 'India', launches: 1, reusable: 0 },
  { year: 2007, country: 'India', launches: 1, reusable: 0 },
  { year: 2008, country: 'India', launches: 3, reusable: 0 },
  { year: 2009, country: 'India', launches: 2, reusable: 0 },
  { year: 2010, country: 'India', launches: 1, reusable: 0 },
  { year: 2011, country: 'India', launches: 2, reusable: 0 },
  { year: 2012, country: 'India', launches: 1, reusable: 0 },
  { year: 2013, country: 'India', launches: 2, reusable: 0 },
  { year: 2014, country: 'India', launches: 4, reusable: 0 },
  { year: 2015, country: 'India', launches: 5, reusable: 0 },
  { year: 2016, country: 'India', launches: 7, reusable: 0 },
  { year: 2017, country: 'India', launches: 5, reusable: 0 },
  { year: 2018, country: 'India', launches: 7, reusable: 0 },
  { year: 2019, country: 'India', launches: 6, reusable: 0 },
  { year: 2020, country: 'India', launches: 2, reusable: 0 },
  { year: 2021, country: 'India', launches: 3, reusable: 0 },
  { year: 2022, country: 'India', launches: 5, reusable: 0 },
  { year: 2023, country: 'India', launches: 7, reusable: 0 },
  { year: 2024, country: 'India', launches: 8, reusable: 0 },
  { year: 2025, country: 'India', launches: 3, reusable: 0 },
]
