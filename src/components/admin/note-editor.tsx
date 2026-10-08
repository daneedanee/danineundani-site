"use client";

// 글 한 편을 쓰고 고치는 화면.
// 저장·발행·삭제가 끝나면 게시판을 새로 만들게 하고(requestRevalidate) 목록으로 돌아간다.
import { useEffect, useRef, useState } from "react";

import { PostBody } from "@/components/notes/post-body";
import { deletePost, requestRevalidate, savePost, uploadPostImage } from "@/lib/notes/admin-api";
import { isDirty } from "@/lib/notes/dirty";
import { countImagesMissingAlt } from "@/lib/notes/markdown-images";
import { slugify } from "@/lib/notes/slug";
import type { Post, PostStatus } from "@/lib/notes/types";
import { DESCRIPTION_MAX, validatePost, type PostInput } from "@/lib/notes/validate";

const inputClass =
  "mt-2 w-full rounded-[6px] border border-[#d1d5db] bg-white px-4 py-3 text-[15px] text-[#191919] outline-none focus-visible:border-[#fd715b] focus-visible:ring-2 focus-visible:ring-[#fd715b]/40 disabled:bg-[#f3f4f6] disabled:text-[#5f6368]";
const labelClass = "text-[14px] font-semibold text-[#191919]";
const hintClass = "mt-1.5 text-[13px] leading-5 text-[#5f6368]";
const plainButton =
  "h-[44px] rounded-[4px] border border-[#d1d5db] bg-white px-4 text-[14px] font-semibold text-[#191919] disabled:cursor-not-allowed disabled:opacity-60";

type Props = {
  post: Post | null;
  accessToken: string;
  onDone: (notice: string) => void;
  onCancel: () => void;
};

