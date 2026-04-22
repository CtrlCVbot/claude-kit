'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WRAPPER_TEMPLATE = path.join(ROOT, 'src', 'templates', 'CLAUDE-KIT-QUICKSTART.md.template');
const BLOCKS_DIR = path.join(ROOT, 'src', 'templates', 'quickstart', 'blocks');

const CORE_BLOCKS = [
  '01-header.md',
  '02-install-summary.md',
  '03-pipeline-chooser.md',
  '04-plan-flow.md',
  '05-dev-flow.md',
  '05b-copy-flow.md',
  '06-target-diff.md',
  '07-first-actions.md',
  '08-reconfig.md',
  '09-mini-glossary.md'
];

function renderQuickStart({ variant, activeDomains, activeTargets, version }) {
  if (!['install', 'repo'].includes(variant)) {
    throw new Error(`unsupported quickstart variant: ${variant}`);
  }

  const context = buildContext({ variant, activeDomains, activeTargets, version });
  const content = CORE_BLOCKS.map(name => renderBlock(name, context)).join('\n\n');
  const appendix = variant === 'repo' ? renderBlock('10-repo-appendix.md', context) : '';

  return renderWrapper({
    VARIANT_NOTE: context.VARIANT_NOTE,
    CONTENT: content,
    APPENDIX: appendix
  });
}

function renderWrapper(vars) {
  return substituteVars(readUtf8(WRAPPER_TEMPLATE), vars).trim() + '\n';
}

function renderBlock(filename, vars) {
  return substituteVars(readUtf8(path.join(BLOCKS_DIR, filename)), vars).trim();
}

function buildContext({ variant, activeDomains, activeTargets, version }) {
  return {
    VARIANT_NOTE: buildVariantNote(variant),
    VERSION: version,
    ACTIVE_DOMAINS: activeDomains.join(', '),
    ACTIVE_TARGETS: activeTargets.join(', '),
    SUMMARY_NOTE: buildSummaryNote(variant),
    OUTPUT_ROWS: buildOutputRows(activeTargets),
    PIPELINE_CHOOSER_ROWS: buildPipelineChooserRows(),
    PLAN_STATUS_NOTE: buildPlanStatusNote(variant, activeDomains),
    PLAN_FLOW_ROWS: buildPlanFlowRows(),
    PLAN_PATHS: buildPlanPaths(),
    DEV_STATUS_NOTE: buildDevStatusNote(variant, activeDomains),
    DEV_FLOW_ROWS: buildDevFlowRows(),
    QUALITY_GATE_ROWS: buildQualityGateRows(),
    TARGET_DIFF_NOTE: buildTargetDiffNote(variant, activeTargets),
    TARGET_DIFF_ROWS: buildTargetDiffRows(),
    PLAN_ACTIONS_NOTE: buildPlanActionsNote(variant, activeDomains),
    PLAN_ACTIONS: buildPlanActions(),
    DEV_ACTIONS_NOTE: buildDevActionsNote(variant),
    DEV_ACTIONS: buildDevActions(),
    COPY_STATUS_NOTE: buildCopyStatusNote(variant, activeDomains),
    COPY_FLOW_ROWS: buildCopyFlowRows(),
    COPY_ACTIONS_NOTE: buildCopyActionsNote(variant, activeDomains),
    COPY_ACTIONS: buildCopyActions(),
    RECONFIG_PROFILE_JSON: buildReconfigProfile(activeDomains, activeTargets),
    MINI_GLOSSARY_ROWS: buildMiniGlossaryRows()
  };
}

function buildVariantNote(variant) {
  if (variant === 'install') {
    return '> package-owned 문서다. 설치/업데이트 시 재생성되며, 핵심 온보딩은 이 문서에서 끝난다.';
  }

  return '> shared quickstart blocks에서 생성된 저장소용 canonical variant다. 마지막 appendix를 제외한 핵심 본문은 설치본 Quick Start와 같은 역할을 한다.';
}

function buildSummaryNote(variant) {
  if (variant === 'install') {
    return '아래 요약은 현재 설치 결과를 기준으로 작성되었다.';
  }

  return '아래 요약은 전체 지원 범위를 한 번에 설명하기 위한 대표 구성(`core, dev, plan` + `claude, codex`) 기준이다.';
}

