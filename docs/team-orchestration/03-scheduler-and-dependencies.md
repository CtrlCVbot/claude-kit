# 스케줄러 + 의존성 관리

> Hard dependency DAG, 위상 정렬, Wave 도출, Ready Queue, 실패 전파 규칙을 정의한다.

---

## 핵심 원칙

이 문서에서 말하는 dependency graph는 **hard dependency만** 표현한다. 즉, 어떤 feature가 다른 feature의 실행 완료를 실제로 기다려야 하는지를 나타낸다.

컴포넌트/파일 ownership 분리는 DAG가 아니라 **ownership matrix**에서 관리한다. Ownership matrix는 pilot appendix(`06-ds-customizer-pilot.md`)에서 다룬다.

---

## Feature Dependency Graph YAML

```yaml
# .plans/{project}/dependency-graph.yaml
version: "1.0"
project: <project-slug>

features:
  - id: <string>              # 고유 식별자
    slug: <string>             # Feature slug — 폴더명에 사용
    name: <string>             # 사람이 읽을 수 있는 이름
    depends_on: [<string>]     # 선행 Feature id 목록 (빈 배열 = root)
    complexity: small | medium | large
    estimated_stages: 12       # P1~E = 12 단계
```

### 범용 예시 (3 Feature)

```yaml
version: "1.0"
project: example-project

features:
  - id: foundation
    slug: ex-foundation
    name: "기반 모듈"
    depends_on: []
    complexity: medium

  - id: feature-a
    slug: ex-feature-a
    name: "기능 A"
    depends_on: [foundation]
    complexity: medium

  - id: feature-b
    slug: ex-feature-b
    name: "기능 B"
    depends_on: [foundation]
    complexity: small
```

```
foundation → feature-a
foundation → feature-b

Wave 0: [foundation]
Wave 1: [feature-a, feature-b]  ← 병렬 실행 가능
```

---

## DAG 스케줄링 알고리즘

### 위상 정렬 (Topological Sort)

```
function topological_sort(features):
    in_degree = {}
    for each feature in features:
        in_degree[feature.id] = len(feature.depends_on)

    queue = [f for f in features if in_degree[f.id] == 0]
    sorted_order = []

    while queue is not empty:
        current = queue.pop()
        sorted_order.append(current)

        for each feature in features:
            if current.id in feature.depends_on:
                in_degree[feature.id] -= 1
                if in_degree[feature.id] == 0:
                    queue.append(feature)

    if len(sorted_order) != len(features):
        raise CyclicDependencyError(sorted_order, features)

    return sorted_order
```

### Wave 자동 도출

Wave = DAG의 longest path level. 같은 Wave에 속한 Feature는 병렬 실행 가능하다.

```
function compute_waves(features):
    level = {}
    for each feature in topological_sort(features):
        if feature.depends_on is empty:
            level[feature.id] = 0
        else:
            level[feature.id] = max(level[dep] for dep in feature.depends_on) + 1

    waves = {}
    for feature_id, wave_num in level.items():
        waves.setdefault(wave_num, []).append(feature_id)

    return waves
```

### Ready Queue

현재 시점에서 실행 가능한 Feature 목록. 우선순위: `priority → dependency depth → FIFO`

```
function get_ready_queue(features, completed_set, running_set):
    ready = []
    for each feature in features:
        if feature.id in completed_set or feature.id in running_set:
            continue
        if all(dep in completed_set for dep in feature.depends_on):
            ready.append(feature)
    return sort_by_priority(ready)
```

---

## Wave 전환 전략

| 전략 | 설명 | 장점 | 단점 |
|------|------|------|------|
| **Strict** | 현재 Wave의 모든 Feature 완료 후 다음 Wave | 예측 가능, 단순 | 느린 Feature가 병목 |
| **Eager** (권장) | 의존성 충족된 Feature는 즉시 spawn | 처리량 최대화 | 상태 추적 복잡 |

**Eager 전략**:

```
function on_feature_completed(feature_id):
    completed_set.add(feature_id)
    release_agent_slot(feature_id)

    ready_queue = get_ready_queue(all_features, completed_set)

    while ready_queue is not empty AND available_slots > 0:
        next_feature = ready_queue.pop_highest_priority()
        spawn_feature_agent(next_feature)
        available_slots -= 1
```

---

## 순환 의존성 검출

DFS 기반 cycle detection. back edge가 발견되면 순환 경로를 추출하여 사용자에게 보고한다.

```
ERROR: Circular dependency detected!

  Cycle: feature-a → feature-c → feature-a

  Resolution options:
    1. 한쪽 의존성을 제거
    2. 공통 부분을 별도 Feature로 분리
    3. 인터페이스 계약을 먼저 정의하여 해소
```

---

## 실패 전파 규칙

```
실패 전파는 도미노와 같다.
넘어진 도미노(실패 Feature)에 직접 닿는 도미노만 넘어진다.
간접 의존은 직접 의존이 block되면 자동으로 block된다.
```

| 규칙 | 설명 |
|------|------|
| **직접 block** | Feature X 실패 → X에 직접 의존하는 Feature만 `blocked` 전환 |
| **간접 전파** | blocked Feature에 의존하는 Feature도 Ready 조건 미충족으로 자동 blocked |
| **격리** | X에 의존하지 않는 Feature는 영향 없음 — 계속 진행 |
| **재시도** | 실패한 Feature 재시도 성공 시 blocked Feature들이 자동 unblock |

### 재시도 정책

```yaml
retry_policy:
  max_retries: 2
  retry_from: last_failed_stage   # 실패한 단계부터 재시작
  backoff: none
  manual_override: true           # 사용자가 재시도/포기 결정 가능
```

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| [02-operating-model.md](./02-operating-model.md) | Team Lead / Feature Agent 역할 |
| [04-state-gates-lifecycle.md](./04-state-gates-lifecycle.md) | 상태 기록 + Phase Gate |
| [06-ds-customizer-pilot.md](./06-ds-customizer-pilot.md) | 8-Feature 구체 DAG 예시 |
