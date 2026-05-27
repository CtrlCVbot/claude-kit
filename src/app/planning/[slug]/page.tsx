import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DocsShell } from '@/components/docs/DocsShell'
import { PlanningCommandPage } from '@/components/docs/PlanningCommandPage'
import { getPlanningPage, planningPages } from '@/lib/docs/planning-pages'

type PlanningDetailProps = {
  params: Promise<{ slug: string }>
}

const toc = [
  { id: 'purpose', label: '목적' },
  { id: 'when-to-use', label: '언제 사용하나' },
  { id: 'inputs-outputs', label: '입력과 산출물' },
  { id: 'runtime', label: 'Claude / Codex' },
  { id: 'lifecycle', label: 'Lifecycle' },
  { id: 'rules', label: '운영 규칙' }
]

export function generateStaticParams() {
  return planningPages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: PlanningDetailProps): Promise<Metadata> {
  const { slug } = await params
  const page = getPlanningPage(slug)

  if (!page) {
    return {}
  }

  return {
    title: `${page.command} · claude-kit guide`,
    description: page.description
  }
}

export default async function PlanningDetailPage({ params }: PlanningDetailProps) {
  const { slug } = await params
  const page = getPlanningPage(slug)

  if (!page) {
    notFound()
  }

  return (
    <DocsShell toc={toc}>
      <PlanningCommandPage page={page} />
    </DocsShell>
  )
}
