import Link from 'next/link';
import { initials } from '@/lib/format';
import type { Pagination } from '@/lib/types';
import type { MemberProfile } from '@/lib/community-types';
export function Avatar({
  name,
  large = false,
  size,
  profile,
}: {
  name: string;
  large?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  profile?: MemberProfile;
}) {
  return (
    <span
      aria-hidden="true"
      className={`av av-${size || (large ? 'md' : 'sm')} ${profile?.role === 'redaction' ? 'redac' : ''}`}
      style={{ '--c': profile?.color || 'var(--av-1)' } as React.CSSProperties}
    >
      {profile?.role === 'redaction' ? 'R' : initials(profile?.name || name)}
    </span>
  );
}
export function EmptyState({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card empty">
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
export function PaginationLinks({
  pagination,
  base,
  params = {},
}: {
  pagination: Pagination;
  base: string;
  params?: Record<string, string>;
}) {
  const { page, pageCount } = pagination;
  if (pageCount <= 1) return null;
  const href = (next: number) =>
    `${base}?${new URLSearchParams({ ...params, page: String(next) })}`;
  return (
    <nav className="pagination" aria-label="Pagination">
      {page > 1 ? (
        <Link className="btn btn-secondary" href={href(page - 1)}>
          ← Précédent
        </Link>
      ) : (
        <span />
      )}
      <span>
        Page {page} sur {pageCount}
      </span>
      {page < pageCount ? (
        <Link className="btn btn-secondary" href={href(page + 1)}>
          Suivant →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
