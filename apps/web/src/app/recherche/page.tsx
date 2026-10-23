import { communityPageData, CommunityPageLayout } from '@/features/community/page-layout';
import { Icon } from '@/components/icon';
export default async function Search() {
  const data = await communityPageData();
  return (
    <CommunityPageLayout {...data}>
      <header className="page-head">
        <h1>Rechercher</h1>
      </header>
      <form className="search-page" action="/">
        <label className="sr-only" htmlFor="search-query">
          Rechercher une discussion
        </label>
        <input
          className="input"
          name="q"
          id="search-query"
          placeholder="Un sujet, une question…"
          required
          maxLength={100}
        />
        <button className="btn btn-primary">
          <Icon name="search" />
          Rechercher
        </button>
      </form>
    </CommunityPageLayout>
  );
}
