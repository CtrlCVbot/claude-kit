type InfoGridProps = {
  items: Array<{
    title: string
    body: string
    href?: string
  }>
}

export function InfoGrid({ items }: InfoGridProps) {
  return (
    <div className="grid">
      {items.map((item) => (
        <article className="tile" key={item.title}>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
          {item.href ? (
            <p>
              <a className="button-link" href={item.href}>
                열기
              </a>
            </p>
          ) : null}
        </article>
      ))}
    </div>
  )
}
