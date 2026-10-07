"use client";

// 인스타그램 · 스레드 연결 화면.
//
// 화면이 하는 일은 두 가지다.
//   1) 내 계정 정보와 성과를 읽어서 보여준다 (읽기만 한다).
//   2) 올릴 글을 미리보기로 확인시키고, 대표가 "올립니다"를 누른 뒤에만 올린다.
import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type Snapshot = {
  connected: boolean;
  profile?: Record<string, unknown>;
  insights?: { data?: { name: string; total_value?: { value?: number }; values?: { value: number }[] }[] };
  error?: string;
};

type Plan = { targets: ("instagram" | "threads")[]; caption: string; imageUrl: string };

const card = "rounded-[10px] bg-white p-5 shadow-[0_1px_14px_1px_rgba(0,0,0,0.11)]";
const inputClass =
  "mt-2 w-full rounded-[6px] border border-[#d1d5db] bg-white px-4 py-3 text-[15px] text-[#191919] outline-none focus-visible:border-[#fd715b] focus-visible:ring-2 focus-visible:ring-[#fd715b]/40";

function metricValue(snapshot: Snapshot, name: string) {
  const row = snapshot.insights?.data?.find((d) => d.name === name);
  return row?.total_value?.value ?? row?.values?.[0]?.value;
}

