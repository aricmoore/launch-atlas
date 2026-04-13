import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import type { RaceFrame } from '@/types'
import { COUNTRY_HEX, COUNTRY_FLAGS } from '@/utils/colors'
import styles from './BarChartRace.module.css'

interface Props {
  frames: RaceFrame[]
}

const ANIMATION_DURATION = 800 // ms per year frame
const BAR_COUNT = 8

export function BarChartRace({ frames }: Props) {
  const svgRef   = useRef<SVGSVGElement>(null)
  const wrapRef  = useRef<HTMLDivElement>(null)
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying]       = useState(false)
  const [dimensions, setDimensions] = useState({ width: 800, height: 480 })
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentFrame = frames[frameIndex]

  // Responsive dimensions
  useEffect(() => {
    if (!wrapRef.current) return
    const obs = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect
      setDimensions({ width, height: Math.min(Math.max(width * 0.55, 320), 560) })
    })
    obs.observe(wrapRef.current)
    return () => obs.disconnect()
  }, [])

  // D3 render
  useEffect(() => {
    if (!svgRef.current || !currentFrame || frames.length === 0) return

    const { width, height } = dimensions
    const isMobile = width < 480
    const margin = {
      top:    24,
      right:  isMobile ? 60 : 140,
      bottom: 40,
      left:   isMobile ? 80 : 110,
    }
    const innerW = width  - margin.left - margin.right
    const innerH = height - margin.top  - margin.bottom

    const svg = d3.select(svgRef.current)
    svg.attr('width', width).attr('height', height)

    // Init once
    let g = svg.select<SVGGElement>('g.root')
    if (g.empty()) {
      g = svg.append('g').attr('class', 'root')
    }
    g.attr('transform', `translate(${margin.left},${margin.top})`)

    const bars = currentFrame.bars.slice(0, BAR_COUNT)
    const maxVal = d3.max(bars, d => d.cumulative) ?? 1

    const x = d3.scaleLinear().domain([0, maxVal * 1.05]).range([0, innerW])
    const barH  = Math.floor((innerH) / BAR_COUNT) - 6
    const rankY = (rank: number) => rank * (barH + 6)

    // Define per-country gradients in <defs>
    let defs = svg.select<SVGDefsElement>('defs')
    if (defs.empty()) defs = svg.insert('defs', ':first-child')

    // Grid lines (subtle horizontal rules)
    const xTicks = x.ticks(5)
    let gridG = g.select<SVGGElement>('g.grid')
    if (gridG.empty()) gridG = g.append('g').attr('class', 'grid')
    gridG.selectAll('line.grid-line')
      .data(xTicks)
      .join('line')
      .attr('class', 'grid-line')
      .attr('x1', d => x(d)).attr('x2', d => x(d))
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', 'rgba(255,255,255,0.04)')
      .attr('stroke-width', 1)

    // Tick labels on x-axis — lighter grey
    let axisG = g.select<SVGGElement>('g.x-axis')
    if (axisG.empty()) axisG = g.append('g').attr('class', 'x-axis')
    axisG.attr('transform', `translate(0,${innerH + 8})`)
    axisG.selectAll('text.x-tick')
      .data(xTicks)
      .join('text')
      .attr('class', 'x-tick')
      .attr('x', d => x(d))
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(180,180,190,0.55)')
      .style('font-family', 'var(--font-mono)')
      .style('font-size', '9px')
      .style('letter-spacing', '0.04em')
      .text(d => d.toLocaleString())

    // Gradients
    bars.forEach(bar => {
      const id = `bar-grad-${bar.country.replace(/\s/g, '')}`
      const hex = COUNTRY_HEX[bar.country]
      if (defs.select(`#${id}`).empty()) {
        const grad = defs.append('linearGradient')
          .attr('id', id)
          .attr('x1', '0%').attr('y1', '0%')
          .attr('x2', '100%').attr('y2', '0%')
        grad.append('stop').attr('offset', '0%')
          .attr('stop-color', hex).attr('stop-opacity', '0.9')
        grad.append('stop').attr('offset', '70%')
          .attr('stop-color', hex).attr('stop-opacity', '0.75')
        grad.append('stop').attr('offset', '100%')
          .attr('stop-color', hex).attr('stop-opacity', '0.45')
      }
      // Glow filter
      const filterId = `glow-${bar.country.replace(/\s/g, '')}`
      if (defs.select(`#${filterId}`).empty()) {
        const filt = defs.append('filter').attr('id', filterId)
          .attr('x', '-20%').attr('y', '-40%')
          .attr('width', '140%').attr('height', '180%')
        filt.append('feGaussianBlur')
          .attr('in', 'SourceGraphic')
          .attr('stdDeviation', '3')
          .attr('result', 'blur')
        const merge = filt.append('feMerge')
        merge.append('feMergeNode').attr('in', 'blur')
        merge.append('feMergeNode').attr('in', 'SourceGraphic')
      }
    })

    // Data join
    const sel = g.selectAll<SVGGElement, typeof bars[0]>('g.bar-group')
      .data(bars, d => d.country)

    // Enter
    const enter = sel.enter()
      .append('g')
      .attr('class', 'bar-group')
      .attr('transform', (_, i) => `translate(0, ${rankY(i)})`)

    // Background track
    enter.append('rect')
      .attr('class', 'bar-track')
      .attr('height', barH)
      .attr('rx', 2)
      .attr('width', innerW)
      .attr('fill', 'rgba(255,255,255,0.025)')

    // Glow layer (behind bar)
    enter.append('rect')
      .attr('class', 'bar-glow')
      .attr('height', barH)
      .attr('rx', 2)
      .attr('width', 0)
      .attr('fill', d => COUNTRY_HEX[d.country])
      .attr('opacity', 0.15)
      .attr('filter', d => `url(#glow-${d.country.replace(/\s/g, '')})`)

    // Main bar
    enter.append('rect')
      .attr('class', 'bar-rect')
      .attr('height', barH)
      .attr('rx', 2)
      .attr('width', 0)
      .attr('fill', d => `url(#bar-grad-${d.country.replace(/\s/g, '')})`)

    // Leading edge bright line
    enter.append('rect')
      .attr('class', 'bar-edge')
      .attr('height', barH)
      .attr('width', 2)
      .attr('rx', 1)
      .attr('x', 0)
      .attr('fill', d => COUNTRY_HEX[d.country])
      .attr('opacity', 0.9)

    // Tick marks inside bar (every 50 launches)
    enter.append('g').attr('class', 'bar-ticks')

    enter.append('text')
      .attr('class', 'bar-label')
      .attr('x', -8)
      .attr('y', barH / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', 'rgba(180,180,190,0.7)')
      .style('font-family', 'var(--font-mono)')
      .style('font-size', isMobile ? '9px' : '11px')
      .style('letter-spacing', '0.04em')

    enter.append('text')
      .attr('class', 'bar-value')
      .attr('y', barH / 2)
      .attr('dy', '0.35em')
      .attr('fill', 'var(--color-text-primary)')
      .style('font-family', 'var(--font-mono)')
      .style('font-size', '10px')
      .style('font-weight', '500')

    // Update + enter merged
    const all = sel.merge(enter)

    all.transition()
      .duration(ANIMATION_DURATION)
      .ease(d3.easeQuadInOut)
      .attr('transform', (_, i) => `translate(0, ${rankY(i)})`)

    all.select<SVGRectElement>('rect.bar-track')
      .attr('width', innerW)

    all.select<SVGRectElement>('rect.bar-glow')
      .transition().duration(ANIMATION_DURATION).ease(d3.easeQuadInOut)
      .attr('width', d => Math.max(0, x(d.cumulative)))

    all.select<SVGRectElement>('rect.bar-rect')
      .transition().duration(ANIMATION_DURATION).ease(d3.easeQuadInOut)
      .attr('width', d => Math.max(0, x(d.cumulative)))
      .attr('fill', d => `url(#bar-grad-${d.country.replace(/\s/g, '')})`)

    all.select<SVGRectElement>('rect.bar-edge')
      .transition().duration(ANIMATION_DURATION).ease(d3.easeQuadInOut)
      .attr('x', d => Math.max(0, x(d.cumulative) - 2))
      .attr('fill', d => COUNTRY_HEX[d.country])

    // Tick marks inside bar
    all.select<SVGGElement>('g.bar-ticks')
      .each(function(d) {
        const tickGroup = d3.select(this)
        const barWidth = x(d.cumulative)
        const tickInterval = x(50) // every 50 launches
        const tickData = tickInterval > 4
          ? d3.range(tickInterval, barWidth - 4, tickInterval)
          : []
        tickGroup.selectAll('line.inner-tick')
          .data(tickData)
          .join('line')
          .attr('class', 'inner-tick')
          .attr('x1', t => t).attr('x2', t => t)
          .attr('y1', barH * 0.25).attr('y2', barH * 0.75)
          .attr('stroke', 'rgba(255,255,255,0.12)')
          .attr('stroke-width', 1)
      })

    all.select<SVGTextElement>('text.bar-label')
      .text(d => isMobile
        ? `${COUNTRY_FLAGS[d.country]} ${d.country.slice(0, 3)}`
        : `${COUNTRY_FLAGS[d.country]} ${d.country}`
      )

    all.select<SVGTextElement>('text.bar-value')
      .attr('x', d => x(d.cumulative) + 8)
      .transition()
      .duration(ANIMATION_DURATION)
      .ease(d3.easeQuadInOut)
      .attr('x', d => x(d.cumulative) + 8)
      .tween('text', function(d) {
        const node = this
        const prev = parseFloat(node.getAttribute('data-val') ?? '0')
        const interp = d3.interpolateNumber(prev, d.cumulative)
        node.setAttribute('data-val', String(d.cumulative))
        return (t: number) => { node.textContent = Math.round(interp(t)).toLocaleString() }
      })

    // Exit
    sel.exit()
      .transition()
      .duration(ANIMATION_DURATION)
      .attr('transform', `translate(0, ${innerH + 50})`)
      .remove()

    // Year label — lighter, pulses briefly on change
    let yearLabel = svg.select<SVGTextElement>('text.year-label')
    if (yearLabel.empty()) {
      yearLabel = svg.append('text').attr('class', 'year-label')
    }
    yearLabel
      .attr('x', width - 24)
      .attr('y', height - 16)
      .attr('text-anchor', 'end')
      .attr('fill', 'rgba(244,244,245,0.13)')
      .style('font-family', 'var(--font-mono)')
      .style('font-size', Math.min(width * 0.12, 92) + 'px')
      .style('font-weight', '700')
      .style('letter-spacing', '-0.03em')
      .text(currentFrame.year)
      // Brief bright flash then settle — telemetry readout feel
    yearLabel
      .transition().duration(80).attr('fill', 'rgba(244,244,245,0.22)')
      .transition().duration(600).attr('fill', 'rgba(244,244,245,0.13)')

  }, [currentFrame, dimensions, frames])

  // Playback
  const tick = useCallback(() => {
    setFrameIndex(i => {
      if (i >= frames.length - 1) {
        setPlaying(false)
        return i
      }
      return i + 1
    })
  }, [frames.length])

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(tick, ANIMATION_DURATION + 100)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [playing, tick])

  const handlePlay = () => {
    if (frameIndex >= frames.length - 1) setFrameIndex(0)
    setPlaying(true)
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <svg ref={svgRef} className={styles.svg} />

      {/* Scrubber */}
      <div className={styles.controls}>
        <button
          className={styles.playBtn}
          onClick={playing ? () => setPlaying(false) : handlePlay}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? '⏸' : '▶'}
        </button>

        <div className={styles.scrubberWrap}>
          <input
            type="range"
            className={styles.scrubber}
            min={0}
            max={frames.length - 1}
            value={frameIndex}
            onChange={e => {
              setPlaying(false)
              setFrameIndex(Number(e.target.value))
            }}
          />
          <div className={styles.scrubberTicks}>
            {frames.filter((_, i) => i % 5 === 0).map(f => (
              <span key={f.year} className={styles.tick}>{f.year}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
