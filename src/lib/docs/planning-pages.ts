import type { PlanningPage } from './types'

const commonClaudeAssets = ['Claude command', '관련 subagent', 'workflow skill', 'rules', 'hooks']
const commonCodexAssets = ['Codex skill', 'custom subagent 후보', 'AGENTS.md guidance', 'hook pair 후보']

export const planningPages: PlanningPage[] = [
  {
    slug: 'plan-idea',
    command: '/plan-idea',
    phase: 'P1',
    title: '아이디어 등록',
    description: '흩어진 요청을 추적 가능한 idea entry로 바꾸는 첫 단계입니다.',
    purpose: '사용자의 초기 요구를 문제, 가치, 범위, 제약으로 정리해 backlog에 등록합니다.',
    whenToUse: ['새 기능을 시작할 때', '요청이 아직 PRD로 가기에는 거칠 때', '아이디어의 출처와 배경을 남겨야 할 때'],
    inputs: ['사용자 요청 원문', '관련 문서나 기존 산출물', '범위와 제약'],
    outputs: ['`.plans/ideas/00-inbox/IDEA-*.md`', 'backlog row', '다음 screening 후보'],
    lifecycle: ['inbox에 등록', 'screening 대기', 'screening 후 approved/hold/archive로 이동'],
    rules: ['한 idea는 하나의 문제를 다룹니다.', 'core 기능 보호 조건은 idea 단계부터 명시합니다.', '바로 구현하지 않고 screening으로 넘깁니다.'],
    runtimes: [
      {
        target: 'Claude',
        summary: 'Claude command가 idea 파일을 만들고 idea-management skill이 folder/lifecycle 규칙을 안내합니다.',
        assets: ['src/claude/plan/commands/plan-idea.md', 'plan-idea-management skill', 'plan idea folder rules'],
        notes: ['초기 맥락 정리가 강점입니다.', '사용자 표현을 보존하면서 실행 가능한 구조로 바꿉니다.']
      },
      {
        target: 'Codex',
        summary: 'Codex는 command copy가 아니라 skill 중심 workflow로 idea 등록 기준을 재현합니다.',
        assets: ['src/codex/plan/skills/plan-idea-workflow', ...commonCodexAssets],
        notes: ['slash command가 핵심 surface가 아닙니다.', 'skill 안에서 입력, 출력, 이동 규칙을 설명합니다.']
      }
    ]
  },
  {
    slug: 'plan-screen',
    command: '/plan-screen',
    phase: 'P2',
    title: '아이디어 스크리닝',
    description: '등록된 idea를 Go/Hold/Kill 기준으로 평가합니다.',
    purpose: '사용자 가치, 비용, 리스크, 타이밍을 비교해 다음 단계 진행 여부를 결정합니다.',
    whenToUse: ['idea가 backlog에 들어온 뒤', '진행할지 보류할지 판단해야 할 때', '범위를 줄여야 하는지 확인할 때'],
    inputs: ['IDEA 파일', '평가 기준', '관련 제약'],
    outputs: ['screening report', 'screening matrix update', 'approved/hold/archive 이동 결정'],
    lifecycle: ['10-screening으로 이동', '점수와 판정 기록', 'Go면 20-approved로 이동'],
    rules: ['Go 판정도 리스크와 조건을 함께 남깁니다.', '승인 근거 없이 구현으로 넘어가지 않습니다.', 'Hold/Kill도 보존 가능한 기록으로 남깁니다.'],
    runtimes: [
      {
        target: 'Claude',
        summary: 'Claude는 screener agent와 screening workflow를 통해 평가표와 판정을 작성합니다.',
        assets: ['plan-idea-screener agent', 'plan-screening-workflow skill', 'screening matrix'],
        notes: ['RICE나 5축 가중 평가를 적용할 수 있습니다.']
      },
      {
        target: 'Codex',
        summary: 'Codex는 screening skill과 필요 시 reviewer subagent로 평가 결과를 재현합니다.',
        assets: ['plan-screen workflow skill', 'screening criteria guidance', 'optional reviewer subagent'],
        notes: ['평가 결과는 Codex runtime artifact가 아니라 `.plans` 산출물로 남깁니다.']
      }
    ]
  },
  {
    slug: 'plan-epic',
    command: '/plan-epic',
    phase: 'P2.5',
    title: 'Epic 분해',
    description: '큰 목표를 여러 Feature와 milestone으로 나눕니다.',
    purpose: '3개 이상의 Feature나 cross-cutting 요구사항이 있는 작업을 umbrella로 묶어 관리합니다.',
    whenToUse: ['작업이 여러 Feature로 나뉠 때', 'Feature 간 순서와 의존성을 관리해야 할 때', '상위 목표와 완료 조건을 따로 보존해야 할 때'],
    inputs: ['approved idea', '상위 목표', 'Feature 후보'],
    outputs: ['Epic brief', 'children features', 'roadmap/decision log 후보'],
    lifecycle: ['draft', 'planning', 'active', 'completed', 'archived'],
    rules: ['작은 Feature 1~2개에는 Epic을 강제하지 않습니다.', '각 child Feature는 최소 idea brief를 가집니다.', 'Epic은 구현 단위가 아니라 상위 관리 단위입니다.'],
    runtimes: [
      {
        target: 'Claude',
        summary: 'Claude는 Epic workflow로 Feature 목록과 dependency map을 생성합니다.',
        assets: ['plan-epic-workflow skill', 'Epic hierarchy rules', 'children features template'],
        notes: ['Feature 상태와 Epic 상태를 함께 추적합니다.']
      },
      {
        target: 'Codex',
        summary: 'Codex는 Epic 관리 기준을 skill로 제공하고, 필요 시 planning reviewer subagent로 구조를 점검합니다.',
        assets: ['plan-epic workflow skill 후보', 'planning reviewer subagent 후보', 'AGENTS.md planning guidance'],
        notes: ['Codex에서도 Epic은 runtime agent가 아니라 `.plans` 관리 산출물입니다.']
      }
    ]
  },
  {
    slug: 'plan-draft',
    command: '/plan-draft',
    phase: 'P3',
    title: '초안 작성',
    description: '아이디어를 첫 번째 기능 기획 초안으로 확장합니다.',
    purpose: 'PRD 전에 사용자 흐름, 범위, 주요 결정 후보를 빠르게 정리합니다.',
    whenToUse: ['Go 판정 후 PRD로 바로 가기 전', '범위를 더 명확히 나눠야 할 때', 'Feature별 기획 가설을 확인할 때'],
    inputs: ['approved idea 또는 feature brief', '관련 Epic', '기존 문서'],
    outputs: ['draft spec', '초기 route/content/component 영향', 'PRD 입력'],
    lifecycle: ['draft 생성', '리뷰', 'PRD로 승격 또는 보류'],
    rules: ['PRD처럼 과도하게 상세하지 않아도 됩니다.', '범위와 non-goal은 반드시 남깁니다.', '다음 단계에서 검증할 질문을 명시합니다.'],
    runtimes: [
      {
        target: 'Claude',
        summary: 'draft writer agent와 planning skill이 초안을 만듭니다.',
        assets: ['plan-draft-writer agent', 'planning pipeline skill'],
        notes: ['모호한 요구를 정리하는 데 강합니다.']
      },
      {
        target: 'Codex',
        summary: 'Codex는 draft workflow skill로 초안 구조와 체크리스트를 제공합니다.',
        assets: ['plan-draft workflow skill', ...commonCodexAssets],
        notes: ['필요하면 reviewer subagent가 초안의 범위 과잉을 점검합니다.']
      }
    ]
  },
  {
    slug: 'plan-prd',
    command: '/plan-prd',
    phase: 'P4',
    title: 'PRD 작성',
    description: '구현 가능한 요구사항과 acceptance criteria를 확정합니다.',
    purpose: '문제, 사용자, 기능 요구사항, 비기능 요구사항, 검증 기준을 하나의 기준 문서로 만듭니다.',
    whenToUse: ['구현 전에 요구사항을 잠가야 할 때', '여러 이해관계자 리뷰가 필요할 때', 'acceptance criteria가 필요한 기능일 때'],
    inputs: ['draft 또는 feature brief', '사용자 가치', '제약과 리스크'],
    outputs: ['PRD', 'acceptance criteria', '검증 기준'],
    lifecycle: ['PRD 작성', 'review', 'wireframe/design/bridge 입력으로 사용'],
    rules: ['10개 핵심 섹션을 빠뜨리지 않습니다.', '검증 가능한 요구사항으로 씁니다.', 'non-goal과 리스크를 숨기지 않습니다.'],
    runtimes: [
      {
        target: 'Claude',
        summary: 'PRD writer agent와 authoring skill이 요구사항 문서를 작성합니다.',
        assets: ['plan-prd-writer agent', 'plan-prd-authoring skill', 'review criteria'],
        notes: ['요구사항 품질 기준을 함께 적용합니다.']
      },
      {
        target: 'Codex',
        summary: 'Codex는 PRD authoring skill과 reviewer subagent 후보를 통해 PRD 품질을 점검합니다.',
        assets: ['plan-prd workflow skill', 'plan-reviewer subagent 후보'],
        notes: ['Codex에서는 command보다 skill 문서가 public workflow에 가깝습니다.']
      }
    ]
  },
  {
    slug: 'plan-wireframe',
    command: '/plan-wireframe',
    phase: 'P5',
    title: '와이어프레임',
    description: '화면 구조와 정보 흐름을 텍스트/다이어그램으로 설계합니다.',
    purpose: '디자인 또는 구현 전에 화면의 구조, navigation, 상태를 명확히 합니다.',
    whenToUse: ['사용자 화면이 있는 기능', 'route와 layout이 바뀌는 기능', '문서 구조를 시각적으로 정리해야 할 때'],
    inputs: ['PRD', '기존 UI reference', 'route 후보'],
    outputs: ['wireframe', 'navigation map', 'state notes'],
    lifecycle: ['wireframe 작성', 'design checkpoint', 'bridge 입력'],
    rules: ['구현 가능한 수준으로 단순하게 시작합니다.', '모바일과 빈 상태를 함께 봅니다.', '시각 스타일보다 정보 구조를 먼저 잡습니다.'],
    runtimes: [
      {
        target: 'Claude',
        summary: 'wireframe designer agent와 skill이 ASCII/Mermaid 중심의 설계를 만듭니다.',
        assets: ['plan-wireframe-designer agent', 'plan-wireframe-design skill'],
        notes: ['초기 정보 구조를 빠르게 잡기 좋습니다.']
      },
      {
        target: 'Codex',
        summary: 'Codex는 wireframe skill과 optional subagent로 구조 검토를 수행합니다.',
        assets: ['plan-wireframe workflow skill', 'wireframe designer subagent 후보'],
        notes: ['실제 이미지 생성이 아니라 구현 가능한 구조 문서에 집중합니다.']
      }
    ]
  },
  {
    slug: 'plan-design',
    command: '/plan-design',
    phase: 'P5.5',
    title: '디자인 체크포인트',
    description: 'Claude Code 디자인 흐름 기준으로 UI 방향과 컴포넌트 패턴을 결정합니다.',
    purpose: 'wireframe과 PRD를 바탕으로 유지할 디자인, 바꿀 디자인, 구현 패턴을 명시합니다.',
    whenToUse: ['UI가 있는 모든 Feature', '기존 HTML 디자인을 유지/확장할 때', 'Stitch 사용 여부를 판단하기 전'],
    inputs: ['PRD', 'wireframe', 'HTML reference'],
    outputs: ['design brief', 'component pattern', 'Stitch 판단 입력'],
    lifecycle: ['design checkpoint 작성', 'Stitch decision', 'bridge 입력'],
    rules: ['이 프로젝트에서는 선택이 아니라 기록해야 하는 checkpoint입니다.', 'Stitch는 선택이고 plan-design이 기본입니다.', '디자인 결정은 구현 handoff에 남깁니다.'],
    runtimes: [
      {
        target: 'Claude',
        summary: 'Claude Design workflow가 PRD와 wireframe을 연결해 UI 의사결정을 기록합니다.',
        assets: ['claude-design-workflow skill', 'plan-wireframe output'],
        notes: ['Claude Code 디자인을 위한 기본 명령과 파이프라인입니다.']
      },
      {
        target: 'Codex',
        summary: 'Codex는 design workflow skill로 동일한 판단 기준을 문서화합니다.',
        assets: ['design workflow skill 후보', 'docs component guidance'],
        notes: ['Codex에서는 plan-design도 skill 중심으로 정리하는 것이 일관됩니다.']
      }
    ]
  },
  {
    slug: 'plan-stitch',
    command: '/plan-stitch',
    phase: 'P6',
    title: 'Stitch 판단',
    description: 'Google Stitch를 사용할지, 참고만 할지, 건너뛸지 기록합니다.',
    purpose: 'Stitch 사용 여부와 이유를 명확히 남겨 디자인/구현 handoff가 흔들리지 않게 합니다.',
    whenToUse: ['디자인 산출물을 외부 도구로 보강할 수 있을 때', 'Stitch를 쓰지 않는 이유도 기록해야 할 때', '구현 전에 reference 충돌을 줄이고 싶을 때'],
    inputs: ['PRD', 'wireframe', 'design checkpoint'],
    outputs: ['use/review-only/skip-with-reason 결정', 'integration notes'],
    lifecycle: ['Stitch applicability 판단', 'bridge 입력으로 전달'],
    rules: ['이 프로젝트에서는 실제 사용하지 않아도 checkpoint를 남깁니다.', 'use 여부보다 이유가 중요합니다.', 'Stitch 결과가 core source를 바꾸면 안 됩니다.'],
    runtimes: [
      {
        target: 'Claude',
        summary: 'Stitch workflow skill이 PRD, wireframe, HTML reference 정합성을 점검합니다.',
        assets: ['plan-stitch-workflow skill', 'design checkpoint'],
        notes: ['Google Stitch를 활용하기 위한 선택적 분기입니다.']
      },
      {
        target: 'Codex',
        summary: 'Codex는 Stitch decision을 skill/checklist로 기록하고 bridge에 전달합니다.',
        assets: ['stitch workflow skill 후보', 'bridge guidance'],
        notes: ['Codex runtime 기능이라기보다 planning 기록입니다.']
      }
    ]
  },
  {
    slug: 'plan-bridge',
    command: '/plan-bridge',
    phase: 'P7',
    title: '개발 handoff',
    description: '기획 산출물을 개발자가 바로 실행할 수 있는 패키지로 바꿉니다.',
    purpose: 'route, component, content, task, 검증 기준을 묶어 구현 단위로 넘깁니다.',
    whenToUse: ['PRD와 디자인 결정이 끝난 뒤', '개발 task를 나눠야 할 때', '비회귀 검증을 명시해야 할 때'],
    inputs: ['PRD', 'design/stitch decision', 'wireframe', '검증 기준'],
    outputs: ['bridge package', 'task split', 'dev-feature 입력'],
    lifecycle: ['bridge 작성', 'dev-feature package 생성', 'dev-run 실행'],
    rules: ['구현자가 추가 질문 없이 시작할 수 있어야 합니다.', 'protected path와 검증 명령을 포함합니다.', 'task는 커밋 가능한 단위로 쪼갭니다.'],
    runtimes: [
      {
        target: 'Claude',
        summary: 'bridge writer agent와 dev-feature-plan skill이 기획과 개발을 연결합니다.',
        assets: ['plan-bridge-writer agent', 'dev-feature-plan skill'],
        notes: ['기획 완료와 개발 시작 사이의 핵심 문턱입니다.']
      },
      {
        target: 'Codex',
        summary: 'Codex는 bridge를 구현 prompt와 validation plan으로 해석합니다.',
        assets: ['bridge workflow skill 후보', 'dev workflow skill'],
        notes: ['bridge 이후에는 코드 수정과 검증 중심으로 전환됩니다.']
      }
    ]
  },
  {
    slug: 'plan-review',
    command: '/plan-review',
    phase: 'R1',
    title: '기획 리뷰',
    description: '산출물이 다음 단계로 넘어가도 안전한지 검토합니다.',
    purpose: '누락, 충돌, 과도한 범위, 검증 부족을 찾아 반영하거나 보류합니다.',
    whenToUse: ['각 계획 산출물 작성 후', 'PRD/bridge 승인 전', '구현 전 리스크를 줄이고 싶을 때'],
    inputs: ['검토할 산출물', 'stage type', '관련 기준 문서'],
    outputs: ['review notes', 'severity/action', '반영 결과'],
    lifecycle: ['review', 'auto-fix 또는 queued', '다음 단계 승인'],
    rules: ['critical/high는 가능한 즉시 반영합니다.', '보류한 피드백은 이유와 다음 액션을 남깁니다.', '리뷰는 최소 1회 수행합니다.'],
    runtimes: [
      {
        target: 'Claude',
        summary: 'plan-reviewer agent와 review criteria skill이 PCC와 severity를 적용합니다.',
        assets: ['plan-reviewer agent', 'plan-review-criteria skill'],
        notes: ['문서 품질과 다음 단계 안전성을 함께 봅니다.']
      },
      {
        target: 'Codex',
        summary: 'Codex는 reviewer subagent와 skill checklist로 독립 검토를 수행할 수 있습니다.',
        assets: ['plan-reviewer subagent 후보', 'review criteria skill'],
        notes: ['리뷰 결과는 수정 여부와 함께 남겨야 합니다.']
      }
    ]
  },
  {
    slug: 'plan-revise',
    command: '/plan-revise',
    phase: 'R2',
    title: '기획 수정',
    description: '리뷰 피드백이나 변경 요청을 반영해 기존 산출물을 안전하게 고칩니다.',
    purpose: '기획 변경을 추적 가능하게 반영하고 다음 단계 기준을 다시 맞춥니다.',
    whenToUse: ['리뷰 후 수정이 필요할 때', '요구사항이 바뀌었을 때', '기존 산출물과 구현 방향이 어긋났을 때'],
    inputs: ['수정 대상 산출물', '피드백 목록', '반영 범위'],
    outputs: ['수정된 산출물', 'change note', '재검토 필요 여부'],
    lifecycle: ['피드백 분류', '수정 반영', '재검토'],
    rules: ['무엇을 바꿨는지 기록합니다.', '승인된 기준을 조용히 뒤집지 않습니다.', '영향 받는 downstream 산출물을 표시합니다.'],
    runtimes: [
      {
        target: 'Claude',
        summary: 'Claude command가 수정 범위를 정리하고 관련 산출물 변경을 안내합니다.',
        assets: ['plan-revise command', ...commonClaudeAssets],
        notes: ['기존 문서와 변경 이유를 연결하는 데 집중합니다.']
      },
      {
        target: 'Codex',
        summary: 'Codex는 `plan-revise-workflow` skill로 수정 규칙을 제공하며 command는 문서형 entrypoint로 둡니다.',
        assets: ['src/codex/plan/skills/plan-revise-workflow/SKILL.md'],
        notes: ['최근 정한 기준처럼 workflow skill 중심으로 정리합니다.']
      }
    ]
  },
  {
    slug: 'plan-improve',
    command: '/plan-improve',
    phase: 'I1',
    title: '개선 요청 처리',
    description: '이미 진행 중이거나 완료된 기능의 개선 요청을 적절한 파이프라인 진입점으로 보냅니다.',
    purpose: '작은 문구 수정과 구조적 재설계를 같은 무게로 다루지 않도록 분기합니다.',
    whenToUse: ['사용자가 개선을 요청할 때', '변경 규모가 애매할 때', '기존 계획을 재사용할지 판단해야 할 때'],
    inputs: ['개선 요청', '현재 산출물', '변경 규모'],
    outputs: ['진입점 결정', '개선 backlog 또는 task', '검증 기준'],
    lifecycle: ['규모 판단', 'dev-only 또는 planning 재진입', 'review'],
    rules: ['작은 수정은 과한 planning으로 끌고 가지 않습니다.', '큰 변경은 P1/P3로 되돌립니다.', '기존 완료 기준과 충돌하면 명시합니다.'],
    runtimes: [
      {
        target: 'Claude',
        summary: 'Claude pipeline이 변경 규모를 판단해 적절한 단계로 보냅니다.',
        assets: ['plan-improve command', 'plan-review criteria'],
        notes: ['변경 규모 판단이 핵심입니다.']
      },
      {
        target: 'Codex',
        summary: 'Codex는 improvement triage skill로 진입점을 제안합니다.',
        assets: ['improvement workflow skill 후보'],
        notes: ['기능 구현보다 분기 기준 문서화가 중요합니다.']
      }
    ]
  },
  {
    slug: 'plan-archive',
    command: '/plan-archive',
    phase: 'A1',
    title: '산출물 아카이브',
    description: '완료된 산출물을 추적 가능한 bundle로 정리합니다.',
    purpose: '아이디어부터 검증 evidence까지 작업의 흐름을 보존합니다.',
    whenToUse: ['Epic 또는 Feature가 완료됐을 때', '다음 작업 전에 산출물을 정리할 때', '회고나 재사용이 필요할 때'],
    inputs: ['완료된 idea/epic/feature 산출물', 'review notes', 'verification evidence'],
    outputs: ['archive bundle', 'archive index', 'source 이동 기록'],
    lifecycle: ['완료 검증', 'bundle 생성', 'archive 이동', 'index 갱신'],
    rules: ['완료 전 archive하지 않습니다.', '원본 이동 규칙을 지킵니다.', '검증 evidence를 함께 묶습니다.'],
    runtimes: [
      {
        target: 'Claude',
        summary: 'archive workflow skill이 산출물 수집, 이동, 인덱스 갱신을 안내합니다.',
        assets: ['plan-archive-workflow skill', 'archive command'],
        notes: ['종료 기준과 보존 위치가 중요합니다.']
      },
      {
        target: 'Codex',
        summary: 'Codex는 archive checklist를 skill로 제공하고, 필요한 파일 위치를 점검합니다.',
        assets: ['archive workflow skill 후보', 'AGENTS.md guidance'],
        notes: ['archive는 runtime 기능이 아니라 운영 산출물 정리입니다.']
      }
    ]
  }
]

export function getPlanningPage(slug: string) {
  return planningPages.find((page) => page.slug === slug)
}
