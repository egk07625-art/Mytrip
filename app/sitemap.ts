/**
 * @file sitemap.ts
 * @description 동적 sitemap 생성 (Next.js App Router)
 *
 * Next.js 15 App Router의 sitemap.ts는 동적 sitemap을 생성합니다.
 * 홈페이지와 관광지 상세 페이지를 포함합니다.
 *
 * 주요 기능:
 * 1. 홈페이지 URL 포함
 * 2. 관광지 상세 페이지 URL 동적 생성 (API에서 관광지 목록 가져오기)
 * 3. 에러 핸들링 및 폴백 로직
 * 4. 빌드 타임 캐싱 활용
 *
 * @dependencies
 * - 한국관광공사 공공 API: 빌드 타임에 직접 호출하여 관광지 목록 조회
 * - 환경변수: TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY 필요
 */

import { MetadataRoute } from "next";
import type { TourItem } from "@/lib/types/tour";

/**
 * 기본 지역 목록 (정적 생성 시 사용)
 * 한국의 모든 시/도 포함 (총 17개)
 */
const DEFAULT_AREA_CODES = [
  { code: "1", name: "서울" },
  { code: "2", name: "인천" },
  { code: "3", name: "대전" },
  { code: "4", name: "대구" },
  { code: "5", name: "광주" },
  { code: "6", name: "부산" },
  { code: "7", name: "울산" },
  { code: "8", name: "세종특별자치시" },
  { code: "31", name: "경기도" },
  { code: "32", name: "강원특별자치도" },
  { code: "33", name: "충청북도" },
  { code: "34", name: "충청남도" },
  { code: "35", name: "전라북도" },
  { code: "36", name: "전라남도" },
  { code: "37", name: "경상북도" },
  { code: "38", name: "경상남도" },
  { code: "39", name: "제주특별자치도" },
];

/**
 * Base URL을 가져오는 헬퍼 함수
 * 정적 생성 시 headers()를 사용할 수 없으므로 환경 변수만 사용
 */
async function getBaseUrl(): Promise<string> {
  console.log("[Sitemap] Environment check:");
  console.log("  - NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL || "(not set)");
  console.log("  - VERCEL_URL:", process.env.VERCEL_URL || "(not set)");
  
  // 환경 변수 우선 사용 (끝의 슬래시 제거)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    const url = process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
    console.log("[Sitemap] Using NEXT_PUBLIC_APP_URL:", url);
    return url;
  }

  // Vercel 환경 변수
  if (process.env.VERCEL_URL) {
    const url = `https://${process.env.VERCEL_URL}`;
    console.log("[Sitemap] Using VERCEL_URL:", url);
    return url;
  }

  // 기본값 (고정 URL 사용)
  const defaultUrl = "https://mytrip-eight.vercel.app";
  console.log("[Sitemap] Using default URL:", defaultUrl);
  return defaultUrl;
}

/**
 * 한국관광공사 API를 직접 호출하는 함수 (빌드 타임용)
 * sitemap 생성 시 내부 API 라우트를 거치지 않고 직접 호출
 * 빌드 타임에는 서버가 실행되지 않아 내부 API를 호출할 수 없기 때문
 */
