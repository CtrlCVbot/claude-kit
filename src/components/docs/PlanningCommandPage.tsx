import { RuntimeTabs } from './RuntimeTabs'
import { PageHeader } from './PageHeader'
import type { PlanningPage } from '@/lib/docs/types'

type PlanningCommandPageProps = {
  page: PlanningPage
}

export function PlanningCommandPage({ page }: PlanningCommandPageProps) {
  return (
    <article className="doc-card">
      <PageHeader eyebrow={`${page.phase} · ${page.command}`} title={page.title} description={page.description} />

      <section className="section" id="purpose">
        <h2>목적</h2>
        <p>{page.purpose}</p>
      </section>

      <section className="section" id="when-to-use">
        <h2>언제 사용하나</h2>
        <ul>
          {page.whenToUse.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="section" id="inputs-outputs">
        <h2>입력과 산출물</h2>
        <div className="grid">
          <div className="tile">
            <h3>입력</h3>
            <ul>
              {page.inputs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="tile">
            <h3>산출물</h3>
            <ul>
              {page.outputs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section" id="runtime">
        <h2>Claude / Codex 기능</h2>
        <RuntimeTabs runtimes={page.runtimes} />
      </section>

      <section className="section" id="lifecycle">
        <h2>Lifecycle</h2>
        <div className="step-list">
          {page.lifecycle.map((item, index) => (
            <div className="step" key={item}>
              <div className="step-number">{String(index + 1).padStart(2, '0')}</div>
              <div>{item}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="rules">
        <h2>운영 규칙</h2>
        <ul>
          {page.rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>
    </article>
  )
}
