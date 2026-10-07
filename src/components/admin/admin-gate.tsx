"use client";

// 로그인한 사람에게만 안쪽 화면을 보여 준다. 로그인은 /admin 에서 한다.
// 누가 무엇을 볼 수 있는지는 이 화면이 아니라 데이터베이스 권한이 정한다.
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export function AdminGate({ children }: { children: (session: Session) => React.ReactNode }) {
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

  if (checking) {
    return <p className="pt-20 text-center text-[15px] text-[#5f6368]">확인 중…</p>;
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
