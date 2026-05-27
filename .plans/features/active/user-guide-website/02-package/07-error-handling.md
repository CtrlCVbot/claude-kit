# Error Handling: user-guide-website

| Error / Failure | Handling |
| --- | --- |
| Missing planning page slug | Render a not-found state through Next.js `notFound()` |
| Missing example slug | Render a not-found state |
| Broken internal link | Capture in route/link verification |
| Build failure | Stop completion, record failure in `03-dev-notes/dev-output-summary.md` |
| Protected path diff | Treat as high-severity review issue |
| Runtime claim mismatch | Fix docs content before release |
