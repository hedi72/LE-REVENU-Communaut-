export default function Loading() {
  return (
    <main id="contenu" className="container loading-page" aria-busy="true">
      <p role="status">Chargement des échanges…</p>
      <div className="skeleton hero-skeleton" />
      {[1, 2, 3].map((key) => (
        <div className="skeleton card-skeleton" key={key} />
      ))}
    </main>
  );
}
