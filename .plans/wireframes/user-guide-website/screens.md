# Wireframe Screens: user-guide-website

- **Stage**: P5 `/plan-wireframe`
- **Prompt source**: `docs/plans/user-guide-website/06-pipeline-prompt-runbook.md#6-p5-plan-wireframe`

## SCR-001: Docs Home

Maps to: `REQ-UGW-001`, `REQ-UGW-004`

```text
+------------------------------------------------+
| Header: claude-kit user guide                  |
+-------------------+----------------------------+
| Sidebar           | Hero docs intro            |
| - Overview        | Quick links                |
| - Planning        | Pipeline example card      |
| - Examples        | Core-first safety note     |
+-------------------+----------------------------+
```

## SCR-002: Planning Index

Maps to: `REQ-UGW-002`

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

Maps to: `REQ-UGW-002`, `REQ-UGW-003`

```text
+------------------------------------------------+
| /plan-idea                                      |
+-------------------+----------------------------+
| Command TOC       | Purpose                    |
| Related commands  | Inputs / outputs           |
|                   | [Claude tab][Codex tab]    |
|                   | Artifacts and rules        |
+-------------------+----------------------------+
```

## SCR-004: Lifecycle / Reference

Maps to: `REQ-UGW-002`, `REQ-UGW-006`

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

Maps to: `REQ-UGW-004`, `REQ-UGW-005`

```text
+------------------------------------------------+
| Example: website pipeline run                  |
+-------------------+----------------------------+
| Example TOC       | Prompt used                |
| Evidence links    | Created artifacts          |
| Verification      | Review result              |
+-------------------+----------------------------+
```
