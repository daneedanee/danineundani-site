"use client";

// 로그인한 사람에게만 안쪽 화면을 보여 준다. 로그인은 /admin 에서 한다.
// 누가 무엇을 볼 수 있는지는 이 화면이 아니라 데이터베이스 권한이 정한다.
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export function AdminGate({ children }: { children: (session: Session) => React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  // 마지막으로 확인된 로그인. 로그인이 풀려도 안쪽 화면을 내리지 않으려고 따로 들고 있는다.
  const [lastSession, setLastSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) setLastSession(data.session);
      setChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) setLastSession(next);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (checking) {
    return <p className="pt-20 text-center text-[15px] text-[#5f6368]">확인 중…</p>;
  }
  // 쓰던 중에 로그인이 풀린 경우(다른 탭에서 로그아웃, 절전 뒤 만료 등).
  // 화면을 로그인 안내로 바꾸면 쓰던 글이 사라진다. 그대로 두고 위에 안내만 띄운다.
  // 다른 탭에서 다시 로그인하면 이 탭도 같이 로그인된다.
  if (!session && lastSession) {
    return (
      <>
        <p role="alert" className="sticky top-0 z-10 bg-[#c9412f] px-5 py-3 text-center text-[14px] font-semibold text-white">
          로그인이 풀렸습니다. 쓰던 내용은 그대로 있습니다.{" "}
          <Link href="/admin" target="_blank" className="underline underline-offset-4">
            새 탭에서 다시 로그인
          </Link>
          한 뒤 이 화면으로 돌아와 저장해 주세요.
        </p>
        {children(lastSession)}
      </>
    );
  }
  if (!session) {
    return (
      <p className="pt-20 text-center text-[15px] text-[#5f6368]">
        <Link href="/admin" className="underline decoration-[#fd715b] decoration-2 underline-offset-4">
          관리자 화면
        </Link>
        에서 먼저 로그인해 주세요.
      </p>
    );
  }
  return <>{children(session)}</>;
}
