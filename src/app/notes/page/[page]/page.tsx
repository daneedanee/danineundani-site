import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { NotesIndex, notesIndexMetadata } from "@/components/notes/notes-index";
import { parsePageParam } from "@/lib/notes/paging";

type Props = { params: Promise<{ page: string }> };

export const revalidate = 3600;

// 미리 만들어 두는 쪽은 없다. 처음 방문 때 만들어 저장한다.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = parsePageParam((await params).page);
  return page && page > 1 ? notesIndexMetadata(page) : {};
}

export default async function NotesPagedPage({ params }: Props) {
  const page = parsePageParam((await params).page);
  if (page === null) notFound();
  // 1쪽의 주소는 /notes 하나뿐이다. 같은 내용이 두 주소로 잡히지 않게 넘긴다.
  if (page === 1) permanentRedirect("/notes");
  return <NotesIndex page={page} />;
}
