'use client'

import { useState } from 'react'
import type { RuntimeInfo } from '@/lib/docs/types'

type RuntimeTabsProps = {
  runtimes: RuntimeInfo[]
}

export function RuntimeTabs({ runtimes }: RuntimeTabsProps) {
  const [selected, setSelected] = useState(runtimes[0]?.target ?? 'Claude')
  const active = runtimes.find((runtime) => runtime.target === selected) ?? runtimes[0]

  return (
    <div className="runtime-tabs">
      <div className="tab-list" role="tablist" aria-label="Runtime target">
        {runtimes.map((runtime) => (
          <button
            aria-controls={`runtime-${runtime.target}`}
            aria-selected={runtime.target === selected}
            className="tab-button"
            id={`tab-${runtime.target}`}
            key={runtime.target}
            onClick={() => setSelected(runtime.target)}
            role="tab"
            type="button"
          >
            {runtime.target}
          </button>
        ))}
      </div>
      <section
        aria-labelledby={`tab-${active.target}`}
        className="tab-panel"
        id={`runtime-${active.target}`}
        role="tabpanel"
      >
        <p>{active.summary}</p>
        <h3>사용 자산</h3>
        <div className="pill-row">
          {active.assets.map((asset) => (
            <span className="pill" key={asset}>
              {asset}
            </span>
          ))}
        </div>
        <h3>운영 메모</h3>
        <ul>
          {active.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
