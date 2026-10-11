"use client";

// 관리자 전용 글 관리 화면 (/admin/notes).
// 볼 수 있는 사람은 Supabase 에 등록된 관리자 계정뿐이다. 누가 볼 수 있는지는 화면이 아니라
// 데이터베이스 권한(supabase/05-posts.sql)이 정한다. 관리자가 아니면 초안이 보이지 않고 저장이 거부된다.
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminGate } from "@/components/admin/admin-gate";
import { NoteEditor } from "@/components/admin/note-editor";
import { listAllPosts } from "@/lib/notes/admin-api";
import { formatDate } from "@/lib/notes/format";
import type { Post } from "@/lib/notes/types";

function NotesAdmin({ session }: { session: Session }) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  // 칼럼 페이지의 「글쓰기」 버튼(/admin/notes?new=1)으로 들어오면 새 글 화면을 바로 연다.
  const [editing, setEditing] = useState<Post | "new" | null>(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("new") === "1" ? "new" : null,
  );
  // 주소의 ?new=1 은 한 번 쓰고 지운다. 남겨 두면 새로고침할 때마다 새 글 화면이 다시 열린다.
  useEffect(() => {
    if (window.location.search) window.history.replaceState(null, "", "/admin/notes");
  }, []);
  // 편집을 마칠 때마다 이 숫자가 올라가고, 그때마다 아래 effect 가 목록을 다시 읽는다.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void listAllPosts().then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setError(result.message);
        setPosts([]);
        return;
      }
      setError("");
      setPosts(result.posts);
    });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (editing) {
    return (
      <NoteEditor
        key={editing === "new" ? "new" : editing.id}
        post={editing === "new" ? null : editing}
        accessToken={session.access_token}
        onCancel={() => {
          setEditing(null);
          setReloadKey((k) => k + 1);
        }}
        onDone={(message) => {
          setNotice(message);
          setEditing(null);
          setReloadKey((k) => k + 1);
        }}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[940px] px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold tracking-[-0.5px] text-[#191919] min-[992px]:text-[24px]">글 관리</h1>
          <p className="mt-1 text-[14px] text-[#5f6368]">
            {session.user.email} 님으로 로그인{posts && ` · 총 ${posts.length}편`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin"
            className="flex h-[40px] items-center rounded-[4px] border border-[#d1d5db] bg-white px-4 text-[14px] font-semibold text-[#191919]"
          >
            상담 신청 목록
          </Link>
          <button
            type="button"
            onClick={() => {
              setNotice("");
              setEditing("new");
            }}
            className="h-[40px] rounded-[4px] bg-[#fd715b] px-4 text-[14px] font-bold text-black"
          >
            새 글
          </button>
        </div>
      </div>

      <p role="status" aria-live="polite" className="mt-6 text-[14px] font-semibold text-[#1a7f4b]">
        {notice}
      </p>
      {error && <p className="mt-2 text-[14px] font-semibold text-[#c9412f]">{error}</p>}

      {posts === null && <p className="mt-10 text-center text-[15px] text-[#5f6368]">불러오는 중…</p>}

      {posts !== null && posts.length === 0 && !error && (
        <p className="mt-10 text-center text-[15px] text-[#5f6368]">아직 쓴 글이 없습니다.</p>
      )}

      {posts !== null && posts.length > 0 && (
        <ul className="mt-4 space-y-3">
          {posts.map((post) => (
            <li key={post.id} className="rounded-[10px] bg-white p-5 shadow-[0_1px_14px_1px_rgba(0,0,0,0.11)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[16px] font-bold text-[#191919]">
                    <span
                      className={`mr-2 inline-block rounded-[4px] px-2 py-0.5 text-[12px] font-bold ${
                        post.status === "published" ? "bg-[#e6f4ec] text-[#1a7f4b]" : "bg-[#f3f4f6] text-[#5f6368]"
                      }`}
                    >
                      {post.status === "published" ? "발행" : "초안"}
                    </span>
                    {post.title}
                  </p>
                  <p className="mt-1 text-[13px] break-all text-[#5f6368]">
                    /notes/{post.slug} · {formatDate(post.updated_at)} 수정
                  </p>
                </div>
                <div className="flex gap-2">
                  {post.status === "published" && (
                    <Link
                      href={`/notes/${encodeURIComponent(post.slug)}`}
                      target="_blank"
                      className="flex h-[40px] items-center rounded-[4px] border border-[#d1d5db] bg-white px-4 text-[14px] font-semibold text-[#191919]"
                    >
                      보기
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setNotice("");
                      setEditing(post);
                    }}
                    className="h-[40px] rounded-[4px] bg-[#191919] px-4 text-[14px] font-semibold text-white"
                  >
                    고치기
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminNotesPage() {
  return (
    <main className="min-h-screen bg-[#f9fafb] px-5 pb-16">
      <AdminGate>{(session) => <NotesAdmin session={session} />}</AdminGate>
    </main>
  );
}
