import Link from 'next/link'
import { DocsShell } from '@/components/docs/DocsShell'
import { InfoGrid } from '@/components/docs/InfoGrid'
import { PageHeader } from '@/components/docs/PageHeader'

const toc = [
  { id: 'quickstart', label: '빠른 시작' },
  { id: 'principles', label: '운영 원칙' },
  { id: 'routes', label: '문서 구조' }
]

export default function HomePage() {
  return (
    <DocsShell toc={toc}>
      <article className="doc-card">
        <PageHeader
          eyebrow="User guide"
          hero
          title="claude-kit을 실제 프로젝트에서 쓰는 방법"
          description="기획 파이프라인, 개발 handoff, Claude/Codex 기능 차이, 산출물 위치를 한 곳에서 따라갈 수 있는 사용자 가이드입니다."
        />

        <section className="section" id="quickstart">
          <h2>빠른 시작</h2>
          <p>
            처음이라면 <Link href="/planning">기획 파이프라인</Link>에서 전체 흐름을 보고, 각 command 상세 페이지에서 입력,
            산출물, Claude/Codex runtime 차이를 확인하세요.
          </p>
          <div className="pill-row">
            <span className="pill">/plan-idea</span>
            <span className="pill">/plan-screen</span>
            <span className="pill">/plan-epic</span>
            <span className="pill">/plan-prd</span>
            <span className="pill">/plan-design</span>
            <span className="pill">/plan-bridge</span>
          </div>
        </section>

        <section className="section" id="principles">
          <h2>운영 원칙</h2>
          <InfoGrid
            items={[
              {
                title: 'Core first',
                body: '웹사이트와 문서는 부가 surface입니다. claude-kit command, skill, hook, installer source가 우선입니다.'
              },
              {
                title: 'Evidence first',
                body: '각 단계는 산출물 위치, 검증 결과, 다음 단계를 함께 남겨야 합니다.'
              },
              {
                title: 'Claude/Codex 분리',
                body: 'Claude command와 Codex skill/subagent는 같은 기능 identity를 공유하되 runtime surface는 다르게 설명합니다.'
              },
              {
                title: 'Preview first',
                body: 'Vercel은 Production보다 Preview 검증을 먼저 목표로 둡니다.'
              }
            ]}
          />
        </section>

        <section className="section" id="routes">
          <h2>문서 구조</h2>
          <div className="grid">
            <Link className="tile" href="/planning">
              <h3>Planning pipeline</h3>
              <p>Idea부터 archive까지 전체 흐름을 봅니다.</p>
            </Link>
            <Link className="tile" href="/planning/plan-epic">
              <h3>/plan-epic</h3>
              <p>이번 가이드에서 빠지지 않게 보강한 Epic 분해 흐름입니다.</p>
            </Link>
            <Link className="tile" href="/examples/website-build-pipeline">
              <h3>Website example</h3>
              <p>이 웹사이트 전환 작업 자체를 pipeline 예시로 봅니다.</p>
            </Link>
            <Link className="tile" href="/planning/reference">
              <h3>Reference</h3>
              <p>명령별 입력, 산출물, runtime surface를 빠르게 찾습니다.</p>
            </Link>
          </div>
        </section>
      </article>
    </DocsShell>
  )
}
