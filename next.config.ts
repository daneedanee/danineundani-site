import type { NextConfig } from "next";

// 글의 대표 이미지는 Supabase 보관함(cab-post-images)에서 온다. next/image 는 허용한 주소만 받는다.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  // "standalone"은 도커로 직접 돌릴 때 쓰는 설정이다.
  // Vercel은 자체 방식으로 묶기 때문에 이 설정이 켜져 있으면 빌드가 깨진다.
  // 그래서 Vercel에서 빌드할 때(VERCEL 환경 변수가 있을 때)만 끈다.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  images: {
    remotePatterns: [
      // 홈의 유튜브 영상 띠 썸네일
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      ...(supabaseHost
        ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/cab-post-images/**" }]
        : []),
    ],
  },
};

export default nextConfig;
