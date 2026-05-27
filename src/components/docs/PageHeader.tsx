type PageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  hero?: boolean
}

export function PageHeader({ eyebrow, title, description, hero = false }: PageHeaderProps) {
  return (
    <header>
      <span className="eyebrow">{eyebrow}</span>
      <h1 className={hero ? 'hero-title' : 'page-title'}>{title}</h1>
      <p className="lead">{description}</p>
    </header>
  )
}
