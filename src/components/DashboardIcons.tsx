import type { SVGProps } from 'react'

const base = { width: 22, height: 22, viewBox: '0 0 24 24', 'aria-hidden': true as const }

export function IconThermometer(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <path d="M15 13V5a3 3 0 1 0-6 0v8a5 5 0 1 0 6 0zm-3 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
    </svg>
  )
}

export function IconChart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <path d="M4 19h16v2H4v-2zm2-4h2v3H6v-3zm4-6h2v9h-2V9zm4-4h2v13h-2V5zm4 8h2v5h-2v-5z" />
    </svg>
  )
}

export function IconSpark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <path d="M5 14h3v6H5v-6zm5-4h3v10h-3V10zm5-6h3v16h-3V4zm5 3h3v13h-3V7z" />
    </svg>
  )
}

export function IconChat(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-6.17L8 21v-3H6a2 2 0 0 1-2-2V5zm2 0v9h2v2l2.59-2H18V5H6zm2 3h8v2H8V8zm0-2h5v2H8V6z" />
    </svg>
  )
}
