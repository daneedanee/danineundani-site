-- 상담 내용 최소 글자 수 제한 없애기 (2026-09-20 대표 결정)
-- Supabase SQL Editor에서 한 번 실행합니다.
--
-- 바뀌는 것: 상담 내용이 10자 미만이어도 저장된다.
-- 그대로인 것: 비어 있으면 여전히 저장되지 않는다. 최대 1000자 제한도 그대로 둔다.

begin;

-- message에 걸린 기존 검사 규칙을 이름과 상관없이 찾아서 지운다.
do $$
declare c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.cab_inquiries'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%message%'
  loop
    execute format('alter table public.cab_inquiries drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.cab_inquiries
  add constraint cab_inquiries_message_check
  check (char_length(btrim(message)) between 1 and 1000);

commit;
