import { notFound } from 'next/navigation';
import { communityPageData, CommunityPageLayout } from '@/features/community/page-layout';
import { RichText } from '@/components/rich-text';
import { Avatar } from '@/components/ui';
import { Icon } from '@/components/icon';
import { profileFor } from '@/lib/design';
export default async function Blog({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await communityPageData();
  const blog = data.community.blogs.find((blog) => String(blog.id) === id);
  if (!blog) notFound();
  const author = profileFor(blog.author, data.community);
  return (
    <CommunityPageLayout {...data}>
      <article className="post post-main">
        <div className="tmeta">
          <span className="tag tag-blog">
            <Icon name="pen" />
            Billet
          </span>
        </div>
        <h1>{blog.title}</h1>
        <div className="author">
          <Avatar name={author?.name || blog.author} large profile={author} />
          <div className="author-name">{author?.name || blog.author}</div>
        </div>
        <RichText content={blog.body} />
      </article>
      <h2 className="section-title">{blog.comments.length} commentaires</h2>
      {blog.comments.map((comment) => (
        <article className="post reply" key={comment.id}>
          <div className="author">
            <Avatar name={comment.author} profile={profileFor(comment.author, data.community)} />
            <div className="author-name">
              {profileFor(comment.author, data.community)?.name || comment.author}
            </div>
          </div>
          <RichText content={comment.body} />
        </article>
      ))}
    </CommunityPageLayout>
  );
}
