import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { JsonLd } from "@/components/notes/json-ld";
import { NotesShell } from "@/components/notes/notes-shell";
import { PostBody } from "@/components/notes/post-body";
import { formatDate } from "@/lib/notes/format";
import { isStorageImage } from "@/lib/notes/images";
import { blogPostingJsonLd, breadcrumbJsonLd } from "@/lib/notes/jsonld";
import { getPublishedBySlug, listAllPublished } from "@/lib/notes/queries";
import { decodeSlugParam } from "@/lib/notes/slug";
import { absoluteUrl, siteName } from "@/lib/seo";
import { author, notes } from "@/lib/site-content";

type Props = { params: Promise<{ slug: string }> };

// 만들어 둔 페이지를 1시간 쓴다. 글을 발행·수정하면 /api/notes/revalidate 가 바로 새로 만들게 한다.
export const revalidate = 3600;

// 발행한 글은 빌드할 때 미리 만든다. 그 뒤에 발행한 글은 처음 방문 때 만들어 저장한다.
export async function generateStaticParams() {
  const posts = await listAllPublished();
  return posts.map((post) => ({ slug: post.slug }));
}

// generateMetadata 와 페이지가 같은 글을 두 번 읽지 않게 한 요청 안에서 한 번만 읽는다.
// 한글 주소는 인코딩된 채 들어올 수 있어서 decodeSlugParam 으로 푼다.
const loadPost = cache(async (rawSlug: string) => {
  const slug = decodeSlugParam(rawSlug);
  return slug ? getPublishedBySlug(slug) : null;
});

function postUrl(slug: string) {
  return absoluteUrl(`/notes/${slug}`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await loadPost((await params).slug);
  if (!post) return {};

  const title = `${post.title} · ${siteName}`;
  const url = postUrl(post.slug);
  const images = post.cover_image_url ? [post.cover_image_url] : undefined;

  return {
    title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      siteName,
      locale: "ko_KR",
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: post.title,
      description: post.description,
      images,
    },
  };
}

export default async function NotePage({ params }: Props) {
  const post = await loadPost((await params).slug);
  // 없는 주소와 초안은 똑같이 404 다. 초안은 데이터베이스 권한이 애초에 내주지 않는다.
  if (!post) notFound();

  const url = postUrl(post.slug);
  const cover = post.cover_image_url;

  return (
    <NotesShell>
      <JsonLd
        data={blogPostingJsonLd(post, url, {
          siteName,
          siteUrl: absoluteUrl("/"),
          authorName: author.name,
          authorSameAs: [...author.sameAs],
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: notes.breadcrumbHome, url: absoluteUrl("/") },
          { name: notes.breadcrumbList, url: absoluteUrl("/notes") },
          { name: post.title, url },
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

      <article className="mt-6">
        <header>
          <h1 className="text-[28px] leading-[1.35] font-extrabold tracking-[-0.5px] text-[#2b2421] min-[992px]:text-[36px]">
            {post.title}
          </h1>
          {post.published_at && (
            <p className="mt-4 text-[13px] text-[#8a7d75]">
              {author.name} · <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
            </p>
          )}
        </header>

        {cover &&
          (isStorageImage(cover, process.env.NEXT_PUBLIC_SUPABASE_URL) ? (
            <div className="relative mt-8 aspect-[1200/630] overflow-hidden rounded-[10px]">
              <Image src={cover} alt="" fill priority sizes="(min-width: 760px) 720px, 100vw" className="object-cover" />
            </div>
          ) : (
            // 우리 보관함 밖의 주소는 next/image 가 받지 않는다. 그대로 내보낸다.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="mt-8 w-full rounded-[10px]" />
          ))}

        <div className="mt-10">
          <PostBody markdown={post.content_md} />
        </div>
      </article>

      <p className="mt-14 border-t border-[#eaded4] pt-6 text-[15px]">
        <Link href="/notes" className="font-semibold text-[#2b2421] underline decoration-[#fd715b] decoration-2 underline-offset-4">
          {notes.backToList}
        </Link>
      </p>
    </NotesShell>
  );
}
