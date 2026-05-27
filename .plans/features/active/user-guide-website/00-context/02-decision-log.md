# Decision Log: user-guide-website

| DEC-ID | Date | Decision | Reason |
| --- | --- | --- | --- |
| DEC-UGW-001 | 2026-05-27 | Restart planning artifacts instead of claiming the previous pass was fully pipeline-generated | Previous docs were partially retroactive |
| DEC-UGW-002 | 2026-05-27 | Archive old planning docs before replacement | Preserve history and avoid destructive deletion |
| DEC-UGW-003 | 2026-05-27 | Treat existing Next.js implementation as prototype/evidence | It exists, but the pipeline artifacts must be rebuilt first |
| DEC-UGW-004 | 2026-05-27 | Use docs-first UI rather than landing-page framing | User explicitly asked for detailed docs pages |
| DEC-UGW-005 | 2026-05-27 | Keep Google Stitch as `review-only` checkpoint | Design structure is already available and external generation is not required |
| DEC-UGW-006 | 2026-05-27 | Do not production deploy in this run | Preview/build safety is sufficient for this stage |
