// 마크다운 본문을 HTML 로 그린다. 공개 글 페이지(서버)와 관리 화면 미리보기(브라우저)가 같이 쓴다.
//
// 이 파일만 JSX 대신 createElement 로 쓴다. node --test 가 JSX 를 읽지 못하는데,
// "본문 제목이 h1 이 되지 않는다", "스크립트가 실행되지 않는다"를 시험으로 묶어 둬야 하기 때문이다.
import { createElement, type ReactElement } from "react";
import Markdown, { type Components } from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

const components: Components = {
  // 페이지의 h1 은 글 제목 하나다. 본문에 # 를 써도 h2 로 내린다.
  h1: ({ children }) => createElement("h2", null, children),
  a: ({ href, children }) => {
    const external = /^https?:\/\//.test(href ?? "");
    return createElement("a", external ? { href, target: "_blank", rel: "noopener noreferrer" } : { href }, children);
  },
  img: ({ src, alt }) =>
    createElement("img", {
      src: typeof src === "string" ? src : undefined,
      alt: alt ?? "",
      loading: "lazy",
      decoding: "async",
    }),
};

export function PostBody({ markdown }: { markdown: string }): ReactElement {
  return createElement(
    "div",
    { className: "note-body" },
    // 글쓴이는 대표뿐이지만 HTML 은 걸러서 낸다 (rehype-sanitize).
    createElement(Markdown, { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSanitize], components }, markdown),
  );
}
