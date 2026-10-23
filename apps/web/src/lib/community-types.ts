export interface ReferenceCategory {
  slug: string;
  name: string;
  desc: string;
  icon: string;
  color: string;
  topics: number;
  posts: number;
}
export interface MemberProfile {
  streak?: number;
  username: string;
  name: string;
  color: string;
  points: number;
  month: number;
  role: string;
  sub: boolean;
  bio: string;
  badges: string[];
}
export interface EditorialReply {
  id: number;
  author: string;
  body: string;
  likes: number;
  min: number;
}
export interface MemberBlog {
  id: number;
  author: string;
  cat: string;
  min: number;
  title: string;
  body: string;
  comments: EditorialReply[];
  likes: number;
}
export interface CommunityEvent {
  id: number;
  title: string;
  host: string;
  at: string;
  going: number;
  cat: string;
}
export interface PollOption {
  label: string;
  votes: number;
}
export interface ReferencePoll {
  id: number;
  title: string;
  referenceKey: string;
  options: PollOption[];
}
export interface Community {
  categories: ReferenceCategory[];
  users: MemberProfile[];
  blogs: MemberBlog[];
  events: CommunityEvent[];
  news: [string, string, boolean][];
  navigation: string[];
  summary: { members: number; discussions: number; replies: number; resolved: number };
  polls: ReferencePoll[];
}
export interface DiscussionPresentation {
  pinned?: boolean;
  likes?: number;
  views?: number;
  solved?: boolean;
  kind?: string;
  featured?: string;
  participants?: string[];
  options?: PollOption[] | null;
}
