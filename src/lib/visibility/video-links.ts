// 유튜브 설명란용 짧은 링크 (2026-10-28 대표 요청: 추적 링크가 길다).
// daneedanee.com/v/<올린날짜>/<페이지> 를 누르면 영상별 추적 표시(measurement.ts 의 yt_올린날짜)가 붙은 페이지로 넘긴다.
// 넘길 수 있는 페이지는 아래 목록뿐이다. 페이지를 빼면 홈으로 간다.
const pages = ['about', 'diagnosis', 'letter', 'agency', 'blog'] as const;
const videoDate = /^[0-9]{8}[a-z]?$/;

export function videoLinkTarget(video: string, page: string | undefined): string | null {
  if (!videoDate.test(video)) return null;
  if (page !== undefined && !(pages as readonly string[]).includes(page)) return null;
  const query = `utm_source=youtube&utm_medium=video&utm_campaign=yt_${video}`;
  return `/${page ?? ''}?${query}`;
}