async function fetchToursDirectly(
  areaCode: string,
  numOfRows: number = 50,
  pageNo: number = 1
): Promise<TourItem[]> {
  const TOUR_API_BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
  
  // 환경변수에서 API 키 가져오기
  const apiKey = process.env.TOUR_API_KEY || process.env.NEXT_PUBLIC_TOUR_API_KEY;
  
  if (!apiKey) {
    console.warn("[Sitemap] TOUR_API_KEY not found, skipping tour fetch");
    return [];
  }

  try {
    const apiParams = new URLSearchParams({
      serviceKey: apiKey.trim(),
      MobileOS: "ETC",
      MobileApp: "MyTrip",
      _type: "json",
      areaCode: areaCode,
      numOfRows: numOfRows.toString(),
      pageNo: pageNo.toString(),
    });

    const apiUrl = `${TOUR_API_BASE_URL}/areaBasedList2?${apiParams.toString()}`;
    
    const response = await fetch(apiUrl, {
      next: {
        revalidate: 86400, // 24시간 캐싱
      },
    });

    if (!response.ok) {
      console.warn(
        `[Sitemap] Failed to fetch tours for area ${areaCode}:`,
        response.status,
      );
      return [];
    }

    const data = await response.json();

    if (data.response?.header?.resultCode === "0000") {
      const items = data.response?.body?.items?.item;
      const tours: TourItem[] = Array.isArray(items)
        ? items
        : items
        ? [items]
        : [];
      return tours;
    }

    return [];
  } catch (error) {
    console.error(
      `[Sitemap] Error fetching tours for area ${areaCode}:`,
      error,
    );
    return [];
  }
}

/**
 * 관광지 목록을 가져오는 함수 (sitemap용)
 * 여러 지역에서 관광지를 가져와서 contentId 목록 생성
 */
async function fetchTourContentIds(): Promise<string[]> {
  const contentIds: string[] = [];
  const maxToursPerArea = 50; // 지역당 최대 관광지 수 (sitemap 크기 제한)

  try {
    console.group("[Sitemap] Fetching tour content IDs");

    // 정적 생성 시 기본 지역 목록 사용 (headers() 사용 불가)
    const areaCodes = DEFAULT_AREA_CODES;
    console.log("[Sitemap] Area codes:", areaCodes.length);

    // 주요 지역에서만 관광지 가져오기 (성능 최적화)
    // 모든 지역을 조회하면 시간이 너무 오래 걸릴 수 있음
    const majorAreaCodes = areaCodes.slice(0, 10); // 상위 10개 지역만

    // 각 지역에서 관광지 목록 가져오기 (직접 API 호출)
    // 빌드 타임에는 내부 API 라우트를 호출할 수 없으므로 한국관광공사 API를 직접 호출
    for (const areaCode of majorAreaCodes) {
      const tours = await fetchToursDirectly(
        areaCode.code,
        maxToursPerArea,
        1
      );

      tours.forEach((tour) => {
        if (tour.contentid) {
          contentIds.push(tour.contentid);
        }
      });

      if (tours.length > 0) {
        console.log(
          `[Sitemap] Fetched ${tours.length} tours from area ${areaCode.code}`,
        );
      }
    }

    console.log(
      `[Sitemap] Total content IDs collected: ${contentIds.length}`,
    );
    console.groupEnd();

    return contentIds;
  } catch (error) {
    console.error("[Sitemap] Error fetching tour content IDs:", error);
    console.groupEnd();
    // 에러 발생 시 빈 배열 반환 (홈페이지만 포함)
    return [];
  }
}

/**
 * 동적 sitemap 생성
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    console.group("[Sitemap] Generating sitemap");

    const baseUrl = await getBaseUrl();
    console.log("[Sitemap] Base URL:", baseUrl);

    // 기본 페이지 (홈페이지)
    const routes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
    ];

    // 관광지 상세 페이지 URL 생성
    try {
      const contentIds = await fetchTourContentIds();

      contentIds.forEach((contentId) => {
        routes.push({
          url: `${baseUrl}/places/${contentId}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      });

      console.log(
        `[Sitemap] Generated ${routes.length} URLs (1 home + ${contentIds.length} places)`,
      );
    } catch (error) {
      console.error("[Sitemap] Error generating place URLs:", error);
      // 관광지 URL 생성 실패 시 홈페이지만 포함
    }

    console.groupEnd();
    return routes;
  } catch (error) {
    console.error("[Sitemap] Error generating sitemap:", error);
    console.groupEnd();

    // 최종 폴백: 홈페이지만 포함
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://mytrip-eight.vercel.app");

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
    ];
  }
}

