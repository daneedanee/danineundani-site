-- 방문·클릭 측정 한 줄을 기록하는 함수 · Supabase SQL Editor에서 한 번 실행합니다. (프로젝트 ykwhdegzqcgtwynedxqv)
-- 08-visibility-events.sql 로 표를 만든 뒤에 실행한다.
--
-- 왜 만드나
--   처음 설계는 서버에 데이터베이스 전체 권한을 가진 서비스 키(SUPABASE_SERVICE_ROLE_KEY)를 두고 표에 바로 쓰는 방식이었다.
--   상담 건수 주소(06-new-inquiry-count.sql)와 같은 까닭으로 그 키를 두지 않는다. 대신 이 함수 하나만
--   방문자용 공개 키로 부를 수 있게 연다 (2026-10-26).
--
-- 하는 일
--   이벤트 이름·경로·캠페인 세 값을 받아 cab_visibility_events 에 한 줄 넣는다. 다른 것은 하지 않는다.
--   허용되지 않은 값은 표의 check 조건이 막는다. 표를 읽거나 고치거나 지울 수는 없다.
--
-- 알아 둘 것
--   공개 키는 홈페이지에 공개돼 있으므로, 마음먹으면 누구나 이 함수로 허용된 값의 기록을 늘릴 수 있다.
--   서버 주소(/api/visibility/event)의 출처 검사도 브라우저가 아니면 속일 수 있어서 이전 설계와 위험은 같다.
--   그래서 측정 기록은 결제·검증된 문의 건수로 보지 않는다.

begin;

create or replace function public.cab_record_visibility_event(p_event text, p_path text, p_campaign text)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.cab_visibility_events (event, path, campaign) values (p_event, p_path, p_campaign);
$$;

revoke all on function public.cab_record_visibility_event(text, text, text) from public, anon, authenticated;
grant execute on function public.cab_record_visibility_event(text, text, text) to anon;

commit;

-- 실행 후 확인용 (기록은 남기지 않음):
--   select has_function_privilege('anon', 'public.cab_record_visibility_event(text, text, text)', 'execute') as anon_ok,
--          has_function_privilege('authenticated', 'public.cab_record_visibility_event(text, text, text)', 'execute') as logged_in;
