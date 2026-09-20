import Image from "next/image";

// 유튜브 영상 띠: @다니는다니 채널 인기순 상위 4개 영상 (2026-09-14 기준)
const videos = [
  { id: "wdkvPzPRZ9U", title: "블로그 상위노출만으론 부족합니다 ㅣ AI 시대 블로그 글쓰기, 이렇게 바뀌었어요" },
  { id: "zQM30B1RoZM", title: "지금 네이버블로그 실시간으로 변하는 중입니다. (상위로직보다 중요한 1가지)" },
  { id: "G4nwzkut78Q", title: "이제 블로그 상위노출, 키워드로 안 됩니다 ㅣ 2026년 네이버가 직접 밝힌 블로그 글쓰기 5가지" },
  { id: "plQZPLnMHr8", title: "네이버 블로그, 지금 반드시 알아야 하는 4가지 (상위노출만 믿으면 안 되는 이유)" },
];

export function YoutubeBand() {
  return (
    <section aria-label="다니는다니 유튜브 인기 영상" className="bg-[#111] px-5 py-12 min-[992px]:py-16">
      <ul className="mx-auto grid max-w-[1200px] grid-cols-2 gap-2.5 min-[992px]:grid-cols-4 min-[992px]:gap-4">
        {videos.map((video) => (
          <li key={video.id}>
            <a
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-[8px] border-[1.5px] border-white/10 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <Image
                src={`/images/danineundani/real/youtube-${videos.indexOf(video) + 1}.jpg`}
                alt={`유튜브 영상: ${video.title}`}
                width={640}
                height={720}
                className="h-auto w-full"
              />
              <span className="sr-only">(새 탭에서 열림)</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
