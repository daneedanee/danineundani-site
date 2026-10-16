-- 칼럼 기둥·가지(/notes/topic/…)용 · Supabase SQL Editor에서 한 번 실행합니다.
-- 코드를 배포하기 전에 먼저 돌릴 것 (코드가 pillar, branch 칸을 읽는다).
--
-- 하는 일
--   1) cab_posts 에 pillar(기둥, 둘 중 하나 또는 비움), branch(가지, 1~40자 또는 비움) 칸을 더한다.
--   2) 글 주소 제약에 'topic' 금지를 더한다. (/notes/topic/… 허브와 겹치지 않게)
--   3) 기둥별 발행 글 목록용 색인을 만든다.

begin;

alter table public.cab_posts
  add column pillar text check (pillar is null or pillar in ('blog-marketing', 'small-business-marketing')),
  add column branch text check (branch is null or char_length(branch) between 1 and 40);

-- 기존 슬러그 제약 이름 확인용 (05-posts.sql 의 열 제약이라 보통 cab_posts_slug_check):
--   select conname from pg_constraint where conrelid = 'public.cab_posts'::regclass;
alter table public.cab_posts drop constraint cab_posts_slug_check;
alter table public.cab_posts add constraint cab_posts_slug_check check (
  char_length(slug) between 1 and 120
  and slug !~ '[[:space:]/?#%]'
  and slug <> 'page'
  and slug <> 'topic'
);

create index cab_posts_pillar_idx on public.cab_posts (pillar, published_at desc) where status = 'published';

commit;

-- 실행 후 확인용
--   select column_name from information_schema.columns where table_name = 'cab_posts' and column_name in ('pillar', 'branch');
