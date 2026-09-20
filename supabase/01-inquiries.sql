-- CAB 1주차 · 새 Supabase 수업 프로젝트에서 한 번 실행합니다.
-- 방문자는 신청을 추가할 수 있고, 기존 신청은 조회·변경·삭제할 수 없습니다.
begin;
create table public.cab_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 50),
  email text not null check (char_length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'),
  message text not null check (char_length(btrim(message)) between 10 and 1000),
  created_at timestamptz not null default now()
);
alter table public.cab_inquiries enable row level security;
revoke all on table public.cab_inquiries from anon, authenticated;
grant usage on schema public to anon;
grant insert (name, email, message) on public.cab_inquiries to anon;
create policy "visitors_can_submit" on public.cab_inquiries
  for insert to anon with check (true);
commit;
