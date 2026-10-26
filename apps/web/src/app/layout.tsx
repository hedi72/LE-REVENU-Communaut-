import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CommunityShell } from '@/components/community-shell';
import { ServiceLoading } from '@/components/service-loading';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'Communauté Le Revenu', template: '%s | Le Revenu' },
  description:
    'Échangez avec les lecteurs du Revenu sur l’épargne, les placements et votre patrimoine.',
};
export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Suspense fallback={<ServiceLoading />}>
          <CommunityShell modal={modal}>{children}</CommunityShell>
        </Suspense>
      </body>
    </html>
  );
}
