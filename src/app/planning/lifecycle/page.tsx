import { DocsShell } from '@/components/docs/DocsShell'
import { PageHeader } from '@/components/docs/PageHeader'

const toc = [
  { id: 'idea', label: 'Idea' },
  { id: 'epic', label: 'Epic' },
  { id: 'feature', label: 'Feature' }
]

export default function LifecyclePage() {
  return (
    <DocsShell toc={toc}>
      <article className="doc-card">
        <PageHeader
          eyebrow="Lifecycle"
          title="산출물 생성, 변경, 이동 규칙"
          description="claude-kit 파이프라인은 파일이 어디서 생기고 언제 이동하는지 명확히 남기는 것을 중요하게 봅니다."
        />

        <section className="section" id="idea">
          <h2>Idea lifecycle</h2>
          <div className="step-list">
            {['00-inbox', '10-screening', '20-approved', '90-archive'].map((step, index) => (
              <div className="step" key={step}>
                <div className="step-number">{index + 1}</div>
                <div>
                  <strong>{step}</strong>
                  <p>아이디어가 등록, 평가, 승인, 보관되는 위치입니다.</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="epic">
          <h2>Epic lifecycle</h2>
          <p>
            Epic은 `00-draft`, `10-planning`, `20-active`, `30-completed`, `90-archive` 상태를 가집니다. 이번 웹사이트 작업은
            `EPIC-20260527-001`로 active 상태에서 진행합니다.
          </p>
        </section>

        <section className="section" id="feature">
          <h2>Feature lifecycle</h2>
          <p>
            각 Feature는 idea brief를 가진 뒤 필요한 단계만 선택합니다. 단, `/plan-design`과 `/plan-stitch`는 실제 활용 여부와
            관계없이 checkpoint로 남깁니다.
          </p>
        </section>
      </article>
    </DocsShell>
  )
}
