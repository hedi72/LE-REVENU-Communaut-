import { Header } from './shell';
import { MobileNavigation } from './design-controls';
import { getSession } from '@/lib/session';
import { getCommunity } from '@/lib/strapi';

export async function CommunityShell({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const [session, { data: community }] = await Promise.all([getSession(), getCommunity()]);
  return (
    <>
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      <Header session={session} community={community} />
      <div className="page-content">{children}</div>
      <MobileNavigation member={Boolean(session)} />
      {modal}
    </>
  );
}
