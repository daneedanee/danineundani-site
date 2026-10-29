// 글을 발행하거나 고치면 네이버에 바로 알린다 (IndexNow, 2026-10-29 대표 요청).
// 사이트맵만 두면 검색 로봇이 다시 읽을 때까지 새 글을 모른다. 새 사이트는 그 간격이 길다.
// 네이버가 받은 주소는 IndexNow 약속에 따라 빙 같은 다른 참여 검색엔진에도 나눠 준다. 구글은 IndexNow 를 받지 않는다.
// 안내: https://searchadvisor.naver.com/guide/indexnow-request
import { absoluteUrl, siteUrl } from "./seo.ts";
import { BLOG_PATH, postPath } from "./notes/paths.ts";
import { hubPath, isPillarKey } from "./notes/topics.ts";
import type { PostRef } from "./notes/types";

// 이 사이트의 주인임을 보이는 값. 같은 값을 담은 public/<키>.txt 를 네이버가 읽어 확인한다. 숨길 값이 아니다.
export const INDEXNOW_KEY = "7eb93776aee880a4ad620c3f86a997d8";
export const INDEXNOW_ENDPOINT = "https://searchadvisor.naver.com/indexnow";

// 새로 고침 API 는 어떤 글이 바뀌었는지 받지 않는다(대시보드 "홈페이지로 보내기"도 같은 API 를 부른다).
// 그래서 방금 고친 발행 글을 수정 시각으로 찾는다. 발행 직후에 부르므로 10분이면 넉넉하다.
const RECENT_MS = 10 * 60 * 1000;

// 발행을 내리거나 지운 글은 목록에 없어서 알리지 않는다. 검색 로봇이 다시 와서 없어진 걸 알게 된다.
export function changedUrls(posts: PostRef[], now: Date, base: string = siteUrl): string[] {
  const recent = posts.filter((post) => now.getTime() - new Date(post.updated_at).getTime() <= RECENT_MS);
  if (recent.length === 0) return [];
  const hubs = new Set(recent.map((post) => post.pillar).filter(isPillarKey));
  return [
    ...recent.map((post) => absoluteUrl(postPath(post.slug), base)),
    absoluteUrl(BLOG_PATH, base),
    ...[...hubs].map((key) => absoluteUrl(hubPath(key), base)),
  ];
}

export function indexNowBody(urls: string[], base: string = siteUrl, key: string = INDEXNOW_KEY) {
  return {
    host: new URL(base).host,
    key,
    keyLocation: absoluteUrl(`/${key}.txt`, base),
    urlList: urls,
  };
}

// 200 은 받음, 202 는 받고 키를 확인하는 중. 403 은 키 파일이 안 맞음, 422 는 주소가 이 도메인이 아님, 429 는 너무 자주 보냄.
export async function notifyIndexNow(
  urls: string[],
  fetchImpl: typeof fetch = fetch,
  base: string = siteUrl,
  key: string = INDEXNOW_KEY,
): Promise<{ sent: number; status: number | null }> {
  if (urls.length === 0) return { sent: 0, status: null };
  const response = await fetchImpl(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(indexNowBody(urls, base, key)),
    // 네이버가 늦어도 관리 화면이 오래 기다리지 않게 한다.
    signal: AbortSignal.timeout(5000),
  });
  return { sent: urls.length, status: response.status };
}
