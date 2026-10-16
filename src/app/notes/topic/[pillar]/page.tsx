import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { JsonLd } from "@/components/notes/json-ld";
import { NotesShell } from "@/components/notes/notes-shell";
import { PostList } from "@/components/notes/post-list";
import { breadcrumbJsonLd } from "@/lib/notes/jsonld";
import { listPublishedInPillar } from "@/lib/notes/queries";
import { hubPath, isPillarKey, PILLARS, type PillarKey } from "@/lib/notes/topics";
import { absoluteUrl, siteName } from "@/lib/seo";
import { notes, topics } from "@/lib/site-content";

type Props = { params: Promise<{ pillar: string }> };

export const revalidate = 3600;

// 기둥은 코드에 고정돼 있다. 목록에 없는 키는 404 다.
export const dynamicParams = false;

export function generateStaticParams() {
  return PILLARS.map((p) => ({ pillar: p.key }));
}

// 메타데이터와 본문이 같은 읽기를 쓴다. 한 요청에 데이터베이스는 한 번만 읽는다.
const loadPosts = cache((key: PillarKey) => listPublishedInPillar(key));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const key = (await params).pillar;
  if (!isPillarKey(key)) return {};

  // 글이 없는 모음 페이지는 색인에서 뺀다. 링크는 따라가게 둔다.
  const empty = (await loadPosts(key)).length === 0;

  const title = `${topics[key].title} · ${siteName}`;
  const url = absoluteUrl(hubPath(key));
  return {
    title,
    description: topics[key].intro,
    alternates: { canonical: url },
    ...(empty ? { robots: { index: false, follow: true } } : {}),
    openGraph: { type: "website", url, title, description: topics[key].intro, siteName, locale: "ko_KR" },
  };
}

export default async function TopicHubPage({ params }: Props) {
  const key = (await params).pillar;
  if (!isPillarKey(key)) notFound();

  const topic = topics[key];
  const posts = await loadPosts(key);

  return (
    <NotesShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: notes.breadcrumbHome, url: absoluteUrl("/") },
          { name: notes.breadcrumbList, url: absoluteUrl("/notes") },
          { name: topic.title, url: absoluteUrl(hubPath(key)) },
        ])}
      />

      <nav aria-label="현재 위치" className="text-[13px] text-[#8a7d75]">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-[#fd715b]">
              {notes.breadcrumbHome}
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link href="/notes" className="hover:text-[#fd715b]">
              {notes.breadcrumbList}
            </Link>
          </li>
        </ol>
      </nav>

      <h1 className="mt-6 text-[28px] leading-[1.3] font-extrabold tracking-[-0.5px] text-[#2b2421] min-[992px]:text-[36px]">
        {topic.title}
      </h1>
      <p className="mt-3 text-[16px] leading-7 text-[#5c514b]">{topic.intro}</p>

      {posts.length === 0 ? (
        <p className="mt-10 text-[16px] leading-7 text-[#5c514b]">{notes.empty}</p>
      ) : (
        <PostList posts={posts} />
      )}
    </NotesShell>
  );
}
