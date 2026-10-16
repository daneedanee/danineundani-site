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
- **배포는 GitHub `main`에 올리면 자동으로 된다** (Vercel이 저장소와 연결돼 있다. 2026-10-11 확인). 고친 내용은 브랜치에서 작업해 `main`에 합치고 `git push` 한다.
- **이 폴더에서 `vercel --prod`로 직접 올리기 전에는 반드시 `git fetch`로 GitHub `main`과 같은지 본다.** 다른 곳(클라우드 세션의 PR 등)에서 `main`에 들어간 작업이 이 폴더에 없으면, 직접 올리는 순간 그 작업이 운영 사이트에서 빠진다. 2026-10-11에 쇼츠 편집기(`/studio`)가 그렇게 내려갔다가 합치면서 복구됐다.
- 스타일(`globals.css`)을 고친 배포에서 Vercel이 옛 스타일을 그대로 쓴 일이 있었다(2026-10-11, 유튜브 띠의 흐르는 효과가 운영에서만 빠짐). 그럴 때는 `vercel --prod --force`로 캐시 없이 다시 올린다. 올린 뒤에는 운영 사이트에서 직접 확인한다.
- **검색 노출 열림 (대표 결정, 2026-10-16)**: Vercel Production 환경 변수 `NEXT_PUBLIC_ALLOW_INDEXING=true`. 여닫는 자리는 `src/lib/seo.ts` 하나다(`layout.tsx`·`robots.ts`·`sitemap.ts`가 읽는다). 다시 닫으려면 그 변수를 지우고 재배포한다. 연 뒤 남은 일(서치 콘솔·서치어드바이저 등록, vercel.app 주소 넘기기, Supabase 회원가입 닫기, 요금제)은 `docs/superpowers/specs/2026-10-07-notes-board-design.md` 9·11장.
- **게시판 (2026-10-07)**: 공개 주소 `/notes`, 글쓰기 `/admin/notes`. 글은 Supabase 표 `cab_posts`(`supabase/05-posts.sql`), 이미지는 보관함 `cab-post-images`. 방문자는 발행한 글만 읽고 쓰기는 관리자 이메일만 한다. 발행하면 재배포 없이 바로 반영된다(`/api/notes/revalidate`). 한 번 발행한 글의 주소는 바꿀 수 없다. 상단 메뉴 이름은 「칼럼」(대표 결정, 2026-10-08). 게시판 제목·돌아가기 링크도 「칼럼」에 맞췄다(`site-content.ts`의 `notes`).
- `/admin`에는 비밀번호 재설정 화면이 없다. 복구 메일 링크를 눌러도 홈만 열린다 (2026-10-08 확인). 비밀번호는 Supabase SQL Editor에서 바꾼다.
- `docs/` 폴더는 저장소에 올리지 않는다 (내부 문서). 작업 기록은 `docs/2주차-완료.md`를 본다.

## 쇼츠 편집기 `/studio` (2026-09-28 추가)

- **운영 사이트에는 올리지 않는다 (대표 결정, 2026-10-11).** `.vercelignore`가 `src/app/studio`와 `src/app/api/studio`를 뺀다. 쓸 때는 이 폴더에서 `npm run dev`를 띄우고 <http://localhost:3000/studio>로 들어간다. 다시 올리기로 하면 `.vercelignore`의 두 줄을 지운다.

- 대표 개인용 도구. 롱폼 영상을 넣으면 소리가 크게 터지는 구간을 골라 주고, 디자인 양식에 맞춰 헤드·바닥 문구, 자막, 효과음을 넣어 세로(1080×1920) 영상으로 저장한다. 홈페이지 메뉴에는 연결하지 않았고 검색에서도 제외한다.
- 영상은 브라우저 안에서만 다룬다 (서버·Supabase로 올리지 않음). 컴퓨터의 최신 크롬·엣지 기준.
- 구간 고르기 기준은 셋이다 (2026-10-04).
  - **Claude 채팅에 붙여넣기 (기본, 사용료 없음)**: "AI에게 보낼 글 복사"로 대본+기준+답 형식을 복사해 대표의 Claude 채팅에 붙여 넣고, 받은 답(`3:21 ~ 4:05 | 후킹 | 첫 줄 / 둘째 줄 | 이유`)을 편집기에 붙여 넣는다. "쇼츠 1 …" 줄 아래에 시각 줄(`00:36 ~ 00:43`)이 여러 개 있으면 그 컷들을 차례로 이어붙여 클립 하나로 만든다 (2026-10-04, 대표가 쓰는 표 모양 그대로 읽음). 글 만들기·읽기는 `src/lib/studio/ai-picks.ts`의 `buildChatPrompt`, `parsePastedPicks`.
  - **AI 자동 (사용료)**: SRT·VTT 자막을 서버(`src/app/api/studio/pick/route.ts`)로 보내 Claude(`claude-opus-5-5`)가 중요한 구간·후킹 구간을 고르고 헤드 문구를 제안한다. 영상은 보내지 않고 자막 글자만 보낸다. Vercel 환경 변수 `ANTHROPIC_API_KEY`가 필요하고, 부를 때마다 사용료가 든다. 관리자 로그인(/admin과 같은 계정, `src/lib/studio/ai-picks.ts`의 이메일)이 있어야 쓸 수 있다.
  - **소리 크기**: 브라우저 안에서 소리가 크게 터지는 구간을 고른다. 인터넷·사용료 없음.
