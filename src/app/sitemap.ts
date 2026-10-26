import type { MetadataRoute } from "next";

import { listAllPublished } from "@/lib/notes/queries";
import { allowIndexing, sitemapFor } from "@/lib/seo";

// 요청 때마다 데이터베이스를 바로 읽는다 (2026-10-26). 1시간 캐시로 두었더니 발행 뒤 새로 고침 요청이 글 목록 캐시까지
// 비우지 못해, 글 3편을 발행한 뒤에도 사이트맵에 글이 하나도 없었다. 사이트맵은 작고 검색 로봇만 가끔 읽어서 부담이 없다.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 색인을 꺼 둔 동안에는 데이터베이스를 읽지도 않는다.
  if (!allowIndexing) return [];
  return sitemapFor(true, await listAllPublished());
}
