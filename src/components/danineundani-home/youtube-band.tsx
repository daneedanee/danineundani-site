import Image from "next/image";

import { youtube } from "@/lib/site-content";
import { longVideosFeedUrl, parseVideoFeed, type YoutubeVideo } from "@/lib/youtube";

// 유튜브 영상 띠: @다니는다니 채널의 최근 일반 영상(쇼츠 제외)이 옆으로 흐른다. 누르면 그 영상으로 간다.
// 목록은 유튜브 공개 피드에서 읽고 6시간마다 새로 받는다. 새 영상을 올리면 다시 배포하지 않아도 들어온다.

// 피드를 못 읽었을 때 보여 줄 영상 (2026-10-11 기준 최근 4편). 띠가 비는 일은 없게 한다.
const fallback: YoutubeVideo[] = [
  { id: "1-NewNDAiXs", title: "블로그 열심히 하는데 문의가 없다면, 딱 한 가지만 먼저 확인하세요", published: "2026-10-08" },
  { id: "rl3H0FDf6N8", title: '"아직도 블로그 먹히나요?" 글 100개 넘게 쌓아두고 문의 없는 블로그', published: "2026-10-02" },
  { id: "2DbrjOTtRcQ", title: "이걸 아는 사람들은, 지금도 네이버블로그로 문의 받고 있어요", published: "2026-09-23" },
  { id: "pqkKYzr1Pl0", title: "블로그 방문자 줄고 문의까지 끊겼다면, 매출 만들던 키워드부터 되찾으세요", published: "2026-09-17" },
];

const maxVideos = 10;

async function recentVideos(): Promise<YoutubeVideo[]> {
  try {
    const response = await fetch(longVideosFeedUrl(youtube.channelId), { next: { revalidate: 21600 } });
    if (!response.ok) return fallback;
    const videos = parseVideoFeed(await response.text()).slice(0, maxVideos);
    // 너무 적으면 띠가 화면을 못 채워 흐르는 효과가 끊겨 보인다.
    return videos.length >= fallback.length ? videos : fallback;
  } catch {
    return fallback;
  }
}

function VideoList({ videos, hidden }: { videos: YoutubeVideo[]; hidden?: boolean }) {
  return (
    // 흐르는 효과가 이어지도록 같은 목록을 두 번 그린다. 둘째는 화면 읽기 프로그램과 탭 이동에서 뺀다.
    <ul aria-hidden={hidden} className="flex shrink-0 gap-4 pr-4">
      {videos.map((video) => (
        <li key={video.id} className="w-[240px] shrink-0 min-[992px]:w-[300px]">
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={hidden ? -1 : undefined}
            className="group block"
          >
            <span className="block overflow-hidden rounded-[8px] border-[1.5px] border-white/10 transition-transform duration-200 group-hover:-translate-y-0.5">
              <Image
                src={`https://i.ytimg.com/vi/${video.id}/hq720.jpg`}
                alt=""
                width={640}
                height={360}
                sizes="(min-width: 992px) 300px, 240px"
                // 띠가 옆으로 흘러 들어오므로 미리 받아 둔다. 늦게 받으면 빈 칸이 흘러 들어올 수 있다.
                loading="eager"
                className="aspect-video h-auto w-full object-cover"
              />
            </span>
            <span className="mt-2.5 line-clamp-2 text-[13px] leading-5 text-white/80 group-hover:text-white">
              {video.title}
            </span>
            <span className="sr-only">(유튜브, 새 탭에서 열림)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export async function YoutubeBand() {
  const videos = await recentVideos();

  return (
    <section aria-label="다니는다니 유튜브 최근 영상" className="youtube-band overflow-hidden bg-[#111] py-12 min-[992px]:py-16">
      <div className="youtube-track flex w-max">
        <VideoList videos={videos} />
        <VideoList videos={videos} hidden />
      </div>
    </section>
  );
}
