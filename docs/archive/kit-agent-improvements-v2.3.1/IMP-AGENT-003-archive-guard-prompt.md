# IMP-AGENT-003 — plan-bridge-writer 아카이브 전 체크리스트

> **결론**: IMP-KIT-030(`/plan-archive` embedded git repo 가드)를 `plan-bridge-writer` 에이전트 프롬프트로 **shift-left**한다. 아카이브 시점 가드보다 브리지 작성 시점에 대상 범위를 검증하는 편이 실수 방지에 유리하다.

**축**: Tool Gaps (훅/커맨드/에이전트가 놓친 보호)
**우선순위**: **P0**
**공수**: S
**Breaking Change**: no
**타깃 릴리스**: v2.3.1
**기반**: IMP-KIT-030
**관련 에이전트**: `plan-bridge-writer`

---

## 1. 문제 (증거 기반)

- IMP-KIT-030 원본: dash-preview-phase3 `/plan-archive` 실행 시 **embedded git repo 1건이 번들에 포함될 뻔한 이슈** 발생
- `/plan-archive` 시점의 커맨드/스킬 가드만으로는 **복구 비용이 큼** (이미 경로 이동 후 감지)
- plan-bridge-writer는 "다음 경로 안내"를 작성하면서 **archive 대상 후보 경로를 이미 알고 있음** → 사전 경고 가능

## 2. 해결책

### 2.1 plan-bridge-writer 프롬프트 확장

추가 섹션:
```markdown
## Archive 전 체크리스트 (필수)

브리지 작성 시 `.plans/features/active/{slug}/` 하위에 다음 항목이 존재하는지 점검하고, 있으면 브리지 문서의 `§3. 다음 경로 안내` 에 **"아카이브 전 정리 필요"** 경고로 명시한다:

1. **embedded git repo**: `.git` 디렉터리 또는 하위 git submodule 링크
2. **빌드 산출물**: `dist/`, `build/`, `.next/`, `out/` 등
3. **의존성 디렉터리**: `node_modules/`, `.pnpm-store/`
4. **대용량 바이너리**: 10MB 이상 파일 (Glob + stat)

체크 방식: Bash로 `find` + `du` 실행, 결과를 브리지 문서에 표로 삽입.
```

### 2.2 tools 필드 확장

현재 plan-bridge-writer는 `Read, Grep, Glob, Write, Edit`. **`Bash` 추가** 필요 (find, du 실행).

**근거**: 아카이브 시점 가드(IMP-KIT-030)가 Bash를 사용하는 것과 동일 권한 범위. 에이전트로 이동해도 권한 확장 없음.

### 2.3 IMP-KIT-030과의 역할 분리

| 레이어 | IMP-KIT-030 (훅/커맨드) | IMP-AGENT-003 (에이전트) |
|---|---|---|
| 시점 | `/plan-archive` 실행 시 | 브리지 작성 시 (아카이브 전) |
| 동작 | 번들링 중 제외 | 사전 경고 + 정리 요청 |
| 실패 시 | 자동 제외 | 사용자에게 수동 정리 안내 |
| 중복? | 아니오 (계층 분리) | 아니오 |

**상호보완**: 에이전트(사전 경고) + 훅(사후 안전망) 2단 방어.

---

## 3. 구현 범위

**파일**:
- `src/claude/plan/agents/plan-bridge-writer.md`:
  - `tools: [Read, Grep, Glob, Write, Edit, Bash]` (Bash 추가)
  - `## Archive 전 체크리스트` 섹션 추가
  - Constraints: "Bash 사용은 체크리스트 4항목 검증 한정, 그 외 용도 금지"

**테스트**:
- 브리지 작성 시 4항목 전부 미존재 → 경고 없이 통과
- 각 항목 존재 시 브리지 문서에 경고 표 삽입 확인
- Constraints 위반 (다른 Bash 호출) 시 리뷰어가 탐지

---

## 4. ROI

- **정방향**: 아카이브 시점 실수 → 브리지 시점 조기 탐지. 복구 비용 대폭 감소
- **측정**: `/plan-archive` 실행 시 embedded repo 관련 경고 발생 0건 (브리지에서 사전 정리 완료 가정)
- **비용**: 프롬프트 섹션 1개 + Bash 권한 1개. 신설 에이전트 없음

---

## 5. 수락 기준

- [ ] plan-bridge-writer tools에 Bash 추가
- [ ] 4항목 체크리스트가 브리지 §3에 표 형태로 삽입
- [ ] Constraints에 Bash 사용 범위 명시 (과도한 권한 확장 방지)
- [ ] IMP-KIT-030 훅과 중복 감지 시 경고 없음 (이미 해결된 항목은 훅이 skip)

---

## 6. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-22 | 초안 — IMP-KIT-030 shift-left 재해석 |
