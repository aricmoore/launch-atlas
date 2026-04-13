import type { CountryKey } from '@/types'

export const COUNTRY_COLORS: Record<CountryKey, string> = {
  USA:    'var(--color-usa)',
  Russia: 'var(--color-russia)',
  China:  'var(--color-china)',
  Europe: 'var(--color-europe)',
  Japan:  'var(--color-japan)',
  India:  'var(--color-india)',
  SpaceX: 'var(--color-spacex)',
  Other:  'var(--color-other)',
}

export const COUNTRY_HEX: Record<CountryKey, string> = {
  USA:    '#3b82f6',
  Russia: '#ef4444',
  China:  '#f59e0b',
  Europe: '#10b981',
  Japan:  '#8b5cf6',
  India:  '#f97316',
  SpaceX: '#06b6d4',
  Other:  '#6b7280',
}

export const COUNTRY_FLAGS: Record<CountryKey, string> = {
  USA:    '🇺🇸',
  Russia: '🇷🇺',
  China:  '🇨🇳',
  Europe: '🇪🇺',
  Japan:  '🇯🇵',
  India:  '🇮🇳',
  SpaceX: '🚀',
  Other:  '🌍',
}
