import Link from 'next/link'
import type { ReactNode } from 'react'
import { navigation } from '@/lib/docs/navigation'

type DocsShellProps = {
  children: ReactNode
  toc?: Array<{ id: string; label: string }>
}

export function DocsShell({ children, toc = [] }: DocsShellProps) {
  return (
    <div className="docs-layout">
      <aside className="sidebar" aria-label="문서 탐색">
        <Link className="brand" href="/">
          <strong>claude-kit guide</strong>
          <span>planning, dev, Claude/Codex 운영 가이드</span>
        </Link>
        {navigation.map((section) => (
          <nav className="nav-section" key={section.title} aria-label={section.title}>
            <p className="nav-section-title">{section.title}</p>
            {section.links.map((link) => (
              <Link className="nav-link" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        ))}
      </aside>
      <main className="docs-main">{children}</main>
      <aside className="toc" aria-label="이 페이지 목차">
        <strong>On this page</strong>
        {toc.map((item) => (
          <a href={`#${item.id}`} key={item.id}>
            {item.label}
          </a>
        ))}
      </aside>
    </div>
  )
}
