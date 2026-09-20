import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone"은 도커로 직접 돌릴 때 쓰는 설정이다.
  // Vercel은 자체 방식으로 묶기 때문에 이 설정이 켜져 있으면 빌드가 깨진다.
  // 그래서 Vercel에서 빌드할 때(VERCEL 환경 변수가 있을 때)만 끈다.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
};

export default nextConfig;
