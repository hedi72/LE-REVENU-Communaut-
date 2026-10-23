import Link from 'next/link';
export default function NotFound() {
  return (
    <main id="contenu" className="narrow-page">
      <section className="card empty">
        <span className="eyebrow">404</span>
        <h1>Cette page est introuvable.</h1>
        <p>La discussion a peut-être été supprimée.</p>
        <Link className="button primary" href="/">
          Retrouver la communauté
        </Link>
      </section>
    </main>
  );
}
