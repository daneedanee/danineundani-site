import type { MetadataRoute } from "next";

import { listAllPublished } from "@/lib/notes/queries";
import { allowIndexing, sitemapFor } from "@/lib/seo";

// 발행·수정 때 /api/notes/revalidate 가 즉시 새로 만들게 한다. 이 값은 그게 실패했을 때의 안전망이다.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 색인을 꺼 둔 동안에는 데이터베이스를 읽지도 않는다.
  if (!allowIndexing) return [];
  return sitemapFor(true, await listAllPublished());
}
