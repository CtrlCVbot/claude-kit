# Wireframe Screens: user-guide-website

- **단계**: P5 `/plan-wireframe`
- **프롬프트 출처**: `docs/plans/user-guide-website/06-pipeline-prompt-runbook.md#6-p5-plan-wireframe`

## SCR-001: 문서 홈

연결 요구사항: `REQ-UGW-001`, `REQ-UGW-004`

```text
+------------------------------------------------+
| Header: claude-kit user guide                  |
+-------------------+----------------------------+
| Sidebar           | 문서 소개                  |
| - Overview        | 빠른 링크                  |
| - Planning        | Pipeline example card      |
| - Examples        | Core-first safety note     |
+-------------------+----------------------------+
```

## SCR-002: Planning Index

연결 요구사항: `REQ-UGW-002`

```text
+------------------------------------------------+
| Planning Pipeline                              |
+-------------------+----------------------------+
| Sidebar           | Pipeline map               |
| Command list      | Stage cards                |
| Lifecycle links   | Artifact location summary  |
+-------------------+----------------------------+
```

## SCR-003: Planning Command Detail

연결 요구사항: `REQ-UGW-002`, `REQ-UGW-003`

```text
+------------------------------------------------+
| /plan-idea                                      |
+-------------------+----------------------------+
| Command TOC       | 목적                       |
| Related commands  | Inputs / outputs           |
|                   | [Claude tab][Codex tab]    |
|                   | Artifacts and rules        |
+-------------------+----------------------------+
```

## SCR-004: Lifecycle / Reference

연결 요구사항: `REQ-UGW-002`, `REQ-UGW-006`

```text
+------------------------------------------------+
| Artifact Lifecycle / Reference                 |
+-------------------+----------------------------+
| Sidebar           | Stage transitions          |
| Reference links   | File locations             |
|                   | Follow-up docs sync table  |
+-------------------+----------------------------+
```

## SCR-005: Pipeline Example Page

연결 요구사항: `REQ-UGW-004`, `REQ-UGW-005`

```text
+------------------------------------------------+
| Example: website pipeline run                  |
+-------------------+----------------------------+
| Example TOC       | Used prompt                |
| 증거 링크         | 생성 산출물                |
| Verification      | Review result              |
+-------------------+----------------------------+
```
