// 쇼츠 글자에 쓰는 무료 글꼴 (구글 폰트, OFL). 빌드할 때 내려받아 이 사이트에서 함께 제공한다.
import { Black_Han_Sans, Noto_Sans_KR } from "next/font/google";

export const displayFont = Black_Han_Sans({ weight: "400", subsets: ["latin"], preload: false, display: "block" });
export const bodyFont = Noto_Sans_KR({ weight: "900", subsets: ["latin"], preload: false, display: "block" });
