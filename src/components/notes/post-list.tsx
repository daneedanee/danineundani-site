import Image from "next/image";
import Link from "next/link";

import { formatDate } from "@/lib/notes/format";
import { isStorageImage } from "@/lib/notes/images";
import { postPath } from "@/lib/notes/paths";
import { pillarName } from "@/lib/notes/topics";
import type { PostSummary } from "@/lib/notes/types";
import { author } from "@/lib/site-content";

// 대표 이미지가 없는 글의 카드 그림. 주제마다 색을 달리하고 제목을 얹는다.
const fallbackTone: Record<string, { box: string; mark: string; text: string }> = {
  "blog-marketing": { box: "bg-[#2b2421]", mark: "text-white/70", text: "text-white" },
  "small-business-marketing": { box: "bg-[#fd715b]", mark: "text-[#2b2421]/70", text: "text-[#191919]" },
  none: { box: "bg-[#fff0e3]", mark: "text-[#c9412f]", text: "text-[#2b2421]" },
};

function Thumbnail({ post }: { post: PostSummary }) {
  const cover = post.cover_image_url;
  if (cover) {
    return (
      <div className="relative aspect-[1200/630] overflow-hidden rounded-[12px] bg-[#f3e9e0]">
        {isStorageImage(cover, process.env.NEXT_PUBLIC_SUPABASE_URL) ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes="(min-width: 992px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          // 우리 보관함 밖의 주소는 next/image 가 받지 않는다. 그대로 내보낸다.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="absolute inset-0 size-full object-cover" />
        )}
      </div>
    );
  }

  const tone = fallbackTone[post.pillar ?? "none"] ?? fallbackTone.none;
  return (
    <div aria-hidden className={`flex aspect-[1200/630] flex-col items-center justify-center gap-3 rounded-[12px] px-7 text-center ${tone.box}`}>
      <span className={`text-[12px] font-extrabold tracking-[0.08em] ${tone.mark}`}>다니는다니</span>
      <span className={`line-clamp-3 text-[17px] leading-[1.4] font-extrabold tracking-[-0.3px] break-keep ${tone.text}`}>{post.title}</span>
    </div>
  );
}

// 글 목록. 블로그 목록(/blog)과 기둥 허브가 같이 쓴다. avcd.kr/blog 처럼 세 칸 카드 (2026-10-26).
export function PostList({ posts }: { posts: PostSummary[] }) {
  return (
    <ul className="mt-10 grid gap-x-8 gap-y-14 min-[640px]:grid-cols-2 min-[992px]:grid-cols-3">
      {posts.map((post) => {
        const pillarLabel = pillarName(post.pillar);
        return (
          <li key={post.slug}>
            <article className="group flex h-full flex-col">
              <Link href={postPath(post.slug)} className="flex flex-1 flex-col">
                <Thumbnail post={post} />
                <h2 className="mt-5 line-clamp-2 text-[19px] leading-[1.45] font-extrabold tracking-[-0.3px] text-[#2b2421] break-keep group-hover:text-[#c9412f]">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-4 text-[15px] leading-[1.65] text-[#5c514b] break-keep">{post.description}</p>
              </Link>
              <div className="mt-4 flex items-center justify-between gap-3 text-[13px] text-[#8a7d75]">
                <p>
                  {post.published_at && (
                    <>
                      <time dateTime={post.published_at}>{formatDate(post.published_at)}</time> ·{" "}
                    </>
                  )}
                  {author.name}
                </p>
                {pillarLabel && <span className="shrink-0 rounded-[4px] bg-[#f3e9e0] px-2 py-1 text-[12px] font-semibold text-[#2b2421]">{pillarLabel}</span>}
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