function buildOutputRows(activeTargets) {
  const rows = [
    '| Quick Start | `CLAUDE-KIT-QUICKSTART.md` | 설치 직후 읽는 통합 온보딩 문서 |'
  ];

  if (activeTargets.includes('claude')) {
    rows.push('| Claude runtime | `.claude/` | Claude용 agents, commands, skills, hooks, rules 출력 |');
    rows.push('| Claude context | `CLAUDE.md` | Claude 런타임 컨텍스트 문서 |');
  }

  if (activeTargets.includes('codex')) {
    rows.push('| Codex runtime | `plugins/claude-kit/` | Codex repo-local plugin 출력 |');
    rows.push('| Codex context | `AGENTS.md` | Codex 런타임 컨텍스트 문서 |');
    rows.push('| Codex registry | `.agents/plugins/marketplace.json` | Codex plugin 등록 정보 |');
    rows.push('| Codex hooks | `plugins/claude-kit/hooks.json` | Codex 호환 hook 선언 |');
  }

  return rows.join('\n');
}

function buildPipelineChooserRows() {
  return [
    '| 여러 Feature 를 제품 Theme 으로 묶어 관리해야 함 | `core + dev + plan` | `/plan-epic` | **(v2.4.0 Opt-in)** Epic 계층으로 3개 이상 Feature 를 묶어 의존성/실행 순서를 한 번에 관리한다. |',
    '| 아이디어를 먼저 수집하고 우선순위를 정해야 함 | `core + dev + plan` | `/plan-idea` | 아이디어 -> 스크리닝 -> PRD -> 브리지까지 한 흐름으로 이어진다. |',
    '| 승인 전 아이디어를 걸러야 함 | `core + dev + plan` | `/plan-screen` | RICE와 승인 게이트로 실행 여부를 먼저 결정한다. |',
    '| 이미 요구사항이나 PRD가 있고 바로 구현하면 됨 | `core + dev` | `/dev-feature` | 기획 단계를 생략하고 Feature Package 생성부터 시작한다. |',
    '| 현재 출력 구조와 타겟 차이를 먼저 확인해야 함 | 현재 설치 구성 유지 | 이 문서의 Claude / Codex 차이 섹션 확인 | 설치된 runtime surface를 먼저 이해한다. |',
    '| 원본 화면과 현재 구현의 시각적 차이를 닫아야 함 | `core + dev + plan + copy` | `/copy-reference-refresh` | 기준 캡처 → 갭 분석 → 실행 단위 → 검증까지 한 흐름으로 이어진다. |'
  ].join('\n');
}

function buildPlanStatusNote(variant, activeDomains) {
  if (variant === 'repo') {
    return '- `plan`은 opt-in 도메인이며, 전체 기능을 이해하기 위해 여기서는 항상 설명한다.';
  }

  if (activeDomains.includes('plan')) {
    return '- 현재 설치에는 `plan`이 포함되어 있어 아래 흐름을 바로 실행할 수 있다.';
  }

  return '- 현재 설치에는 `plan`이 없으므로 아래 흐름은 구조 이해용이다. 실제 실행 전에는 `plan`을 활성화해야 한다.';
}

