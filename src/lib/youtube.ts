// 유튜브 채널의 최근 영상 목록. 열쇠(API key) 없이 공개 피드(RSS)를 읽는다.
// 재생목록 ID 앞머리를 UULF 로 쓰면 쇼츠와 라이브를 뺀 일반 영상만 나온다 (최근 15편).

export type YoutubeVideo = { id: string; title: string; published: string };

export function longVideosFeedUrl(channelId: string): string {
  return `https://www.youtube.com/feeds/videos.xml?playlist_id=UULF${channelId.slice(2)}`;
}

const entities: Record<string, string> = { "&quot;": '"', "&apos;": "'", "&#39;": "'", "&lt;": "<", "&gt;": ">", "&amp;": "&" };

function decode(text: string): string {
  return text.replace(/&(?:quot|apos|#39|lt|gt|amp);/g, (m) => entities[m]);
}

export function parseVideoFeed(xml: string): YoutubeVideo[] {
  const videos: YoutubeVideo[] = [];
  for (const [, entry] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const id = entry.match(/<yt:videoId>([^<]*)<\/yt:videoId>/)?.[1] ?? "";
    // 이 값은 영상 주소와 썸네일 경로에 그대로 들어간다. 유튜브 영상 ID 꼴(11자)일 때만 받는다.
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) continue;
    videos.push({
      id,
      title: decode(entry.match(/<title>([^<]*)<\/title>/)?.[1] ?? "").trim(),
      published: entry.match(/<published>([^<]*)<\/published>/)?.[1] ?? "",
    });
  }
  return videos;
}
