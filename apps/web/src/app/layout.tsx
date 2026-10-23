import type { Metadata } from 'next';
import { Header } from '@/components/shell';
import { MobileNavigation } from '@/components/design-controls';
import { getSession } from '@/lib/session';
import { getCommunity } from '@/lib/strapi';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'Communauté Le Revenu', template: '%s | Le Revenu' },
  description:
    'Échangez avec les lecteurs du Revenu sur l’épargne, les placements et votre patrimoine.',
};
export default async function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal?: React.ReactNode;
}) {
  const [session, { data: community }] = await Promise.all([getSession(), getCommunity()]);
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
        <a className="skip-link" href="#contenu">
          Aller au contenu
        </a>
        <Header session={session} community={community} />
        {children}
        <MobileNavigation member={Boolean(session)} />
        {modal}
      </body>
    </html>
  );
}
