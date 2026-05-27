import { examplePages } from './examples'
import { planningPages } from './planning-pages'

export const navigation = [
  {
    title: '시작하기',
    links: [
      { href: '/', label: '개요' },
      { href: '/planning', label: '기획 파이프라인' },
      { href: '/planning/lifecycle', label: '산출물 lifecycle' },
      { href: '/planning/reference', label: '명령 reference' }
    ]
  },
  {
    title: 'Planning commands',
    links: planningPages.map((page) => ({
      href: `/planning/${page.slug}`,
      label: page.command
    }))
  },
  {
    title: 'Website example',
    links: examplePages.map((page) => ({
      href: `/examples/${page.slug}`,
      label: page.title
    }))
  }
]