function buildPlanFlowRows() {
  return [
    '| P0 | `/plan-epic "{제목}"` | **(Opt-in, v2.4.0)** Epic 생성 — 3개 이상 Feature 묶음 관리 | `.plans/epics/00-draft/EPIC-{YYYYMMDD}-{NNN}/` |',
    '| P1 | `/plan-idea "{제목}" [--epic=EPIC-...]` | 아이디어 수집 (Epic 자동 연결 optional, IMP-AGENT-010) | `.plans/ideas/00-inbox/IDEA-{YYYYMMDD}-{NNN}.md` |',
    '| P2 | `/plan-screen` | RICE 스크리닝 + 승인 게이트 | `.plans/ideas/10-screening/SCREENING-{YYYYMMDD}-{NNN}.md` |',
    '| P3 | `/plan-draft` | 1차 기능 기획 + Lite/Standard 판정 | `.plans/features/drafts/{slug}/first-pass.md` |',
    '| P4 | `/plan-prd` | Standard 기능의 PRD 상세 작성 (Epic 시 §2 성공지표 인용, IMP-AGENT-011) | `.plans/prd/00-draft/` -> `10-approved/` |',
    '| P5 | `/plan-wireframe` | ASCII/Mermaid 와이어프레임 | `.plans/wireframes/{slug}/` |',
    '| P6a | `/plan-design` | (wireframe 후 택일) Claude Design 2단계 프롬프트 | `.plans/design/{slug}/` |',
    '| P6b | `/plan-stitch` | (wireframe 후 택일) Stitch 디자인 반영 | `.plans/stitch/{slug}/` |',
    '| P7 | `/plan-bridge` | 개발 핸드오프 (Spike 모드 포함, IMP-AGENT-004) | bridge context 파일들 |',
    '| P8 | `/plan-archive` | 완료 기능 번들화 | `.plans/archive/{slug}/ARCHIVE-{KEY}.md` |'
  ].join('\n');
}

function buildPlanPaths() {
  return [
    '```text',
    '.plans/',
    '├── epics/{status}/          Epic 컨테이너 (Opt-in, v2.4.0) — draft/planning/active/completed/archive',
    '├── ideas/00-inbox/          신규 아이디어',
    '├── ideas/20-approved/       승인 완료 -> /plan-draft 대상',
    '├── prd/10-approved/         개발 핸드오프 직전 PRD',
    '├── features/active/{slug}/  개발 중 feature context',
    '└── archive/{slug}/          완료 기능 번들',
    '```'
  ].join('\n');
}

function buildDevStatusNote(variant, activeDomains) {
  if (variant === 'repo') {
    return '- `dev`는 기본 설치 흐름이며, `plan`을 쓰지 않아도 구현 파이프라인은 항상 핵심이다.';
  }

  if (activeDomains.includes('dev')) {
    return '- 현재 설치에는 `dev`가 포함되어 있어 아래 흐름을 바로 실행할 수 있다.';
  }

  return '- `dev`는 기본 도메인이므로 일반적으로 항상 포함된다.';
}

function buildDevFlowRows() {
  return [
    '| A | `/dev-feature` | PRD를 읽어 Feature Overview와 context를 생성 | `.plans/features/active/{slug}/00-context/` |',
    '| B | Human Review | 사람이 Overview를 검토하고 승인/수정 여부를 결정 | 승인 후 다음 단계 진행 |',
    '| C | Package Gen | 구현용 Package 문서를 생성 | `.plans/features/active/{slug}/02-package/` |',
    '| D | `/dev-run` | TASK별 TDD 자동 구현 루프 실행 | 코드 + 테스트 + dev notes |',
    '| E | `/dev-verify`, `/dev-commit` | DVC 검증과 커밋 | 검증 리포트 + 커밋 |'
  ].join('\n');
}

function buildQualityGateRows() {
  return [
    '| Gate 1 | 테스트 통과 | `vitest run` 기준 기본 성공 확인 |',
    '| Gate 2 | TDD Guard | 테스트 없이 구현 파일 편집을 막음 |',
    '| Gate 3 | 타입 체크 | `typecheck` 통과 여부 확인 |',
    '| Gate 4 | 린트 | 품질 규칙 위반 여부 확인 |',
    '| Gate 5 | REQ <-> TC 매핑 | 요구사항과 테스트 구현의 정합성 확인 |'
  ].join('\n');
}

function buildTargetDiffNote(variant, activeTargets) {
  if (variant === 'repo') {
    return '- 아래 표는 지원 타겟 전체를 비교한다.';
  }

  if (activeTargets.length === 2) {
    return '- 현재 설치는 dual-target 구성이라 `.claude/`와 `plugins/claude-kit/`이 함께 존재한다.';
  }

  if (activeTargets.includes('codex')) {
    return '- 현재 설치는 Codex 전용 구성이다. `AGENTS.md`, plugin 구조, `hooks.json`을 중심으로 보면 된다.';
  }

  return '- 현재 설치는 Claude 전용 구성이다. `.claude/`와 `CLAUDE.md`를 중심으로 보면 된다.';
}

