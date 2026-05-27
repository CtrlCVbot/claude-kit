import type { ExamplePage } from './types'

export const examplePages: ExamplePage[] = [
  {
    slug: 'website-build-pipeline',
    title: '웹사이트 전환 파이프라인',
    description: '이번 문서 사이트 전환을 claude-kit P1~A1 흐름으로 실행하는 예시입니다.',
    sections: [
      {
        title: '큰 흐름',
        body: '작업은 idea 등록에서 시작해 screening, Epic 분해, Feature별 planning/dev loop, review, archive로 이어집니다.',
        items: ['/plan-idea', '/plan-screen', '/plan-epic', 'Feature별 /plan-draft ~ /dev-run', '/plan-review', '/plan-archive']
      },
      {
        title: '이번 작업의 핵심 결정',
        body: '웹사이트는 claude-kit core 기능이 아니라 docs surface입니다. 따라서 protected path 변경을 금지하고, Next.js 구현은 docs route와 component에만 둡니다.',
        items: ['core first', 'Preview first', 'HTML reference 보존', '단위별 review/commit']
      }
    ]
  },
  {
    slug: 'website-build-epic',
    title: 'Epic과 Feature 분해 예시',
    description: '큰 웹사이트 전환 작업을 구현 가능한 child Feature로 나누는 방식입니다.',
    sections: [
      {
        title: 'Epic',
        body: '`EPIC-20260527-001`은 사용자 가이드 문서 웹사이트화를 관리하는 umbrella 산출물입니다.',
        items: ['docs-shell', 'planning-content-migration', 'runtime-tabs-and-matrices', 'pipeline-example-pages', 'vercel-preview-safety', 'guide-sync']
      },
      {
        title: 'Feature 분리 이유',
        body: '문서 shell, content migration, 예시 페이지, 배포 검증은 서로 검증 방식과 리스크가 다르므로 커밋과 review 단위를 분리합니다.'
      }
    ]
  },
  {
    slug: 'website-build-artifacts',
    title: '산출물 위치 예시',
    description: '각 단계가 어떤 파일을 만들고 어디로 이동하는지 보여줍니다.',
    sections: [
      {
        title: '기획 산출물',
        body: 'P1~P2.5는 `.plans` 아래에 idea, screening, epic, feature brief를 남깁니다.',
        items: ['.plans/ideas/20-approved/IDEA-20260527-001.md', '.plans/ideas/10-screening/SCREENING-20260527-001.md', '.plans/epics/20-active/EPIC-20260527-001', '.plans/features/briefs/*.md']
      },
      {
        title: '문서 산출물',
        body: '`docs/plans/user-guide-website/execution-log.md`는 실제 실행 흐름과 프롬프트 요약을 기록합니다.'
      }
    ]
  },
  {
    slug: 'website-build-commands',
    title: '실행 프롬프트 예시',
    description: '사용자가 복잡한 요구사항을 매번 반복하지 않아도 되도록 최소 프롬프트 형태로 정리합니다.',
    sections: [
      {
        title: '예시',
        body: '프롬프트는 목표와 기준 문서만 짧게 전달하고, 공통 규칙은 runbook을 참조합니다.',
        items: [
          '/plan-idea "docs/user-guide-html 가이드를 Next.js 문서 웹사이트로 전환합니다. 공통 규칙은 06-pipeline-prompt-runbook.md를 따릅니다."',
          '/plan-screen IDEA-20260527-001',
          '/plan-epic IDEA-20260527-001 "EPIC-DOCS-WEBSITE"'
        ]
      }
    ]
  }
]

export function getExamplePage(slug: string) {
  return examplePages.find((page) => page.slug === slug)
}
