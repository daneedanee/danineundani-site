import Image from "next/image";
import Link from "next/link";

import { BLOG_PATH } from "@/lib/notes/paths";
import { hubPath, PILLARS, type PillarKey } from "@/lib/notes/topics";
import { aboutPage, author, notes } from "@/lib/site-content";

import { AdminWriteLink } from "./admin-write-link";

const pillClass = "rounded-full border px-4 py-2 text-[14px] leading-5 font-semibold transition-colors";
const pillIdle = "border-[#e5d9ce] bg-white text-[#2b2421] hover:border-[#fd715b] hover:text-[#c9412f]";
const pillActive = "border-[#2b2421] bg-[#2b2421] text-white";

// 목록 머리. avcd.kr/blog 처럼 제목, 소개, 글쓴이, 주제 버튼(전체 + 기둥)을 둔다 (2026-10-26).
// active 는 지금 보는 주제다. 전체 목록이면 "all".
export function BlogHeader({
  title,
  intro,
  active,
  breadcrumb,
}: {
  title: string;
  intro: string;
  active: PillarKey | "all";
  breadcrumb?: React.ReactNode;
}) {
  return (
    <header>
      {breadcrumb}
      <div className="flex items-start justify-between gap-6">
        <div className="max-w-[640px]">
          <h1 className="text-[32px] leading-[1.25] font-extrabold tracking-[-0.8px] text-[#2b2421] min-[992px]:text-[44px]">{title}</h1>
          <p className="mt-4 text-[16px] leading-[1.75] text-[#5c514b] break-keep">{intro}</p>
          <Link href="/about" className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-[#2b2421] hover:text-[#c9412f]">
            <Image src={aboutPage.hero.photo.src} alt="" width={28} height={28} className="size-7 rounded-full object-cover" />
            {author.name} · {aboutPage.jsonLd.jobTitle}
          </Link>
        </div>
        <AdminWriteLink />
      </div>

      <nav aria-label={notes.topicsLabel} className="mt-9">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link href={BLOG_PATH} aria-current={active === "all" ? "page" : undefined} className={`${pillClass} ${active === "all" ? pillActive : pillIdle}`}>
              {notes.allTopics}
            </Link>
          </li>
          {PILLARS.map((pillar) => (
            <li key={pillar.key}>
              <Link
                href={hubPath(pillar.key)}
                aria-current={active === pillar.key ? "page" : undefined}
                className={`${pillClass} ${active === pillar.key ? pillActive : pillIdle}`}
              >
                {pillar.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