function buildTargetDiffRows() {
  return [
    '| runtime 경로 | `.claude/` | `plugins/claude-kit/` |',
    '| 컨텍스트 문서 | `CLAUDE.md` | `AGENTS.md` |',
    '| 설정/manifest | `.claude/settings.json` | `.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json` |',
    '| hooks 반영 방식 | `.claude/hooks/*.js` + `settings.json` | `plugins/claude-kit/hooks/` + `hooks.json` |',
    '| rules 반영 방식 | `.claude/rules/*.md` | `AGENTS.md`에 핵심 규칙 흡수 |',
    '| dual-target 동시 설치 | 가능 | 가능. 두 구조는 서로 독립적으로 생성됨 |'
  ].join('\n');
}

function buildPlanActionsNote(variant, activeDomains) {
  if (variant === 'repo') {
    return '전체 기능 예시 기준이다. `plan`은 opt-in이므로 실제 실행 전 활성화 여부를 먼저 확인한다.';
  }

  if (activeDomains.includes('plan')) {
    return '현재 설치에서 바로 실행 가능한 흐름이다.';
  }

  return '현재 설치에는 `plan`이 없으므로, 아래 흐름은 `plan` 활성화 후 실행한다.';
}

function buildPlanActions() {
  return [
    '```text',
    '# 기본 경로 (Epic 없음)',
    '/plan-idea "새 기능 아이디어"',
    '/plan-screen IDEA-YYYYMMDD-001',
    '/plan-draft IDEA-YYYYMMDD-001',
    '/plan-prd .plans/features/drafts/<slug>/first-pass.md',
    '/plan-bridge <slug>',
    '',
    '# Epic 묶음 관리 (Opt-in, v2.4.0)',
    '/plan-epic "OPTIC Landing 제품 라인"',
    '/plan-idea "F1 세부 기능" --epic=EPIC-YYYYMMDD-001',
    '/plan-idea "F2 세부 기능" --epic=EPIC-YYYYMMDD-001',
    '# 이후 /plan-screen ~ /plan-archive 기본 경로와 동일',
    '```'
  ].join('\n');
}

function buildDevActionsNote(variant) {
  if (variant === 'repo') {
    return '기본 개발 흐름 예시다. 요구사항이나 승인된 PRD가 이미 있을 때 적합하다.';
  }

  return '승인된 PRD나 요구사항이 이미 있다면 이 경로로 바로 시작한다.';
}

function buildDevActions() {
  return [
    '```text',
    '/dev-feature <prd-path>',
    '/dev-run .plans/features/active/<slug>/02-package/',
    '/dev-verify .plans/features/active/<slug>/02-package/',
    '/dev-commit',
    '```'
  ].join('\n');
}

function buildCopyStatusNote(variant, activeDomains) {
  if (variant === 'repo') {
    return '- `copy`는 opt-in 도메인이며, 전체 기능을 이해하기 위해 여기서는 항상 설명한다.';
  }

  if (activeDomains.includes('copy')) {
    return '- 현재 설치에는 `copy`가 포함되어 있어 아래 흐름을 바로 실행할 수 있다.';
  }

  return '- 현재 설치에는 `copy`가 없으므로 아래 흐름은 구조 이해용이다. 실제 실행 전에는 `copy`를 활성화해야 한다.';
}

function buildCopyFlowRows() {
  return [
    '| C1 | `/copy-reference-refresh` | 기준 캡처 + manifest 생성 | `.plans/features/active/{slug}/evidence/` |',
    '| C2 | `/copy-visual-review` | visual 갭 분석 | Gap Row (VF-*) |',
    '| C3 | `/copy-interaction-review` | interaction 갭 분석 | State Map (IF-*) |',
    '| C4 | `/copy-gap-board` | 갭 우선순위 통합 | 실행 후보 테이블 |',
    '| C5 | `/copy-plan-unit` | 갭→실행 단위 전환 | 실행 단위 계획 |',
    '| C6 | `/copy-verify` | build/evidence/document 검증 | QA 결과 리포트 |',
    '| C7 | `/copy-closeout` | 승인 + 잔여 리스크 | closeout 메모 |'
  ].join('\n');
}

