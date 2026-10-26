'use client';
import Link from 'next/link';
export default function ErrorPage() {
  return (
    <main id="contenu" className="narrow-page">
      <section className="card empty" role="alert">
        <h1>Les échanges sont momentanément indisponibles.</h1>
        <p>Le chargement prend plus de temps que prévu. Réessayez dans un instant.</p>
        <div className="error-actions">
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Réessayer
          </button>
          <Link className="btn btn-secondary" href="/">
            Retour à l’accueil
          </Link>
        </div>
      </section>
    </main>
  );
}
