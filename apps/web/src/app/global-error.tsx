'use client';
export default function GlobalError() {
  return (
    <html lang="fr">
      <body style={{ fontFamily: 'system-ui', padding: 40 }}>
        <h1>Le service est momentanément indisponible.</h1>
        <p>Le chargement prend plus de temps que prévu. Réessayez dans un instant.</p>
        <button onClick={() => window.location.reload()}>Réessayer</button>
      </body>
    </html>
  );
}