function buildCopyActionsNote(variant, activeDomains) {
  if (variant === 'repo') {
    return '전체 기능 예시 기준이다. `copy`는 opt-in이므로 실제 실행 전 활성화 여부를 먼저 확인한다.';
  }

  if (activeDomains.includes('copy')) {
    return '현재 설치에서 바로 실행 가능한 흐름이다.';
  }

  return '현재 설치에는 `copy`가 없으므로, 아래 흐름은 `copy` 활성화 후 실행한다.';
}

function buildCopyActions() {
  return [
    '```text',
    '/copy-reference-refresh --scope header,hero --viewport 1440,768',
    '/copy-visual-review --section header',
    '/copy-interaction-review --state hover,sticky',
    '/copy-gap-board',
    '/copy-plan-unit VF-HEADER-01',
    '/copy-verify',
    '/copy-closeout',
    '```'
  ].join('\n');
}

function buildReconfigProfile(activeDomains, activeTargets) {
  const nextDomains = normalizeDomains([...activeDomains, 'plan', 'copy']);
  const nextTargets = normalizeTargets(activeTargets);

  return JSON.stringify({
    domains: nextDomains,
    targets: nextTargets
  }, null, 2);
}

function buildMiniGlossaryRows() {
  return [
    '| `PRD` | Product Requirements Document. 기능 요구사항을 구조화한 문서 |',
    '| `Bridge Context` | Planning에서 Dev로 넘길 때 생성되는 핸드오프 문서 묶음 |',
    '| `Lite / Standard` | 기능 규모 판정. Standard는 PRD/전체 파이프라인이 필요함 |',
    '| `Feature Package` | Dev 구현에 쓰는 작업 명세 문서 묶음 |',
    '| `PCC` | Planning Consistency Check. 기획 단계 간 일관성 검증 |',
    '| `DVC` | Document-Verification Consistency. 구현이 문서와 맞는지 확인 |',
    '| package-owned 문서 | 설치/업데이트 시 재생성되는 산출물. 수동 편집 대상으로 보지 않음 |',
    '| `Gap Board` | copy 도메인에서 visual/interaction 갭을 우선순위별로 통합한 보드 |',
    '| `Evidence Manifest` | 기준 캡처(screenshot, state capture)의 메타데이터 목록 |',
    '| `WBS` | Work Breakdown Structure. Epic > Feature > Story > Task 4계층 분류 |',
    '| `시나리오 A/B/C` | A(백지), B(부분), C(충실도 교정). 카피 작업의 파이프라인 순서를 결정 |',
    '| `Epic` | **(v2.4.0 Opt-in)** 여러 Feature 를 묶는 상위 컨테이너. 1~3개월 단위 제품 Theme |',
    '| `Children Features` | Epic 의 자식 Feature 목록 + 의존성 매트릭스 + Phase 실행 순서 |',
    '| `Epic Binding` | Feature 측에서 Epic 을 참조하는 파일 (`00-context/08-epic-binding.md`) |',
    '| `Spike` | **(v2.3.1)** Standard Feature 진입 전 1일 게이트 검증 — Go/No-Go/Extend 판정 |',
    '| `Telemetry` | **(v2.3.1)** `~/.claude/logs/agent-telemetry.jsonl` 에이전트 호출 이벤트 로컬 집계 |',
    '| `Agent Frontmatter v1.1` | **(IMP-AGENT-008)** `team_owner` / `release_stage` / `schema_version` 표준 필드 |'
  ].join('\n');
}

function normalizeDomains(domains) {
  const order = ['core', 'dev', 'plan', 'copy'];
  const set = new Set(domains);
  set.add('core');
  return order.filter(domain => set.has(domain));
}

function normalizeTargets(targets) {
  const order = ['claude', 'codex'];
  const set = new Set(targets.length > 0 ? targets : ['claude']);
  return order.filter(target => set.has(target));
}

function substituteVars(content, vars) {
  let result = content;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

module.exports = {
  renderQuickStart
};
