/**
 * @file robots.ts
 * @description 동적 robots.txt 생성 (Next.js App Router)
 *
 * Next.js 15 App Router의 robots.ts는 동적 robots.txt를 생성합니다.
 * sitemap URL을 포함하고 크롤러 규칙을 설정합니다.
 *
 * 주요 기능:
 * 1. 모든 크롤러 허용 (또는 특정 크롤러만 허용)
 * 2. sitemap URL 포함
 * 3. 크롤링 규칙 설정
 *
 * @dependencies
 * - 환경 변수: NEXT_PUBLIC_APP_URL 또는 VERCEL_URL
 */

import { MetadataRoute } from "next";

/**
 * Base URL을 가져오는 헬퍼 함수
 * 정적 생성 시 headers()를 사용할 수 없으므로 환경 변수만 사용
 */
async function getBaseUrl(): Promise<string> {
  // 환경 변수 우선 사용
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Vercel 환경 변수
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 기본값
  return "https://mytrip-eight.vercel.app";
}

/**
 * 동적 robots.txt 생성
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  try {
    const baseUrl = await getBaseUrl();

    return {
      rules: [
        {
          userAgent: "*",
          allow: "/",
          disallow: [
            "/api/", // API 라우트는 크롤링 금지
            "/_next/", // Next.js 내부 파일 크롤링 금지
            "/admin/", // 관리자 페이지 (향후 추가 시)
          ],
        },
      ],
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  } catch (error) {
    console.error("[Robots] Error generating robots.txt:", error);

    // 폴백: 기본 설정
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://mytrip.example.com");

    return {
      rules: [
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/api/", "/_next/"],
        },
      ],
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  }
}

