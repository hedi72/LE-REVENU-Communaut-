'use client';
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: 'system-ui', padding: 40 }}>
        <h1>Le service est momentanément indisponible.</h1>
        <p>Veuillez réessayer dans un instant.</p>
        <button onClick={reset}>Réessayer</button>
      </body>
    </html>
  );
}
