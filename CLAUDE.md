# my-business-site · 다니는다니 홈페이지

## 지금 `/` 페이지 (2026-09-13 대표 결정)

- 셀피쉬클럽(https://www.selfishclub.xyz/)의 **배치와 분위기만** 참고하고, 문구·색·로고는 다니는다니 것으로 만든 페이지다. 복제본 코드·원본 자산은 2026-09-14 삭제했다. 참고 사이트의 문구·이미지·글꼴 파일을 다시 가져오지 않는다.
- 색: 검정 + 코랄. 자료가 없는 구역(AI 툴, EVENT, 보도자료, 파트너사, 사진 띠)은 뺐다.
- 공개 문구와 링크는 `src/lib/site-content.ts`에만 둔다. 대표가 확인한 문구(`docs/홈페이지-기획.md` 5장)만 쓰고, 바꾸거나 새로 쓰려면 먼저 대표에게 묻는다.
- 자료가 없는 사례·후기·실적은 만들지 않는다.
- 상담 신청 양식은 **Supabase에 저장된다** (2026-09-20 연결). 표는 `supabase/01-inquiries.sql`의 `cab_inquiries`, 연결 코드는 `src/lib/supabase.ts`다. 방문자는 추가만 할 수 있고 저장된 신청을 읽거나 지울 수 없다. 쌓인 신청은 Supabase 대시보드에서 본다.
- **Supabase 프로젝트는 두 개가 있다. 쓰는 것은 `ykwhdegzqcgtwynedxqv` 하나뿐이다.** 대시보드에서 신청 내용을 볼 때는 주소창의 프로젝트 번호가 이것과 같은지 먼저 확인한다. 다른 프로젝트를 열면 표가 비어 보인다. 기준은 언제나 `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL`이다.
- 주소와 키는 `.env.local`에 있고 git에 올리지 않는다. 배포할 때는 배포 서비스의 환경 변수에 같은 두 값을 넣어야 한다.
- **배포됨 (2026-09-20)**: <https://danineundani-site.vercel.app> · 저장소 <https://github.com/daneedanee/danineundani-site>
- **도메인 연결됨 (2026-10-07)**: 대표 주소는 <https://www.daneedanee.com>. `daneedanee.com`은 `www`로 308 넘긴다(Vercel 프로젝트 도메인 설정). DNS는 가비아 DNS 관리에 있다 — A `@` → `216.198.79.1`, `64.29.17.1` / CNAME `www` → `0755e30c17ea3c63.vercel-dns-017.com.` 네임서버는 가비아 그대로다.
- 인스타그램·스레드 화면(`/admin/social`, `/api/social`)은 배포에 올리지 않는다 (대표 결정, 2026-10-09). `.vercelignore`가 빼고, `/admin`의 링크는 개발 서버에서만 보인다. 올리기로 하면 `.vercelignore`의 두 줄을 지우고 토큰을 Vercel 환경 변수에 넣는다.
- 고친 내용을 반영하려면 이 폴더에서 `vercel --prod`를 실행한다. `globals.css`를 고친 배포에서는 Vercel이 옛 스타일을 그대로 쓴 일이 있었다(2026-10-11, 유튜브 띠의 흐르는 효과가 운영에서만 빠짐). 스타일을 고쳤으면 `vercel --prod --force`로 올리고, 올린 뒤 운영 사이트에서 직접 확인한다. Vercel과 GitHub이 아직 연결되지 않아 `git push`만으로는 반영되지 않는다.
- 검색 노출은 계속 차단한다. 여닫는 자리는 `src/lib/seo.ts` 하나다(`layout.tsx`·`robots.ts`·`sitemap.ts`가 읽는다). 여는 방법은 Vercel 환경 변수 `NEXT_PUBLIC_ALLOW_INDEXING=true` + 재배포이고, 대표가 열라고 할 때까지 넣지 않는다. 여는 날 할 일은 `docs/superpowers/specs/2026-10-07-notes-board-design.md` 11장.
- **게시판 (2026-10-07)**: 공개 주소 `/notes`, 글쓰기 `/admin/notes`. 글은 Supabase 표 `cab_posts`(`supabase/05-posts.sql`), 이미지는 보관함 `cab-post-images`. 방문자는 발행한 글만 읽고 쓰기는 관리자 이메일만 한다. 발행하면 재배포 없이 바로 반영된다(`/api/notes/revalidate`). 한 번 발행한 글의 주소는 바꿀 수 없다. 상단 메뉴 이름은 「칼럼」(대표 결정, 2026-10-08). 게시판 제목·돌아가기 링크도 「칼럼」에 맞췄다(`site-content.ts`의 `notes`).
- `/admin`에는 비밀번호 재설정 화면이 없다. 복구 메일 링크를 눌러도 홈만 열린다 (2026-10-08 확인). 비밀번호는 Supabase SQL Editor에서 바꾼다.
- `docs/` 폴더는 저장소에 올리지 않는다 (내부 문서). 작업 기록은 `docs/2주차-완료.md`를 본다.

## 실행 방법

- 준비: Node.js 24 이상 (`node --version`), 이 폴더에서 `npm install` 한 번
- 개발 서버: `npm run dev` → 터미널에 나온 `Local:` 주소를 브라우저로 연다 (기본 http://localhost:3000, 사용 중이면 다른 포트)
- 서버 끄기: 개발 서버를 실행한 터미널에서 `Ctrl + C`
- 점검: `npm run check` (lint + 타입 검사 + 빌드)
- 시험: `npm test`

## 코드 위치

- 페이지 구역 순서: `src/app/page.tsx`
- 구역 컴포넌트: `src/components/danineundani-home/` (상단 바, 첫 화면, 고민, 서비스, 시작 순서, 사례, 상담 신청, 푸터)
- 공개 문구·링크·푸터 사업자 정보: `src/lib/site-content.ts` (주민등록번호·발급번호는 넣지 않는다)
- 탭 아이콘: `src/app/icon.svg` (로고 파일 없음, 글자 로고 사용)
- 글꼴: 고운돋움. `src/app/layout.tsx`에서 `next/font/google`로 불러오고 `src/app/globals.css`의 `--font-sans`가 가리킨다. 구글 폰트의 무료 글꼴(OFL)이라 써도 된다. 빌드할 때 내려받아 우리 사이트에서 직접 내주며, 방문자는 화면에 나온 글자가 든 조각만 받는다 (2026-10-07, 7.2MB ttf를 대신함. 홈 기준 약 217KB). 참고 사이트에서 받은 글꼴 파일은 쓰지 않는다.
- 이미지: `public/images/danineundani/` (출처는 `docs/홈페이지-기획.md` 9장)
- 화면 확인 캡처: `docs/captures/after-1440.png`, `docs/captures/after-390.png`
- 상담 신청 저장 연결: `src/lib/supabase.ts`, 저장하는 곳은 `src/components/danineundani-home/consult-section.tsx`
- 저장되는 화면 캡처: `docs/captures/consult-saved-1440.png`
- 게시판: 공개 페이지 `src/app/notes/`, 화면 조각 `src/components/notes/`, 글 다루는 함수와 시험 `src/lib/notes/`, 관리 화면 `src/app/admin/notes/` · `src/components/admin/`
- 시험: `npm test` (Node 내장 시험 도구). 시험이 불러오는 파일은 `.ts`로 쓰고 상대 import에 `.ts`를 붙인다
- 홈의 유튜브 영상 띠: `src/components/danineundani-home/youtube-band.tsx`. 채널의 최근 일반 영상(쇼츠 제외) 10편을 유튜브 공개 피드에서 읽어 옆으로 흘린다(`src/lib/youtube.ts`, 6시간마다 갱신). 피드를 못 읽으면 파일에 적어 둔 4편을 보여 준다 (2026-10-11)
- 이전 버전(밝은 배경) 컴포넌트: `src/components/site/` — 현재 사용하지 않음 (`consult-form.tsx`는 저장 연결 전 상태 그대로다)

---

@AGENTS.md
