import assert from "node:assert/strict";
import { test } from "node:test";

import { countImagesMissingAlt } from "./markdown-images.ts";

test("alt 가 빈 이미지만 센다", () => {
  const md = ["![](https://x/a.png)", "![ ](https://x/b.png)", "![설명](https://x/c.png)", "[링크](https://x)"].join("\n\n");
  assert.equal(countImagesMissingAlt(md), 2);
});

test("이미지가 없으면 0", () => {
  assert.equal(countImagesMissingAlt("글만 있습니다."), 0);
});