export function NoteEditor({ post, accessToken, onDone, onCancel }: Props) {
  const [input, setInput] = useState<PostInput>({
    slug: post?.slug ?? "",
    title: post?.title ?? "",
    description: post?.description ?? "",
    content_md: post?.content_md ?? "",
    cover_image_url: post?.cover_image_url ?? "",
  });
  // 마지막으로 저장된 내용. 지금 내용과 다르면 "저장하지 않은 내용이 있다"고 본다.
  const [savedInput, setSavedInput] = useState<PostInput>(input);
  // 새 글을 초안으로 한 번 저장하면 id 가 생긴다. 그 뒤의 저장은 같은 글을 고친다.
  const [postId, setPostId] = useState<string | null>(post?.id ?? null);
  const [savedNotice, setSavedNotice] = useState("");
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  // 새 글은 제목을 따라 주소가 만들어진다. 주소 칸을 직접 고치면 그때부터 따라가지 않는다.
  const [slugTouched, setSlugTouched] = useState(post !== null);
  const [busy, setBusy] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const bodyFile = useRef<HTMLInputElement>(null);
  const coverFile = useRef<HTMLInputElement>(null);

  // 한 번 발행한 글의 주소는 바꾸지 못한다. 데이터베이스도 같은 것을 막는다.
  const slugLocked = Boolean(post?.published_at);
  const isPublished = post?.status === "published";
  const missingAlt = countImagesMissingAlt(input.content_md);
  const dirty = isDirty(savedInput, input);

  // 저장하지 않은 내용이 있을 때 새로고침·탭 닫기·뒤로 가기를 하면 브라우저가 한 번 묻게 한다.
  useEffect(() => {
    if (!dirty) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function handleLeave() {
    if (dirty) setConfirmingLeave(true);
    else onCancel();
  }

  function setField(key: keyof PostInput, value: string) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function handleTitle(value: string) {
    setInput((prev) => ({ ...prev, title: value, slug: slugTouched ? prev.slug : slugify(value) }));
  }

  async function finish(notice: string) {
    const refreshed = await requestRevalidate(accessToken);
    onDone(refreshed ? notice : `${notice} 다만 사이트에 반영되기까지 최대 1시간이 걸릴 수 있습니다.`);
  }

  async function handleSave(status: PostStatus) {
    const found = validatePost(input, status === "published" ? "publish" : "draft");
    if (found.length > 0) {
      setProblems(found);
      return;
    }
    setBusy(true);
    setProblems([]);
    setSavedNotice("");
    const result = await savePost(postId, input, status);
    if (!result.ok) {
      setProblems([result.message]);
      setBusy(false);
      return;
    }
    setPostId(result.id);
    setSavedInput(input);
    setConfirmingLeave(false);
    // 초안을 초안으로 저장한 것은 사이트에 보이는 게 바뀌지 않는다. 화면을 닫지 않고 계속 쓰게 둔다.
    if (status === "draft" && !isPublished) {
      setSavedNotice("초안을 저장했습니다. 계속 쓰셔도 됩니다.");
      setBusy(false);
      return;
    }
    const notice =
      status === "published" ? "발행했습니다." : isPublished ? "발행을 취소하고 초안으로 돌렸습니다." : "초안을 저장했습니다.";
    await finish(notice);
  }

  async function handleDelete() {
    if (!postId) return;
    setBusy(true);
    setProblems([]);
    const result = await deletePost(postId);
    if (!result.ok) {
      setProblems([result.message]);
      setBusy(false);
      return;
    }
    await finish("삭제했습니다.");
  }

  async function handleUpload(file: File | undefined, target: "cover" | "body") {
    if (!file) return;
    setBusy(true);
    setProblems([]);
    const result = await uploadPostImage(file);
    setBusy(false);
    if (!result.ok) {
      setProblems([result.message]);
      return;
    }
    if (target === "cover") {
      setField("cover_image_url", result.url);
    } else {
      // 설명(alt)은 비워서 넣는다. 아래 안내가 채우라고 알려 준다.
      setInput((prev) => ({ ...prev, content_md: `${prev.content_md.trimEnd()}\n\n![](${result.url})\n` }));
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[20px] font-extrabold tracking-[-0.5px] text-[#191919] min-[992px]:text-[24px]">
          {post ? "글 고치기" : "새 글"}
        </h1>
        {confirmingLeave ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-semibold text-[#c9412f]">저장하지 않은 내용이 있습니다.</span>
            <button type="button" onClick={() => setConfirmingLeave(false)} disabled={busy} className={plainButton}>
              계속 쓰기
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="h-[44px] rounded-[4px] bg-[#c9412f] px-4 text-[14px] font-bold text-white disabled:opacity-60"
            >
              저장하지 않고 나가기
            </button>
          </div>
        ) : (
          <button type="button" onClick={handleLeave} disabled={busy} className={plainButton}>
            목록으로
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-6 min-[992px]:grid-cols-2">
        <div className="space-y-5 rounded-[10px] bg-white p-6 shadow-[0_1px_14px_1px_rgba(0,0,0,0.11)]">
          <div>
            <label htmlFor="note-title" className={labelClass}>
              제목
            </label>
            <input id="note-title" type="text" value={input.title} onChange={(e) => handleTitle(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label htmlFor="note-slug" className={labelClass}>
              주소
            </label>
            <input
              id="note-slug"
              type="text"
              value={input.slug}
              disabled={slugLocked}
              onChange={(e) => {
                setSlugTouched(true);
                setField("slug", e.target.value);
              }}
              className={inputClass}
            />
            <p className={hintClass}>
              /notes/{input.slug || "…"}
              <br />
              {slugLocked
                ? "한 번 발행한 글의 주소는 바꿀 수 없습니다. 주소가 바뀌면 검색에 쌓인 것이 끊깁니다."
                : "한글도 되지만 카카오톡·스레드에 붙이면 %EB%B8%94… 처럼 길게 깨져 보입니다. 짧은 영문을 권합니다. 예: blog-seo-2026"}
            </p>
          </div>

          <div>
            <label htmlFor="note-description" className={labelClass}>
              설명 <span className="font-normal text-[#5f6368]">({input.description.trim().length}/{DESCRIPTION_MAX})</span>
            </label>
            <textarea
              id="note-description"
              rows={3}
              value={input.description}
              onChange={(e) => setField("description", e.target.value)}
              className={inputClass}
            />
            <p className={hintClass}>검색 결과와 목록에서 제목 아래에 나오는 문장입니다.</p>
          </div>

          <div>
            <label htmlFor="note-cover" className={labelClass}>
              대표 이미지 주소
            </label>
            <input
              id="note-cover"
              type="url"
              value={input.cover_image_url}
              onChange={(e) => setField("cover_image_url", e.target.value)}
              className={inputClass}
            />
            <input
              ref={coverFile}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                void handleUpload(e.target.files?.[0], "cover");
                e.target.value = "";
              }}
            />
            <button type="button" disabled={busy} onClick={() => coverFile.current?.click()} className={`mt-2 ${plainButton}`}>
              대표 이미지 올리기
            </button>
          </div>

          <div>
            <label htmlFor="note-content" className={labelClass}>
              본문 (마크다운)
            </label>
            <textarea
              id="note-content"
              rows={22}
              value={input.content_md}
              onChange={(e) => setField("content_md", e.target.value)}
              className={`${inputClass} font-mono text-[14px] leading-6`}
            />
            <input
              ref={bodyFile}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                void handleUpload(e.target.files?.[0], "body");
                e.target.value = "";
              }}
            />
            <button type="button" disabled={busy} onClick={() => bodyFile.current?.click()} className={`mt-2 ${plainButton}`}>
              본문에 이미지 넣기
            </button>
            <p className={hintClass}>
              ## 소제목 · **굵게** · - 목록 · [글자](주소) · ![이미지 설명](주소)
              <br />
              본문의 # 제목은 ## 로 바뀌어 나갑니다. 큰 제목은 위의 「제목」 하나뿐입니다.
            </p>
            {missingAlt > 0 && (
              <p className="mt-2 text-[13px] font-semibold text-[#c9412f]">
                설명이 빈 이미지가 {missingAlt}개 있습니다. ![여기](주소) 의 대괄호 안에 사진 설명을 적어 주세요.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[10px] bg-[#fffaf4] p-6 shadow-[0_1px_14px_1px_rgba(0,0,0,0.11)]">
          <p className="text-[13px] font-semibold text-[#5f6368]">미리보기</p>
          <p className="mt-4 text-[28px] leading-[1.35] font-extrabold tracking-[-0.5px] text-[#2b2421]">
            {input.title || "제목"}
          </p>
          <div className="mt-8">
            <PostBody markdown={input.content_md} />
          </div>
        </div>
      </div>

      <div role="status" aria-live="polite" className="mt-6 space-y-1">
        {savedNotice && <p className="text-[14px] font-semibold text-[#1a7f4b]">{savedNotice}</p>}
        {problems.map((problem) => (
          <p key={problem} className="text-[14px] font-semibold text-[#c9412f]">
            {problem}
          </p>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" disabled={busy} onClick={() => void handleSave("draft")} className={plainButton}>
          {isPublished ? "발행 취소 (초안으로)" : "초안 저장"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleSave("published")}
          className="h-[44px] rounded-[4px] bg-[#fd715b] px-5 text-[14px] font-bold text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "처리 중…" : isPublished ? "고친 내용 발행" : "발행"}
        </button>

        {postId && (
          <div className="ml-auto flex items-center gap-2">
            {confirmingDelete ? (
              <>
                <span className="text-[14px] text-[#c9412f]">지우면 되돌릴 수 없습니다.</span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleDelete()}
                  className="h-[44px] rounded-[4px] bg-[#c9412f] px-4 text-[14px] font-bold text-white disabled:opacity-60"
                >
                  정말 삭제
                </button>
                <button type="button" disabled={busy} onClick={() => setConfirmingDelete(false)} className={plainButton}>
                  그만두기
                </button>
              </>
            ) : (
              <button type="button" disabled={busy} onClick={() => setConfirmingDelete(true)} className={plainButton}>
                삭제
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