function AccountCard({ title, snapshot }: { title: string; snapshot?: Snapshot }) {
  if (!snapshot) return <div className={card}><p className="text-[15px] text-[#5f6368]">{title} 확인 중…</p></div>;

  const profile = snapshot.profile ?? {};
  return (
    <div className={card}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[16px] font-bold text-[#191919]">{title}</p>
        <p className={`text-[13px] font-semibold ${snapshot.connected ? "text-[#1a7f4b]" : "text-[#c9412f]"}`}>
          {snapshot.connected ? "연결됨" : "연결 안 됨"}
        </p>
      </div>

      {snapshot.connected ? (
        <>
          <p className="mt-2 text-[15px] text-[#191919]">
            @{String(profile.username ?? "-")}
            {profile.name ? ` · ${String(profile.name)}` : ""}
          </p>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              ["팔로워", profile.followers_count ?? metricValue(snapshot, "followers_count")],
              ["게시물", profile.media_count],
              ["노출/도달", metricValue(snapshot, "reach") ?? metricValue(snapshot, "views")],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-[6px] bg-[#f9fafb] py-3">
                <dt className="text-[12px] text-[#5f6368]">{String(label)}</dt>
                <dd className="mt-1 text-[16px] font-bold text-[#191919]">
                  {typeof value === "number" ? value.toLocaleString("ko-KR") : "—"}
                </dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}

      {snapshot.error && <p className="mt-3 text-[13px] leading-[20px] text-[#c9412f]">{snapshot.error}</p>}
    </div>
  );
}

function SocialPanel({ session, onSignOut }: { session: Session; onSignOut: () => void }) {
  const [accounts, setAccounts] = useState<{ instagram?: Snapshot; threads?: Snapshot } | null>(null);
  const [loadError, setLoadError] = useState("");

  const [targets, setTargets] = useState<("instagram" | "threads")[]>(["threads"]);
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [preview, setPreview] = useState<{ plan: Plan; token: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState<{ target: string; permalink?: string }[] | null>(null);

  const authHeaders = useCallback(
    () => ({ authorization: `Bearer ${session.access_token}`, "content-type": "application/json" }),
    [session.access_token],
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch("/api/social/accounts", { headers: authHeaders() });
      const body = await res.json().catch(() => null);
      if (cancelled) return;
      if (!res.ok) {
        setLoadError(body?.error ?? "계정 정보를 불러오지 못했습니다.");
        return;
      }
      setAccounts(body);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [authHeaders]);

  // 내용을 고치면 앞서 받은 확인표는 곧바로 버린다.
  // 확인한 것과 올라가는 것이 달라지는 일은 없어야 한다.
  function discardPreview() {
    setPreview(null);
    setDone(null);
  }

  function toggle(target: "instagram" | "threads") {
    discardPreview();
    setTargets((prev) => (prev.includes(target) ? prev.filter((t) => t !== target) : [...prev, target]));
  }

  async function handlePreview() {
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/social/publish", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ stage: "preview", targets, caption, imageUrl }),
    });
    const body = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setMessage(body?.error ?? "미리보기를 만들지 못했습니다.");
      return;
    }
    setPreview({ plan: body.plan, token: body.token });
  }

  async function handlePublish() {
    if (!preview) return;
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/social/publish", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ stage: "publish", ...preview.plan, confirmToken: preview.token }),
    });
    const body = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok && res.status !== 207) {
      setMessage(body?.error ?? "올리지 못했습니다.");
      return;
    }
    setDone(body.results ?? []);
    setPreview(null);
    if (body.failures?.length) {
      setMessage(body.failures.map((f: { target: string; message: string }) => `${f.target}: ${f.message}`).join(" / "));
    }
  }

  return (
    <div className="mx-auto w-full max-w-[940px] px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold tracking-[-0.5px] text-[#191919] min-[992px]:text-[24px]">
            인스타그램 · 스레드
          </h1>
          <p className="mt-1 text-[14px] text-[#5f6368]">{session.user.email} 님으로 로그인</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/admin"
            className="flex h-[40px] items-center rounded-[4px] border border-[#d1d5db] bg-white px-4 text-[14px] font-semibold text-[#191919]"
          >
            신청 목록
          </a>
          <button
            type="button"
            onClick={onSignOut}
            className="h-[40px] rounded-[4px] bg-[#191919] px-4 text-[14px] font-semibold text-white"
          >
            로그아웃
          </button>
        </div>
      </div>

      {loadError && <p className="mt-6 text-[14px] font-semibold text-[#c9412f]">{loadError}</p>}

      <section className="mt-6 grid gap-3 min-[720px]:grid-cols-2">
        <AccountCard title="인스타그램" snapshot={accounts?.instagram} />
        <AccountCard title="스레드" snapshot={accounts?.threads} />
      </section>

      <section className={`${card} mt-6`}>
        <h2 className="text-[16px] font-bold text-[#191919]">글 올리기</h2>
        <p className="mt-1 text-[14px] text-[#5f6368]">
          미리보기를 먼저 만들고, 대표님이 확인한 뒤에만 실제로 올라갑니다.
        </p>

        <div className="mt-4 flex gap-4">
          {(["instagram", "threads"] as const).map((target) => (
            <label key={target} className="flex items-center gap-2 text-[15px] text-[#191919]">
              <input type="checkbox" checked={targets.includes(target)} onChange={() => toggle(target)} />
              {target === "instagram" ? "인스타그램" : "스레드"}
            </label>
          ))}
        </div>

        <div className="mt-4">
          <label htmlFor="caption" className="text-[14px] font-semibold text-[#191919]">
            본문
          </label>
          <textarea
            id="caption"
            rows={6}
            value={caption}
            onChange={(e) => {
              discardPreview();
              setCaption(e.target.value);
            }}
            className={`${inputClass} resize-y`}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="image" className="text-[14px] font-semibold text-[#191919]">
            사진 주소 (인스타그램은 필수)
          </label>
          <input
            id="image"
            type="url"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => {
              discardPreview();
              setImageUrl(e.target.value);
            }}
            className={inputClass}
          />
        </div>

        <button
          type="button"
          onClick={() => void handlePreview()}
          disabled={busy || caption.trim().length === 0 || targets.length === 0}
          className="mt-5 h-[50px] w-full rounded-[4px] border border-[#191919] bg-white text-[16px] font-bold text-[#191919] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy && !preview ? "만드는 중…" : "미리보기 만들기"}
        </button>

        {preview && (
          <div className="mt-5 rounded-[8px] border-2 border-[#fd715b] bg-[#fff8f6] p-4">
            <p className="text-[14px] font-bold text-[#191919]">이대로 올라갑니다 — 확인해 주세요</p>
            <p className="mt-2 text-[13px] text-[#5f6368]">
              채널: {preview.plan.targets.map((t) => (t === "instagram" ? "인스타그램" : "스레드")).join(", ")}
            </p>
            <p className="mt-2 text-[15px] leading-[24px] whitespace-pre-wrap text-[#191919]">{preview.plan.caption}</p>
            {preview.plan.imageUrl && (
              // 미리보기용 외부 이미지라 next/image 대신 img 를 쓴다.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.plan.imageUrl} alt="올릴 사진 미리보기" className="mt-3 max-h-[320px] rounded-[6px]" />
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => void handlePublish()}
                disabled={busy}
                className="h-[46px] flex-1 rounded-[4px] bg-[#fd715b] text-[15px] font-bold text-black disabled:opacity-60"
              >
                {busy ? "올리는 중…" : "확인했습니다. 올립니다"}
              </button>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="h-[46px] rounded-[4px] border border-[#d1d5db] bg-white px-5 text-[15px] font-semibold text-[#191919]"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {done && done.length > 0 && (
          <ul className="mt-5 space-y-1 text-[14px] text-[#1a7f4b]">
            {done.map((r) => (
              <li key={r.target}>
                {r.target === "instagram" ? "인스타그램" : "스레드"}에 올렸습니다.
                {r.permalink && (
                  <a href={r.permalink} target="_blank" rel="noreferrer" className="ml-1 underline">
                    보기
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}

        {message && <p className="mt-4 text-[14px] font-semibold text-[#c9412f]">{message}</p>}
      </section>
    </div>
  );
}

export default function SocialAdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-[#f9fafb] px-5 pb-16">
      {checking ? (
        <p className="pt-20 text-center text-[15px] text-[#5f6368]">확인 중…</p>
      ) : session ? (
        <SocialPanel session={session} onSignOut={() => void supabase.auth.signOut()} />
      ) : (
        <p className="pt-20 text-center text-[15px] text-[#5f6368]">
          <a href="/admin" className="underline">
            /admin
          </a>
          에서 먼저 로그인해 주세요.
        </p>
      )}
    </main>
  );
}
