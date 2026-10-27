import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { notesPagePath, totalPages } from "@/lib/notes/paging";
import { countPublished, listPublishedPage } from "@/lib/notes/queries";
import { absoluteUrl, defaultOgImage, siteName } from "@/lib/seo";
import { notes } from "@/lib/site-content";

import { BlogHeader } from "./blog-header";
import { NotesShell } from "./notes-shell";
import { Pagination } from "./pagination";
import { PostList } from "./post-list";

// 목록 쪽의 제목과 대표 주소. 쪽마다 자기 주소가 대표 주소다.
export function notesIndexMetadata(page: number): Metadata {
  const title = page > 1 ? `${notes.title} ${page}쪽 · ${siteName}` : `${notes.title} · ${siteName}`;
  const url = absoluteUrl(notesPagePath(page));
  return {
    title,
    description: notes.metaDescription,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description: notes.metaDescription, siteName, locale: "ko_KR", images: [defaultOgImage] },
  };
}

// 글 목록. /blog 와 /blog/page/[page] 가 같이 쓴다.
export async function NotesIndex({ page }: { page: number }) {
  const total = await countPublished();
  const pages = totalPages(total);
  if (page > pages) notFound();

  const posts = total === 0 ? [] : await listPublishedPage(page);

  return (
    <NotesShell wide>
      <BlogHeader title={notes.title} intro={notes.intro} active="all" />

      {posts.length === 0 ? (
        <p className="mt-10 text-[16px] leading-7 text-[#5c514b]">{notes.empty}</p>
      ) : (
        <PostList posts={posts} />
      )}

      <Pagination page={page} pages={pages} />
    </NotesShell>
  );
}
