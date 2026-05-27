import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'claude-kit user guide',
  description: 'claude-kit planning and development pipeline guide'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
