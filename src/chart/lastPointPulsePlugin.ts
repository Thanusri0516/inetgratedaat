import type { Chart, Plugin } from 'chart.js'

function drawPulse(
  chart: Chart<'line'>,
  x: number,
  y: number,
  useOverlay: boolean,
) {
  const t = performance.now() / 1000
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.8)
  const rOuter = 10 + pulse * 6
  const rInner = 5 + pulse * 2

  const dark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  const rgb = useOverlay ? '249, 115, 22' : dark ? '192, 132, 252' : '124, 58, 237'

  const ctx = chart.ctx
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, rOuter, 0, Math.PI * 2)
  ctx.strokeStyle = `rgba(${rgb}, ${0.12 + pulse * 0.18})`
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(x, y, rInner, 0, Math.PI * 2)
  ctx.strokeStyle = `rgba(${rgb}, ${0.35 + pulse * 0.25})`
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.restore()
}

/**
 * Pulses the live overlay point when present; otherwise the last point of the main series.
 */
export const lastPointPulsePlugin: Plugin<'line'> = {
  id: 'lastPointPulse',
  afterDatasetsDraw(chart: Chart<'line'>) {
    const n = chart.data.datasets[0]?.data.length ?? 0
    if (n === 0) return
    const lastIdx = n - 1

    const meta0 = chart.getDatasetMeta(0)
    const last0 = meta0.data[meta0.data.length - 1]
    if (!last0) return

    if (chart.data.datasets.length > 1) {
      const meta1 = chart.getDatasetMeta(1)
      const el1 = meta1.data[lastIdx]
      if (el1) {
        const { x, y } = el1.getProps(['x', 'y'], true)
        if (x != null && y != null && Number.isFinite(y)) {
          drawPulse(chart, x, y, true)
          return
        }
      }
    }

    const { x, y } = last0.getProps(['x', 'y'], true)
    if (x != null && y != null) drawPulse(chart, x, y, false)
  },
}