- 자막은 SRT·VTT 파일에서 클립 구간만큼 자동으로 들어간다. 편집기에서는 줄마다 글자·시간만 고친다 (한 줄씩 붙여 넣는 칸과 스페이스바 타이밍 맞추기는 2026-10-04 대표 요청으로 뺐다). 자동 받아쓰기는 없다.
- 기본 양식은 "다니 채널 숏츠" (유튜브 @다니는다니 숏츠 모양: 노란 제목 두 줄, 검정 상자 자막, 아래 '다니는다니 블로그마케팅'). 2026-09-28 대표가 보낸 캡처 기준.
- "미드폼 (자막 박힌 완성본)" 양식 (2026-10-04): 클린본 없이 자막이 박힌 가로 완성본용. 영상을 가로폭 150%로 키워 거의 정사각형으로 넣고, 아래 15%를 잘라 박힌 자막을 가린 뒤 SRT 자막을 새로 얹는다. 클립마다 확대·아래 자르기를 바꿀 수 있고 (자막 위치 조절과 미리보기의 회색 '자막 자리' 표시는 2026-10-04 대표 요청으로 뺐다) "모든 클립에 적용"으로 한 번에 맞춘다.
- 디자인 양식(색·글자 크기·위치): `src/lib/studio/templates.ts` · 효과음: `src/lib/studio/sfx.ts` (소리를 코드로 만들어서 음원 파일 없음)
- 컷 이어붙이기: 클립의 `segments`(원본 기준 컷 목록). 시간 계산은 `src/lib/studio/segments.ts`. 자막·효과음 시간은 이어붙인 뒤 기준이다. 저장할 때는 컷을 넘어갈 때 녹화를 잠깐 멈췄다가 이어서 녹화한다. 저장 중 탭이 가려지면(다른 탭·창 내림·다른 창이 덮음) 크롬이 화면 그리기를 멈춰 '화면 멈춤 + 소리만' 영상이 되던 문제가 있어서(2026-10-04), 가려지면 영상·녹화·효과음 시계를 함께 멈췄다가 돌아오면 이어서 녹화한다. 화면은 requestVideoFrameCallback 대신 1/30초 타이머로 그린다.
- 구간 고르는 규칙: `src/lib/studio/highlights.ts` · 화면 그리기(미리보기와 저장 공용): `src/lib/studio/render.ts`
- 화면 부품: `src/components/studio/` · 쇼츠 글꼴: Black Han Sans, Noto Sans KR (구글 폰트, OFL, `src/app/studio/fonts.ts`)

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
- 상담 신청 건수 주소: `src/app/api/inquiry-count/route.ts` — `/api/inquiry-count?hours=24`(또는 `168`)가 건수와 가장 최근 시각만 돌려준다. 이름·이메일·내용은 돌려주지 않는다. 건수는 데이터베이스 함수(`supabase/06-new-inquiry-count.sql`)가 센다 (2026-10-11)
- 매일 아침 상담 신청 확인 루틴: Claude Code 클라우드 루틴 「랜딩페이지 상담문의 수집」이 매일 오전 8:07(한국 시간)에 위 주소를 불러 새 신청 건수를 보고한다. 지시서는 `routines/inquiry-check.md`. 루틴에는 키·커넥터·쓰기 도구가 없다. 지시서를 고치면 `main`에 올려야 루틴이 새 내용을 읽는다. 관리는 <https://claude.ai/code/routines>
- 끼워 넣은 신청 페이지: `/letter`(다니레터, 스티비 구독 페이지)와 `/agency`(블로그 대행, 네이버 폼)는 바깥 페이지를 상단 메뉴 아래에 끼워 보여 준다 (`src/components/embed/embed-page.tsx`, 2026-10-11). 상대 사이트가 끼워 넣기를 막으면 빈 화면이 되므로 「새 창에서 열기」 링크를 함께 둔다. 결제가 들어가는 래피드 페이지는 끼워 넣지 않는다
- 이전 버전(밝은 배경) 컴포넌트: `src/components/site/` — 현재 사용하지 않음 (`consult-form.tsx`는 저장 연결 전 상태 그대로다)

---

@AGENTS.md
