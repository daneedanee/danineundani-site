"use client";

// 칼럼 페이지의 「글쓰기」 버튼. 관리자 화면에 로그인해 있는 사람에게만 보인다.
// 페이지 자체는 서버에서 미리 만들어 두는 것이라(방문자·검색 로봇이 받는 HTML) 거기에는 이 버튼이 없다.
// 브라우저에서 로그인 여부를 확인한 뒤에만 나타난다.
// 보이는 것만 가릴 뿐이다. 실제로 글을 쓸 수 있는지는 데이터베이스 권한(supabase/05-posts.sql)이 정한다.
import Link from "next/link";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export function AdminWriteLink() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setLoggedIn(Boolean(data.session)));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session));
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!loggedIn) return null;

  return (
    <Link
      href="/admin/notes?new=1"
      className="inline-flex h-10 shrink-0 items-center rounded-[4px] bg-[#fd715b] px-4 text-[14px] font-bold text-[#2b2421] shadow-[0_5px_14px_rgba(165,78,56,0.15)]"
    >
      글쓰기
    </Link>
  );
}
