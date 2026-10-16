import Link from "next/link";

import { formatDate } from "@/lib/notes/format";
import type { PostSummary } from "@/lib/notes/types";

// 글 목록. 칼럼 목록(/notes)과 기둥 허브가 같이 쓴다.
export function PostList({ posts }: { posts: PostSummary[] }) {
  return (
    <ul className="mt-10 divide-y divide-[#eaded4] border-y border-[#eaded4]">
      {posts.map((post) => (
        <li key={post.slug}>
          <article className="py-7">
            <h2 className="text-[20px] leading-[1.4] font-extrabold tracking-[-0.3px] text-[#2b2421] min-[992px]:text-[22px]">
              <Link href={`/notes/${encodeURIComponent(post.slug)}`} className="hover:text-[#fd715b]">
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 text-[15px] leading-7 text-[#5c514b]">{post.description}</p>
            {post.published_at && (
              <p className="mt-3 text-[13px] text-[#8a7d75]">
                <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
              </p>
            )}
          </article>
        </li>
      ))}
    </ul>
  );
}
