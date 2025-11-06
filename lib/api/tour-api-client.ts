/**
 * @file tour-api-client.ts
 * @description 한국관광공사 API 클라이언트 함수
 *
 * Server Component에서 사용할 한국관광공사 API 호출 함수들을 제공합니다.
 * 내부 API 라우트(/api/tour)를 통해 한국관광공사 공공 API를 호출합니다.
 *
 * 주요 기능:
 * 1. 지역코드 목록 조회 (areaCode2 API)
 * 2. API 에러 처리 및 타입 안정성 보장
 * 3. 기본 지역 목록 폴백 제공
 * 4. 로그 추가 (디버깅용)
 *
 * 핵심 구현 로직:
 * - Server Component에서 내부 API 호출 시 절대 URL 필요
 * - Next.js 15의 headers()를 사용하여 요청 URL 가져오기
 * - 지역코드는 거의 변하지 않으므로 긴 캐싱 시간 적용 (24시간)
 * - API 실패 시 기본 지역 목록 제공 (하드코딩된 주요 지역 17개)
 *
 * @dependencies
 * - next/headers: Server Component에서 헤더 정보 가져오기
 * - @/lib/types/tour: AreaCode, ApiResponse 타입
 *
 * @example
 * ```tsx
 * const areaCodes = await fetchAreaCodes();
 * ```
 */

import type { AreaCode, ApiResponse } from "@/lib/types/tour";

/**
 * 기본 지역 목록 (API 실패 시 사용)
 * 한국관광공사 공공 API의 지역코드 기준
 */
const DEFAULT_AREA_CODES: AreaCode[] = [
  { code: "1", name: "서울" },
  { code: "2", name: "인천" },
  { code: "3", name: "대전" },
  { code: "4", name: "대구" },
  { code: "5", name: "광주" },
  { code: "6", name: "부산" },
  { code: "7", name: "울산" },
  { code: "8", name: "세종" },
  { code: "31", name: "경기" },
  { code: "32", name: "강원" },
  { code: "33", name: "충북" },
  { code: "34", name: "충남" },
  { code: "35", name: "전북" },
  { code: "36", name: "전남" },
  { code: "37", name: "경북" },
  { code: "38", name: "경남" },
  { code: "39", name: "제주" },
];

/**
 * 지역코드 목록을 가져오는 함수
 * @returns AreaCode 배열 (API 실패 시 기본 지역 목록 반환)
 */
export async function fetchAreaCodes(): Promise<AreaCode[]> {
  try {
    console.group("[Tour API Client] Fetching area codes");
    console.log("Starting area code fetch...");

    // Server Component에서 내부 API 호출 시 절대 URL 필요
    // Next.js 15의 headers()를 사용하여 요청 URL 가져오기
    const headersList = await import("next/headers").then((m) => m.headers());
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || "https";

    // baseUrl 결정 로직
    let baseUrl: string;
    if (host) {
      // Vercel 배포 환경에서 host 헤더 사용
      baseUrl = `${protocol}://${host}`;
    } else if (process.env.NEXT_PUBLIC_APP_URL) {
      // 명시적으로 설정된 APP_URL 사용
      baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    } else if (process.env.VERCEL_URL) {
      // Vercel 자동 URL 사용
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else {
      // 개발 환경 기본값
      baseUrl = "http://localhost:3000";
    }

    console.log("[Tour API Client] Base URL:", baseUrl);

    const apiUrl = new URL("/api/tour", baseUrl);
    apiUrl.searchParams.set("endpoint", "areaCode");

    console.log("[Tour API Client] API URL:", apiUrl.toString());

    const response = await fetch(apiUrl.toString(), {
      next: {
        revalidate: 86400, // 24시간 캐싱 (지역코드는 거의 변하지 않음)
      },
      headers: {
        "x-forwarded-host": host || "",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Tour API Client] API Error:", response.status, errorData);
      console.log("[Tour API Client] Using default area codes as fallback");
      console.groupEnd();
      return DEFAULT_AREA_CODES;
    }

    const data: ApiResponse<AreaCode> = await response.json();

    // API 응답 구조 확인
    if (data.response?.header?.resultCode !== "0000") {
      const resultMsg = data.response?.header?.resultMsg || "Unknown error";
      console.error("[Tour API Client] API Error Response:", resultMsg);
      console.log("[Tour API Client] Using default area codes as fallback");
      console.groupEnd();
      return DEFAULT_AREA_CODES;
    }

    // items.item이 배열인지 단일 객체인지 확인
    const items = data.response?.body?.items?.item;
    const areaCodes: AreaCode[] = Array.isArray(items)
      ? items
      : items
        ? [items]
        : [];

    // 정렬: 지역코드 순서대로 (코드를 숫자로 변환하여 정렬)
    areaCodes.sort((a, b) => {
      const codeA = parseInt(a.code, 10);
      const codeB = parseInt(b.code, 10);
      return codeA - codeB;
    });

    console.log(
      "[Tour API Client] Success:",
      areaCodes.length,
      "area codes loaded"
    );
    console.groupEnd();

    // API 성공 시 결과 반환, 빈 배열인 경우 기본 목록 반환
    return areaCodes.length > 0 ? areaCodes : DEFAULT_AREA_CODES;
  } catch (error) {
    console.error("[Tour API Client] Error fetching area codes:", error);
    console.log("[Tour API Client] Using default area codes as fallback");
    console.groupEnd();
    // 에러 발생 시 기본 지역 목록 반환
    return DEFAULT_AREA_CODES;
  }
}

