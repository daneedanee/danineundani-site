import assert from "node:assert/strict";
import { test } from "node:test";

import { checkImageFile, imageExtension, isStorageImage } from "./images.ts";

const supabaseUrl = "https://abc.supabase.co";

test("isStorageImage: 우리 보관함 주소만 참", () => {
  assert.equal(isStorageImage("https://abc.supabase.co/storage/v1/object/public/cab-post-images/2026/10/a.png", supabaseUrl), true);
  assert.equal(isStorageImage("https://abc.supabase.co/storage/v1/object/public/other/a.png", supabaseUrl), false);
  assert.equal(isStorageImage("https://example.com/a.png", supabaseUrl), false);
  assert.equal(isStorageImage("https://abc.supabase.co/storage/v1/object/public/cab-post-images/a.png", undefined), false);
});

test("checkImageFile: 허용 형식·크기면 null", () => {
  assert.equal(checkImageFile({ type: "image/png", size: 1024 }), null);
  assert.equal(checkImageFile({ type: "image/webp", size: 5 * 1024 * 1024 }), null);
});

test("checkImageFile: 형식이 다르면 안내", () => {
  assert.equal(checkImageFile({ type: "image/svg+xml", size: 10 }), "jpg, png, webp, gif 이미지만 올릴 수 있습니다.");
  assert.equal(checkImageFile({ type: "application/pdf", size: 10 }), "jpg, png, webp, gif 이미지만 올릴 수 있습니다.");
});

test("checkImageFile: 5MB 를 넘으면 안내", () => {
  assert.equal(checkImageFile({ type: "image/jpeg", size: 5 * 1024 * 1024 + 1 }), "이미지는 5MB 이하만 올릴 수 있습니다.");
});

test("imageExtension", () => {
  assert.equal(imageExtension("image/jpeg"), "jpg");
  assert.equal(imageExtension("image/png"), "png");
  assert.equal(imageExtension("image/webp"), "webp");
  assert.equal(imageExtension("image/gif"), "gif");
});
