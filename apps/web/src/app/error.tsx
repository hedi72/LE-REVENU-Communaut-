'use client';
import Link from 'next/link';
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="contenu" className="narrow-page">
      <section className="card empty" role="alert">
        <h1>Les échanges sont momentanément indisponibles.</h1>
        <p>Veuillez réessayer dans un instant.</p>
        <div className="error-actions">
          <button className="button primary" onClick={reset}>
            Réessayer
          </button>
          <Link className="button secondary" href="/">
            Retour à l’accueil
          </Link>
        </div>
      </section>
    </main>
  );
}
