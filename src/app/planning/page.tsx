import Link from 'next/link'
import { DocsShell } from '@/components/docs/DocsShell'
import { PageHeader } from '@/components/docs/PageHeader'
import { planningPages } from '@/lib/docs/planning-pages'

const toc = [
  { id: 'pipeline-map', label: 'Pipeline map' },
  { id: 'commands', label: 'Commands' },
  { id: 'design-branch', label: 'Design branch' }
]

export default function PlanningIndexPage() {
  return (
    <DocsShell toc={toc}>
      <article className="doc-card">
        <PageHeader
          eyebrow="Planning"
          title="기획 파이프라인 전체 지도"
          description="아이디어 등록부터 Epic 분해, PRD, 디자인, 개발 handoff, review, archive까지 이어지는 claude-kit 운영 흐름입니다."
        />

        <section className="section" id="pipeline-map">
          <h2>Core execution flow</h2>
          <p>
            아래 지도는 idea에서 개발 handoff까지 이어지는 기본 실행 흐름입니다. 리뷰, 수정, 개선, 아카이브 단계는 전체 명령
            목록에서 별도 운영 흐름으로 확인합니다.
          </p>
          <div className="step-list">
            {planningPages.slice(0, 9).map((page) => (
              <Link className="step" href={`/planning/${page.slug}`} key={page.slug}>
                <span className="step-number">{page.phase}</span>
                <span>
                  <strong>{page.command}</strong>
                  <br />
                  {page.description}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section" id="commands">
          <h2>Command 상세</h2>
          <div className="grid">
            {planningPages.map((page) => (
              <Link className="tile" href={`/planning/${page.slug}`} key={page.slug}>
                <h3>{page.command}</h3>
                <p>{page.title}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="section" id="design-branch">
          <h2>디자인 분기</h2>
          <p>
            `/plan-design`은 Claude Code 디자인을 위한 기본 명령과 파이프라인입니다. `/plan-stitch`는 Google Stitch 활용 여부를
            판단하는 선택 분기지만, 이 프로젝트에서는 실제 사용 여부와 관계없이 checkpoint를 남깁니다.
          </p>
        </section>
      </article>
    </DocsShell>
  )
}
