"use client";

// 관리자 전용 신청 목록 화면.
// 볼 수 있는 사람은 Supabase에 등록된 관리자 계정뿐이다. 누가 볼 수 있는지는 화면이 아니라
// 데이터베이스 권한(supabase/02-admin-read.sql)이 정한다. 로그인하지 않았거나 관리자가
// 아니면 이 화면에서 아무 내용도 받아오지 못한다.
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { inquiriesTable, supabase } from "@/lib/supabase";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

const inputClass =
  "mt-2 w-full rounded-[6px] border border-[#d1d5db] bg-white px-4 py-3 text-[15px] text-[#191919] outline-none focus-visible:border-[#fd715b] focus-visible:ring-2 focus-visible:ring-[#fd715b]/40";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LoginForm({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSending(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setSending(false);
    if (signInError) {
      setError("이메일 또는 비밀번호가 맞지 않습니다.");
      return;
    }
    onDone();
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="mx-auto mt-16 w-full max-w-[400px] rounded-[10px] bg-white p-6 shadow-[0_1px_14px_1px_rgba(0,0,0,0.11)]"
    >
      <h1 className="text-[20px] font-extrabold tracking-[-0.5px] text-[#191919]">관리자 로그인</h1>
      <p className="mt-1.5 text-[14px] text-[#5f6368]">상담 신청 목록을 보려면 로그인하세요.</p>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="admin-email" className="text-[14px] font-semibold text-[#191919]">
            이메일
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="text-[14px] font-semibold text-[#191919]">
            비밀번호
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={sending}
        className="mt-6 h-[50px] w-full rounded-[4px] bg-[#fd715b] text-[16px] font-bold text-black transition-transform duration-200 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
      >
        {sending ? "확인 중…" : "로그인"}
      </button>

      <p role="status" aria-live="polite" className="mt-3 text-center text-[14px] font-semibold text-[#c9412f]">
        {error}
      </p>
    </form>
  );
}

function InquiryList({ session, onSignOut }: { session: Session; onSignOut: () => void }) {
  const [rows, setRows] = useState<Inquiry[] | null>(null);
  const [error, setError] = useState("");
  // 새로고침 버튼을 누르면 이 숫자가 올라가고, 그때마다 아래 effect가 다시 돈다.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error: selectError } = await supabase
        .from(inquiriesTable)
        .select("id, name, email, message, created_at")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (selectError) {
        console.error("신청 목록을 불러오지 못했습니다", selectError);
        setError("목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
        setRows([]);
        return;
      }
      setError("");
      setRows(data ?? []);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <div className="mx-auto w-full max-w-[940px] px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold tracking-[-0.5px] text-[#191919] min-[992px]:text-[24px]">
            상담 신청 목록
          </h1>
          <p className="mt-1 text-[14px] text-[#5f6368]">
            {session.user.email} 님으로 로그인 · 최신순
            {rows && ` · 총 ${rows.length}건`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="h-[40px] rounded-[4px] border border-[#d1d5db] bg-white px-4 text-[14px] font-semibold text-[#191919] transition-transform duration-200 hover:scale-[1.01]"
          >
            새로고침
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="h-[40px] rounded-[4px] bg-[#191919] px-4 text-[14px] font-semibold text-white transition-transform duration-200 hover:scale-[1.01]"
          >
            로그아웃
          </button>
        </div>
      </div>

      {error && <p className="mt-6 text-[14px] font-semibold text-[#c9412f]">{error}</p>}

      {rows === null && <p className="mt-10 text-center text-[15px] text-[#5f6368]">불러오는 중…</p>}

      {rows !== null && rows.length === 0 && !error && (
        <p className="mt-10 text-center text-[15px] text-[#5f6368]">아직 들어온 신청이 없습니다.</p>
      )}

      {rows !== null && rows.length > 0 && (
        <ul className="mt-6 space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="rounded-[10px] bg-white p-5 shadow-[0_1px_14px_1px_rgba(0,0,0,0.11)]">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[16px] font-bold text-[#191919]">{row.name}</p>
                <p className="text-[13px] text-[#5f6368]">{formatDateTime(row.created_at)}</p>
              </div>
              <p className="mt-1 text-[14px] text-[#5f6368]">
                <a href={`mailto:${row.email}`} className="underline decoration-[#fd715b] decoration-2 underline-offset-4">
                  {row.email}
                </a>
              </p>
              <p className="mt-3 text-[15px] leading-[24px] whitespace-pre-wrap text-[#191919]">{row.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-[#f9fafb] px-5 pb-16">
      {checking ? (
        <p className="pt-20 text-center text-[15px] text-[#5f6368]">확인 중…</p>
      ) : session ? (
        <InquiryList session={session} onSignOut={() => void supabase.auth.signOut()} />
      ) : (
        <LoginForm onDone={() => undefined} />
      )}
    </main>
  );
}
