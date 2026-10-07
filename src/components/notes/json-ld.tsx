import { serializeJsonLd } from "@/lib/notes/jsonld";

// 구조화 데이터를 페이지에 넣는다. "<" 처리는 serializeJsonLd 가 한다.
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
