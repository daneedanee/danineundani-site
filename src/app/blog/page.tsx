import type { Metadata } from "next";

import { NotesIndex, notesIndexMetadata } from "@/components/notes/notes-index";

// 만들어 둔 페이지를 1시간 쓴다. 글을 발행·수정하면 /api/notes/revalidate 가 바로 새로 만들게 한다.
export const revalidate = 3600;

export const metadata: Metadata = notesIndexMetadata(1);

export default function BlogPage() {
  return <NotesIndex page={1} />;
}
