import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import type { LineSeries as LineSeriesType, CountryKey } from '@/types'
import { COUNTRY_HEX, COUNTRY_FLAGS } from '@/utils/colors'
import styles from './LineChart.module.css'

interface Props {
  series: LineSeriesType[]
  yearRange: [number, number]
}

const ALL_COUNTRIES: CountryKey[] = ['USA', 'Russia', 'China', 'Europe', 'Japan', 'India', 'SpaceX', 'Other']

export function LineChart({ series, yearRange }: Props) {
  const svgRef  = useRef<SVGSVGElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<Set<CountryKey>>(
    new Set(['USA', 'Russia', 'China', 'SpaceX'])
  )
  const [dimensions, setDimensions] = useState({ width: 900, height: 480 })
  const [hoverYear, setHoverYear] = useState<number | null>(null)

  // Responsive
  useEffect(() => {
    if (!wrapRef.current) return
    const obs = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect
      setDimensions({ width, height: Math.min(Math.max(width * 0.52, 300), 520) })
    })
    obs.observe(wrapRef.current)
    return () => obs.disconnect()
  }, [])

  const toggleCountry = (c: CountryKey) => {
    setActive(prev => {
      const next = new Set(prev)
      if (next.has(c)) {
        if (next.size > 1) next.delete(c)
      } else {
        next.add(c)
      }
      return next
    })
  }

  // D3 render
  useEffect(() => {
    if (!svgRef.current || series.length === 0) return

    const { width, height } = dimensions
    const margin = { top: 24, right: 40, bottom: 48, left: 56 }
    const innerW = width  - margin.left - margin.right
    const innerH = height - margin.top  - margin.bottom

    const svg = d3.select(svgRef.current)
    svg.attr('width', width).attr('height', height)
    svg.selectAll('*').remove()

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // Filter data to yearRange and active countries
    const filtered = series
      .filter(s => active.has(s.country))
      .map(s => ({
        ...s,
        points: s.points.filter(p => p.year >= yearRange[0] && p.year <= yearRange[1]),
      }))

    const allYears  = filtered[0]?.points.map(p => p.year) ?? []
    const allValues = filtered.flatMap(s => s.points.map(p => p.launches))

    const x = d3.scaleLinear()
      .domain([yearRange[0], yearRange[1]])
      .range([0, innerW])

    const y = d3.scaleLinear()
      .domain([0, (d3.max(allValues) ?? 100) * 1.1])
      .range([innerH, 0])
      .nice()

    // Grid lines
    const yTicks = y.ticks(6)
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yTicks)
      .join('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', 'var(--color-border)')
      .attr('stroke-width', 1)

    // Axes
    const xAxis = d3.axisBottom(x)
      .ticks(Math.floor(innerW / 60))
      .tickFormat(d => String(d))
      .tickSize(0)
      .tickPadding(10)

    const yAxis = d3.axisLeft(y)
      .ticks(6)
      .tickSize(0)
      .tickPadding(10)

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(xAxis)
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('text')
        .style('font-family', 'var(--font-mono)')
        .style('font-size', '10px')
        .attr('fill', 'var(--color-text-dim)')
      )

    g.append('g')
      .call(yAxis)
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('text')
        .style('font-family', 'var(--font-mono)')
        .style('font-size', '10px')
        .attr('fill', 'var(--color-text-dim)')
      )

    // Line generator
    const line = d3.line<{ year: number; launches: number }>()
      .x(d => x(d.year))
      .y(d => y(d.launches))
      .curve(d3.curveMonotoneX)

    // Area generator (subtle fill)
    const area = d3.area<{ year: number; launches: number }>()
      .x(d => x(d.year))
      .y0(innerH)
      .y1(d => y(d.launches))
      .curve(d3.curveMonotoneX)

    // Draw series
    for (const s of filtered) {
      const color = COUNTRY_HEX[s.country]

      // Area
      g.append('path')
        .datum(s.points)
        .attr('fill', color)
        .attr('opacity', 0.04)
        .attr('d', area)

      // Line
      const path = g.append('path')
        .datum(s.points)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('opacity', 0.9)
        .attr('d', line)

      // Animate stroke
      const totalLength = (path.node() as SVGPathElement).getTotalLength?.() ?? 1000
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1200)
        .ease(d3.easeQuadInOut)
        .attr('stroke-dashoffset', 0)
    }

    // Hover overlay
    const bisect = d3.bisector<{ year: number; launches: number }, number>(d => d.year).left

    const hoverLine = g.append('line')
      .attr('stroke', 'var(--color-text-dim)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4 2')
      .attr('y1', 0).attr('y2', innerH)
      .attr('opacity', 0)

    g.append('rect')
      .attr('width', innerW).attr('height', innerH)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mousemove', function(event) {
        const [mx] = d3.pointer(event)
        const year = Math.round(x.invert(mx))
        hoverLine
          .attr('x1', x(year)).attr('x2', x(year))
          .attr('opacity', 1)
        setHoverYear(year)

        // Tooltip
        if (tooltipRef.current) {
          const vals = filtered.map(s => {
            const idx = bisect(s.points, year)
            const p = s.points[Math.min(idx, s.points.length - 1)]
            return { country: s.country, launches: p?.launches ?? 0 }
          }).sort((a, b) => b.launches - a.launches)

          tooltipRef.current.style.opacity = '1'
          tooltipRef.current.style.left = `${margin.left + x(year) + 12}px`
          tooltipRef.current.style.top  = `${margin.top + 8}px`
          tooltipRef.current.innerHTML = `
            <div class="${styles.tooltipYear}">${year}</div>
            ${vals.map(v => `
              <div class="${styles.tooltipRow}">
                <span style="color:${COUNTRY_HEX[v.country]}">${COUNTRY_FLAGS[v.country]} ${v.country}</span>
                <span class="${styles.tooltipVal}">${v.launches}</span>
              </div>
            `).join('')}
          `
        }
      })
      .on('mouseleave', () => {
        hoverLine.attr('opacity', 0)
        setHoverYear(null)
        if (tooltipRef.current) tooltipRef.current.style.opacity = '0'
      })

    void hoverYear // suppress unused warning

  }, [series, active, yearRange, dimensions])

  return (
    <div className={styles.wrap}>
      {/* Legend / toggles */}
      <div className={styles.legend}>
        {ALL_COUNTRIES.map(c => (
          <button
            key={c}
            className={`${styles.legendBtn} ${active.has(c) ? styles.legendBtnActive : ''}`}
            style={{ '--country-color': COUNTRY_HEX[c] } as React.CSSProperties}
            onClick={() => toggleCountry(c)}
          >
            <span className={styles.legendDot} />
            {COUNTRY_FLAGS[c]} {c}
          </button>
        ))}
      </div>

      <div className={styles.chartWrap} ref={wrapRef}>
        <svg ref={svgRef} className={styles.svg} />
        <div ref={tooltipRef} className={styles.tooltip} />
      </div>
    </div>
  )
}
