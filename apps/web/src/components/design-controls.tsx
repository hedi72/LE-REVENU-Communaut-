'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from './icon';
import { logout } from '@/features/auth/actions';

export function AccountMenu({ username, points = 0 }: { username: string; points?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="account-menu">
      <button
        className="me-btn"
        aria-label="Mon compte"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="av av-sm" style={{ '--c': 'var(--av-5)' } as React.CSSProperties}>
          {username[0]}
        </span>
        <span className="me-pts num">{points} pts</span>
      </button>
      {open && (
        <div className="dropdown account-dropdown">
          <div className="menu-list">
            <Link href={`/membres/${encodeURIComponent(username)}`} onClick={() => setOpen(false)}>
              <Icon name="user" />
              Mon profil et mes badges
            </Link>
            <Link href="/classement" onClick={() => setOpen(false)}>
              <Icon name="trophy" />
              Classement
            </Link>
            <form action={logout}>
              <button>
                <Icon name="out" />
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function Notifications() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        className="icon-btn"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Icon name="bell" />
      </button>
      {open && (
        <div className="dropdown">
          <div className="dd-head">
            <b>Notifications</b>
            <button onClick={() => setOpen(false)}>Fermer</button>
          </div>
          <div className="empty">
            <p>Aucune notification pour l’instant.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function MobileNavigation({ member }: { member: boolean }) {
  const router = useRouter();
  return (
    <nav className="bnav" aria-label="Navigation mobile">
      <button onClick={() => router.push('/')}>
        <Icon name="home" />
        Accueil
      </button>
      <button onClick={() => router.push('/espaces')}>
        <Icon name="grid" />
        Espaces
      </button>
      <button
        aria-label="Publier"
        onClick={() => router.push(member ? '/discussions/nouvelle' : '/connexion')}
      >
        <span className="plus">
          <Icon name="plus" />
        </span>
      </button>
      <button onClick={() => router.push('/activite')}>
        <Icon name="bell" />
        Activité
      </button>
      <button onClick={() => router.push(member ? '/mon-compte' : '/connexion')}>
        <Icon name="user" />
        {member ? 'Profil' : 'Connexion'}
      </button>
    </nav>
  );
}

export function CopyLink() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="act"
      onClick={async () => {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
      }}
    >
      <Icon name="link" />
      {copied ? 'Lien copié' : 'Copier le lien'}
    </button>
  );
}
