import { useState, useEffect } from 'react'
import type { YearCountryData, RaceFrame, LineSeries } from '@/types'
import {
  fetchAllLaunches,
  aggregateLaunches,
  buildRaceFrames,
  buildLineSeries,
  STATIC_LAUNCH_DATA,
} from '@/utils/launchData'

interface LaunchDataState {
  raw: YearCountryData[]
  raceFrames: RaceFrame[]
  lineSeries: LineSeries[]
  loading: boolean
  progress: { fetched: number; total: number } | null
  error: string | null
  source: 'api' | 'static' | null
}

const CACHE_KEY = 'launch-atlas-data-v1'
const CACHE_TTL = 1000 * 60 * 60 * 24 // 24 hours

function getCache(): YearCountryData[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp > CACHE_TTL) return null
    return data
  } catch {
    return null
  }
}

function setCache(data: YearCountryData[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {
    // Storage quota — silent fail
  }
}

export function useLaunchData(): LaunchDataState {
  const [state, setState] = useState<LaunchDataState>({
    raw: [],
    raceFrames: [],
    lineSeries: [],
    loading: true,
    progress: null,
    error: null,
    source: null,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      // 1. Check session cache
      const cached = getCache()
      if (cached) {
        setState({
          raw: cached,
          raceFrames: buildRaceFrames(cached),
          lineSeries: buildLineSeries(cached),
          loading: false,
          progress: null,
          error: null,
          source: 'api',
        })
        return
      }

      // 2. Try live API
      try {
        const launches = await fetchAllLaunches((fetched, total) => {
          if (!cancelled) {
            setState(prev => ({ ...prev, progress: { fetched, total } }))
          }
        })
        if (cancelled) return

        const aggregated = aggregateLaunches(launches)
        setCache(aggregated)
        setState({
          raw: aggregated,
          raceFrames: buildRaceFrames(aggregated),
          lineSeries: buildLineSeries(aggregated),
          loading: false,
          progress: null,
          error: null,
          source: 'api',
        })
      } catch (err) {
        if (cancelled) return
        console.warn('Launch Library API unavailable, using static data:', err)
        // 3. Fallback to static data
        setState({
          raw: STATIC_LAUNCH_DATA,
          raceFrames: buildRaceFrames(STATIC_LAUNCH_DATA),
          lineSeries: buildLineSeries(STATIC_LAUNCH_DATA),
          loading: false,
          progress: null,
          error: null,
          source: 'static',
        })
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return state
}
