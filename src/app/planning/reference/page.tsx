import Link from 'next/link'
import { DocsShell } from '@/components/docs/DocsShell'
import { PageHeader } from '@/components/docs/PageHeader'
import { planningPages } from '@/lib/docs/planning-pages'

export default function ReferencePage() {
  return (
    <DocsShell toc={[{ id: 'matrix', label: 'Command matrix' }]}>
      <article className="doc-card">
        <PageHeader
          eyebrow="Reference"
          title="Planning command reference"
          description="명령별 phase, 목적, 주요 산출물을 빠르게 확인하는 참조 표입니다."
        />

        <section className="section" id="matrix">
          <h2>Command matrix</h2>
          <table>
            <thead>
              <tr>
                <th>Phase</th>
                <th>Command</th>
                <th>목적</th>
                <th>주요 산출물</th>
              </tr>
            </thead>
            <tbody>
              {planningPages.map((page) => (
                <tr key={page.slug}>
                  <td>{page.phase}</td>
                  <td>
                    <Link href={`/planning/${page.slug}`}>{page.command}</Link>
                  </td>
                  <td>{page.description}</td>
                  <td>{page.outputs.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </article>
    </DocsShell>
  )
}
