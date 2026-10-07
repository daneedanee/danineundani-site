-- 게시판(/notes)용 · Supabase SQL Editor에서 한 번 실행합니다. (프로젝트 ykwhdegzqcgtwynedxqv)
--
-- 하는 일
--   1) 글을 담는 표 cab_posts 를 만든다.
--   2) 방문자는 "발행한 글"만 읽을 수 있고, 쓰기·수정·삭제는 관리자 이메일만 할 수 있게 한다.
--      초안은 로그인하지 않은 사람에게 어떤 방법으로도 보이지 않는다.
--   3) 글 이미지를 담는 보관함 cab-post-images 를 만든다. 누구나 볼 수 있고 관리자만 올린다.
--
-- 관리자 이메일을 바꾸려면 아래 'marktive@naver.com' 네 군데를 고쳐서 정책 부분만 다시 실행한다.

begin;

create table public.cab_posts (
  id uuid primary key default gen_random_uuid(),
  -- 주소에 쓰는 이름. 꼴은 화면(src/lib/notes/slug.ts)이 엄격히 보고, 여기서는 주소를 깨는 글자만 막는다.
  slug text not null unique check (
    char_length(slug) between 1 and 120
    and slug !~ '[[:space:]/?#%]'
    and slug <> 'page'
  ),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  description text not null default '' check (char_length(description) <= 200),
  content_md text not null default '',
  cover_image_url text check (cover_image_url is null or cover_image_url ~ '^https://'),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- 발행하려면 설명과 본문이 있어야 한다. 초안은 비어도 된다.
  constraint cab_posts_publish_needs_text check (
    status = 'draft'
    or (char_length(btrim(description)) >= 1 and char_length(btrim(content_md)) >= 1)
  )
);

create index cab_posts_published_idx on public.cab_posts (published_at desc) where status = 'published';

-- 저장할 때마다 도는 함수.
--   · 수정 시각을 지금으로 맞춘다.
--   · 처음 발행할 때 발행 시각을 넣고, 그 뒤로는 바꾸지 못하게 한다.
--   · 한 번 발행한 글의 주소는 바꾸지 못하게 한다. 주소가 바뀌면 검색에 쌓인 것이 끊긴다.
create function public.cab_posts_before_write() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();

  if tg_op = 'UPDATE' and old.published_at is not null then
    if new.slug <> old.slug then
      raise exception '발행한 글의 주소는 바꿀 수 없습니다.';
    end if;
    new.published_at := old.published_at;
  end if;

  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;

  return new;
end;
$$;

create trigger cab_posts_before_write
  before insert or update on public.cab_posts
  for each row execute function public.cab_posts_before_write();

alter table public.cab_posts enable row level security;

revoke all on table public.cab_posts from anon, authenticated;
grant select on table public.cab_posts to anon, authenticated;
grant insert, update, delete on table public.cab_posts to authenticated;

-- 누구나: 발행한 글만 읽는다.
create policy "published_readable" on public.cab_posts
  for select to anon, authenticated
  using (status = 'published');

-- 관리자: 초안까지 전부 읽고 쓰고 고치고 지운다.
create policy "admin_all" on public.cab_posts
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'marktive@naver.com')
  with check ((auth.jwt() ->> 'email') = 'marktive@naver.com');

-- 글 이미지 보관함. 5MB 이하, 이미지 형식만.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cab-post-images',
  'cab-post-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "cab_post_images_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'cab-post-images' and (auth.jwt() ->> 'email') = 'marktive@naver.com');

create policy "cab_post_images_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'cab-post-images' and (auth.jwt() ->> 'email') = 'marktive@naver.com');

commit;

-- 실행 후 확인용
--   select count(*) from public.cab_posts;                         -- 0
--   select id, public from storage.buckets where id = 'cab-post-images';
