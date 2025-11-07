import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      // 한국관광공사 API 이미지 도메인
      { hostname: "api.cdn.visitkorea.or.kr" },
      { hostname: "tong.visitkorea.or.kr" },
    ],
  },
  // 빌드 타임에 환경 변수를 명시적으로 주입
  // Vercel 배포 환경에서 환경 변수가 제대로 로드되도록 명시적으로 설정
  env: {
    // Clerk 인증
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    // 앱 URL (Server Component에서 내부 API 호출 시 사용)
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_STORAGE_BUCKET: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    // 한국관광공사 API
    TOUR_API_KEY: process.env.TOUR_API_KEY,
    NEXT_PUBLIC_TOUR_API_KEY: process.env.NEXT_PUBLIC_TOUR_API_KEY,
  },
};

export default nextConfig;
