# Conversion Diagrams

> legacy 흐름과 conversion-first 흐름을 비교하는 다이어그램 문서

## 1. legacy 흐름

```mermaid
flowchart TD
  A["src/claude/*"] --> B["installer / emitter"]
  B --> C["Codex output"]
  D["Claude agents/commands"] -. "직접 해석 기대" .-> B
  E["Claude hooks"] -. "config 분리 없음" .-> B
```

## 2. conversion-first 흐름

```mermaid
flowchart TD
  A["src/claude/{core,dev,plan}"] --> B["conversion"]
  B --> C["src/codex/{core,dev,plan}"]
  C --> D["후속 validate / audit / installer"]
```

## 3. kind별 흐름

```mermaid
flowchart TD
  A["Claude identity"] --> B{"kind"}
  B -->|"agent"| C["subagent .toml"]
  B -->|"command"| D["skill / SKILL.md"]
  B -->|"skill"| E["skill / SKILL.md"]
  B -->|"hook"| F["hook .js + .hook.json"]
  B -->|"instruction-rule"| G["AGENTS.md synthesis"]
  C --> H["write-capable면 .contract.json 추가"]
```

## 다이어그램이 강조하는 점

- 중심은 `src/claude -> conversion -> src/codex`다.
- installer는 후속 단계다.
- `kit-create`는 이 흐름의 중심이 아니다.
