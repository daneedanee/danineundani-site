// 인스타그램 · 스레드 공식 API 호출부.
//
// 읽기(계정 정보·성과)와 쓰기(게시)를 파일 안에서 분명히 나눠 둔다.
// 게시 함수는 라우트에서 "대표가 확인함"을 확인한 뒤에만 부른다.
import { INSTAGRAM_GRAPH, THREADS_GRAPH, instagramAccount, threadsAccount } from "./config";

export class SocialError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail?: unknown,
  ) {
    super(message);
  }
}

async function call(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, cache: "no-store" });
  const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (!res.ok) {
    const error = body?.error as { message?: string } | undefined;
    throw new SocialError(error?.message ?? `요청이 실패했습니다 (HTTP ${res.status})`, res.status, body);
  }
  return body ?? {};
}

function query(base: string, params: Record<string, string>) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url.toString();
}

/* ---------------- 읽기 전용 ---------------- */

export type AccountSnapshot = {
  connected: boolean;
  profile?: Record<string, unknown>;
  insights?: Record<string, unknown>;
  error?: string;
};

export async function readInstagram(): Promise<AccountSnapshot> {
  const account = instagramAccount();
  if (!account) return { connected: false, error: "INSTAGRAM_USER_ID / INSTAGRAM_ACCESS_TOKEN 이 아직 없습니다." };

  try {
    const profile = await call(
      query(`${INSTAGRAM_GRAPH}/${account.userId}`, {
        fields: "id,username,name,account_type,media_count,followers_count,profile_picture_url",
        access_token: account.token,
      }),
    );

    // 성과 조회는 권한(instagram_business_manage_insights)이 없으면 실패한다.
    // 그래도 계정 정보 확인은 되도록, 여기서만 따로 감싼다.
    let insights: Record<string, unknown> | undefined;
    let insightsError: string | undefined;
    try {
      insights = await call(
        query(`${INSTAGRAM_GRAPH}/${account.userId}/insights`, {
          metric: "reach,follower_count,profile_views",
          period: "day",
          metric_type: "total_value",
          access_token: account.token,
        }),
      );
    } catch (error) {
      insightsError = error instanceof Error ? error.message : String(error);
    }

    return { connected: true, profile, insights, error: insightsError };
  } catch (error) {
    return { connected: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function readThreads(): Promise<AccountSnapshot> {
  const account = threadsAccount();
  if (!account) return { connected: false, error: "THREADS_USER_ID / THREADS_ACCESS_TOKEN 이 아직 없습니다." };

  try {
    const profile = await call(
      query(`${THREADS_GRAPH}/${account.userId}`, {
        fields: "id,username,name,threads_profile_picture_url,threads_biography",
        access_token: account.token,
      }),
    );

    let insights: Record<string, unknown> | undefined;
    let insightsError: string | undefined;
    try {
      insights = await call(
        query(`${THREADS_GRAPH}/${account.userId}/threads_insights`, {
          metric: "views,likes,replies,followers_count",
          access_token: account.token,
        }),
      );
    } catch (error) {
      insightsError = error instanceof Error ? error.message : String(error);
    }

    return { connected: true, profile, insights, error: insightsError };
  } catch (error) {
    return { connected: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/* ---------------- 쓰기 (대표 확인 뒤에만) ---------------- */

export type PublishResult = { target: "instagram" | "threads"; id: string; permalink?: string };

export async function publishInstagram(caption: string, imageUrl: string): Promise<PublishResult> {
  const account = instagramAccount();
  if (!account) throw new SocialError("인스타그램 토큰이 없습니다.", 400);

  // 1단계: 컨테이너 만들기
  const container = await call(`${INSTAGRAM_GRAPH}/${account.userId}/media`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ image_url: imageUrl, caption, access_token: account.token }),
  });
  const creationId = String(container.id ?? "");
  if (!creationId) throw new SocialError("인스타그램 컨테이너 생성에 실패했습니다.", 502, container);

  // 2단계: 실제 발행
  const published = await call(`${INSTAGRAM_GRAPH}/${account.userId}/media_publish`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ creation_id: creationId, access_token: account.token }),
  });
  const id = String(published.id ?? "");

  const detail = await call(
    query(`${INSTAGRAM_GRAPH}/${id}`, { fields: "permalink", access_token: account.token }),
  ).catch(() => ({}) as Record<string, unknown>);

  return { target: "instagram", id, permalink: detail.permalink as string | undefined };
}

export async function publishThreads(text: string, imageUrl?: string): Promise<PublishResult> {
  const account = threadsAccount();
  if (!account) throw new SocialError("스레드 토큰이 없습니다.", 400);

  const params = new URLSearchParams({
    media_type: imageUrl ? "IMAGE" : "TEXT",
    text,
    access_token: account.token,
  });
  if (imageUrl) params.set("image_url", imageUrl);

  const container = await call(`${THREADS_GRAPH}/${account.userId}/threads`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const creationId = String(container.id ?? "");
  if (!creationId) throw new SocialError("스레드 컨테이너 생성에 실패했습니다.", 502, container);

  const published = await call(`${THREADS_GRAPH}/${account.userId}/threads_publish`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ creation_id: creationId, access_token: account.token }),
  });
  const id = String(published.id ?? "");

  const detail = await call(
    query(`${THREADS_GRAPH}/${id}`, { fields: "permalink", access_token: account.token }),
  ).catch(() => ({}) as Record<string, unknown>);

  return { target: "threads", id, permalink: detail.permalink as string | undefined };
}
