-- 「새 상담 신청이 있는지」만 알려 주는 함수 · Supabase SQL Editor에서 한 번 실행합니다. (프로젝트 ykwhdegzqcgtwynedxqv)
--
-- 왜 만드나
--   매일 아침 돌아가는 Claude Code 루틴이 새 상담 신청이 있는지 확인하려면 cab_inquiries 를 읽어야 한다.
--   그런데 방문자용 키로는 저장된 신청을 읽을 수 없고(일부러 그렇게 만들었다), 서비스 키를 클라우드 루틴에
--   넣으면 데이터베이스 전체를 넘겨주는 셈이 된다. 게다가 신청 내용은 방문자가 쓴 글이라, 그 글을 AI 가
--   전체 권한 키를 든 채로 읽게 하는 것은 피한다.
--
-- 하는 일
--   기준 시각 뒤에 들어온 신청이 「몇 건」인지와 「가장 최근 시각」만 돌려준다.
--   이름 · 이메일 · 내용은 돌려주지 않는다. 내용은 대표가 /admin 에서 로그인하고 본다.
--   방문자용 키로 부를 수 있다. 그래서 루틴에는 이미 공개된 두 값(프로젝트 주소, 방문자용 키)만 넣으면 된다.
--
-- 알아 둘 것
--   방문자용 키는 홈페이지에 공개돼 있으므로, 마음먹으면 누구나 「최근 신청 건수」는 알 수 있게 된다.
--   31일보다 오래된 기록은 세지 않는다.

begin;

create function public.cab_new_inquiry_count(since timestamptz)
returns table (new_count integer, latest_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer, max(created_at)
  from public.cab_inquiries
  where created_at > greatest(since, now() - interval '31 days');
$$;

revoke all on function public.cab_new_inquiry_count(timestamptz) from public;
grant execute on function public.cab_new_inquiry_count(timestamptz) to anon, authenticated;

commit;

-- 실행 후 확인용 (최근 하루 동안의 건수):
--   select * from public.cab_new_inquiry_count(now() - interval '1 day');
