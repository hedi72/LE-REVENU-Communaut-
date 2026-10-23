import type { Community, MemberProfile } from './community-types';
import type { Category } from './types';

export function profileFor(name: string, community?: Community | null): MemberProfile | undefined {
  return (
    community?.users.find((profile) => profile.name === name || profile.username === name) ||
    community?.users.find((profile) => name.startsWith(profile.name) && profile.role === 'member')
  );
}
export function referenceCategories(categories: Category[], community: Community) {
  return community.categories.flatMap((reference) => {
    const category = categories.find((item) => item.slug === reference.slug);
    return category ? [{ ...category, ...reference }] : [];
  });
}
export function levelName(points: number) {
  return points >= 750
    ? 'Pilier de la communauté'
    : points >= 300
      ? 'Contributeur averti'
      : points >= 100
        ? 'Contributeur'
        : points >= 25
          ? 'Membre'
          : 'Nouveau venu';
}
export function levelProgress(points: number) {
  const thresholds = [0, 25, 100, 300, 750];
  const index = thresholds.findLastIndex((minimum) => points >= minimum);
  const minimum = thresholds[index];
  const next = thresholds[index + 1];
  return {
    next,
    percentage: next ? Math.round(((points - minimum) / (next - minimum)) * 100) : 100,
    nextName: next ? levelName(next) : null,
  };
}
export function relativeDate(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return minutes < 1 ? 'à l’instant' : `il y a ${minutes} min`;
  if (minutes < 1440) return `il y a ${Math.floor(minutes / 60)} h`;
  if (minutes < 2880) return 'hier';
  return `il y a ${Math.floor(minutes / 1440)} j`;
}
export const formatNumber = (value: number) => new Intl.NumberFormat('fr-FR').format(value);
