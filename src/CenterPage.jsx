export default function CenterPage({ title, description, actions = [] }) {
  return <section className="workspace">
    <p className="eyebrow">{title} centre</p>
    <h2>{title}</h2>
    <p className="description">{description}</p>
    <div className="action-grid">{actions.map(([name, detail]) => <article key={name} className="action-card"><h3>{name}</h3><p>{detail}</p><button type="button">Open workspace</button></article>)}</div>
  </section>;
}
