// 설명(alt)이 빈 마크다운 이미지 수. 편집 화면이 저장 전에 알려 주는 데 쓴다.
export function countImagesMissingAlt(markdown: string): number {
  return (markdown.match(/!\[\s*\]\(/g) ?? []).length;
}
