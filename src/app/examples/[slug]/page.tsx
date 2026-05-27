import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DocsShell } from '@/components/docs/DocsShell'
import { PageHeader } from '@/components/docs/PageHeader'
import { examplePages, getExamplePage } from '@/lib/docs/examples'

type ExampleDetailProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return examplePages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: ExampleDetailProps): Promise<Metadata> {
  const { slug } = await params
  const page = getExamplePage(slug)

  if (!page) {
    return {}
  }

  return {
    title: `${page.title} · claude-kit guide`,
    description: page.description
  }
}

export default async function ExampleDetailPage({ params }: ExampleDetailProps) {
  const { slug } = await params
  const page = getExamplePage(slug)

  if (!page) {
    notFound()
  }

  return (
    <DocsShell toc={page.sections.map((section) => ({ id: section.title.toLowerCase().replaceAll(' ', '-'), label: section.title }))}>
      <article className="doc-card">
        <PageHeader eyebrow="Example" title={page.title} description={page.description} />
        {page.sections.map((section) => (
          <section className="section" id={section.title.toLowerCase().replaceAll(' ', '-')} key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
            {section.items ? (
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </article>
    </DocsShell>
  )
}
