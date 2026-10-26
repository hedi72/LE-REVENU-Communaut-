export function ServiceLoading() {
  return (
    <main id="contenu" className="service-loading" aria-busy="true">
      <div className="service-loading-content" role="status" aria-live="polite">
        <span className="service-loading-spinner" aria-hidden="true" />
        <h1>Chargement de la communauté</h1>
        <p>
          Le premier chargement peut prendre environ une minute. La page s’affichera
          automatiquement.
        </p>
      </div>
    </main>
  );
}
