import Link from "next/link";

import { formatDate } from "@/lib/notes/format";
import type { PostSummary } from "@/lib/notes/types";
import { notes } from "@/lib/site-content";

// 글 아래의 같은 주제 글. 고를 글이 없으면 제목도 내지 않는다.
export function RelatedPosts({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="related-posts" className="mt-14 border-t border-[#eaded4] pt-8">
      <h2 id="related-posts" className="text-[18px] font-extrabold tracking-[-0.3px] text-[#2b2421]">
        {notes.relatedTitle}
      </h2>
      <ul className="mt-4 divide-y divide-[#eaded4]">
        {posts.map((post) => (
          <li key={post.slug} className="py-4">
            <Link
              href={`/notes/${encodeURIComponent(post.slug)}`}
              className="text-[16px] leading-[1.5] font-bold text-[#2b2421] hover:text-[#fd715b]"
            >
              {post.title}
            </Link>
            {post.published_at && (
              <p className="mt-1 text-[13px] text-[#8a7d75]">
                <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
