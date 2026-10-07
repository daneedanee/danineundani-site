import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatDate } from "@/lib/notes/format";
import { notesPagePath, totalPages } from "@/lib/notes/paging";
import { countPublished, listPublishedPage } from "@/lib/notes/queries";
import { absoluteUrl, siteName } from "@/lib/seo";
import { notes } from "@/lib/site-content";

import { NotesShell } from "./notes-shell";
import { Pagination } from "./pagination";

// 목록 쪽의 제목과 대표 주소. 쪽마다 자기 주소가 대표 주소다.
export function notesIndexMetadata(page: number): Metadata {
  const title = page > 1 ? `${notes.title} ${page}쪽 · ${siteName}` : `${notes.title} · ${siteName}`;
  const url = absoluteUrl(notesPagePath(page));
  return {
    title,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, siteName, locale: "ko_KR" },
  };
}

// 글 목록. /notes 와 /notes/page/[page] 가 같이 쓴다.
export async function NotesIndex({ page }: { page: number }) {
  const total = await countPublished();
  const pages = totalPages(total);
  if (page > pages) notFound();

  const posts = total === 0 ? [] : await listPublishedPage(page);

  return (
    <NotesShell>
      <h1 className="text-[28px] leading-[1.3] font-extrabold tracking-[-0.5px] text-[#2b2421] min-[992px]:text-[36px]">
        {notes.title}
      </h1>

      {posts.length === 0 ? (
        <p className="mt-10 text-[16px] leading-7 text-[#5c514b]">{notes.empty}</p>
      ) : (
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
      )}

      <Pagination page={page} pages={pages} />
    </NotesShell>
  );
}
