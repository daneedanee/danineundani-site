import Link from "next/link";

import { notesPagePath } from "@/lib/notes/paging";

const itemClass =
  "flex h-10 min-w-10 items-center justify-center rounded-[4px] border border-[#eaded4] bg-white px-3 text-[14px] font-semibold text-[#2b2421]";

// 번호로 넘기는 쪽 이동. 쪽마다 진짜 링크(<a>)라서 검색 로봇이 따라갈 수 있다.
export function Pagination({ page, pages }: { page: number; pages: number }) {
  if (pages <= 1) return null;

  return (
    <nav aria-label="쪽 이동" className="mt-12">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {page > 1 && (
          <li>
            <Link href={notesPagePath(page - 1)} rel="prev" className={itemClass}>
              이전
            </Link>
          </li>
        )}
        {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
          <li key={number}>
            {number === page ? (
              <span aria-current="page" className={`${itemClass} border-[#fd715b] bg-[#fd715b]`}>
                {number}
              </span>
            ) : (
              <Link href={notesPagePath(number)} className={itemClass}>
                {number}
              </Link>
            )}
          </li>
        ))}
        {page < pages && (
          <li>
            <Link href={notesPagePath(page + 1)} rel="next" className={itemClass}>
              다음
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
