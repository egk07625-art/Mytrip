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

import type {
  AreaCode,
  ApiResponse,
  TourDetail,
  TourIntro,
  TourImage,
} from "@/lib/types/tour";

/**
 * 지역코드별 정식 명칭 매핑
 * API 응답의 지역명을 정식 명칭으로 변환하기 위한 맵
 */
const AREA_CODE_NAME_MAP: Record<string, string> = {
  "1": "서울",
  "2": "인천",
  "3": "대전",
  "4": "대구",
  "5": "광주",
  "6": "부산",
  "7": "울산",
  "8": "세종특별자치시",
  "31": "경기도",
  "32": "강원특별자치도",
  "33": "충청북도",
  "34": "충청남도",
  "35": "전라북도",
  "36": "전라남도",
  "37": "경상북도",
  "38": "경상남도",
  "39": "제주특별자치도",
};

/**
 * 기본 지역 목록 (API 실패 시 사용)
 * 한국관광공사 공공 API의 지역코드 기준
 * 한국의 모든 시/도 포함 (총 17개)
 */
const DEFAULT_AREA_CODES: AreaCode[] = [
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

    // API 응답의 지역명을 정식 명칭으로 변환하고, 누락된 지역 추가
    const normalizedAreaCodes: AreaCode[] = [];
    const apiAreaCodeMap = new Map<string, AreaCode>();
    
    // API 응답을 맵으로 변환
    areaCodes.forEach((area) => {
      apiAreaCodeMap.set(area.code, area);
    });

    // 모든 지역코드에 대해 정식 명칭으로 변환
    DEFAULT_AREA_CODES.forEach((defaultArea) => {
      const apiArea = apiAreaCodeMap.get(defaultArea.code);
      if (apiArea) {
        // API 응답이 있으면 정식 명칭으로 변환
        normalizedAreaCodes.push({
          code: apiArea.code,
          name: AREA_CODE_NAME_MAP[apiArea.code] || apiArea.name,
        });
      } else {
        // API 응답에 없는 지역은 기본 목록에서 추가
        normalizedAreaCodes.push(defaultArea);
      }
    });

    // 정렬: 지역코드 순서대로 (코드를 숫자로 변환하여 정렬)
    normalizedAreaCodes.sort((a, b) => {
      const codeA = parseInt(a.code, 10);
      const codeB = parseInt(b.code, 10);
      return codeA - codeB;
    });

    console.log(
      "[Tour API Client] Success:",
      normalizedAreaCodes.length,
      "area codes loaded (normalized)"
    );
    console.groupEnd();

    // API 성공 시 정규화된 결과 반환
    return normalizedAreaCodes;
  } catch (error) {
    console.error("[Tour API Client] Error fetching area codes:", error);
    console.log("[Tour API Client] Using default area codes as fallback");
    console.groupEnd();
    // 에러 발생 시 기본 지역 목록 반환
    return DEFAULT_AREA_CODES;
  }
}

/**
 * 관광지 상세 정보를 가져오는 함수
 * @param contentId - 관광지 콘텐츠 ID
 * @returns TourDetail 객체 또는 null (API 실패 시)
 */
export async function fetchTourDetail(
  contentId: string
): Promise<TourDetail | null> {
  try {
    console.group("[Tour API Client] Fetching tour detail");
    console.log("Content ID:", contentId);

    // Server Component에서 내부 API 호출 시 절대 URL 필요
    const headersList = await import("next/headers").then((m) => m.headers());
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || "https";

    // baseUrl 결정 로직
    let baseUrl: string;
    if (host) {
      baseUrl = `${protocol}://${host}`;
    } else if (process.env.NEXT_PUBLIC_APP_URL) {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else {
      baseUrl = "http://localhost:3000";
    }

    console.log("[Tour API Client] Base URL:", baseUrl);

    const apiUrl = new URL("/api/tour", baseUrl);
    apiUrl.searchParams.set("endpoint", "detailCommon");
    apiUrl.searchParams.set("contentId", contentId);

    console.log("[Tour API Client] API URL:", apiUrl.toString());

    const response = await fetch(apiUrl.toString(), {
      next: {
        revalidate: 3600, // 1시간 캐싱
      },
      headers: {
        "x-forwarded-host": host || "",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Tour API Client] API Error:", response.status, errorData);
      console.groupEnd();
      return null;
    }

    const data: ApiResponse<TourDetail> = await response.json();

    // API 응답 구조 확인
    if (data.response?.header?.resultCode !== "0000") {
      const resultMsg = data.response?.header?.resultMsg || "Unknown error";
      console.error("[Tour API Client] API Error Response:", resultMsg);
      console.groupEnd();
      return null;
    }

    // items.item이 배열인지 단일 객체인지 확인
    const items = data.response?.body?.items?.item;
    const tourDetail: TourDetail | null = Array.isArray(items)
      ? items[0] || null
      : items || null;

    if (tourDetail) {
      console.log("[Tour API Client] Success: Tour detail loaded");
      console.log("[Tour API Client] Title:", tourDetail.title);
    } else {
      console.warn("[Tour API Client] No tour detail found");
    }

    console.groupEnd();
    return tourDetail;
  } catch (error) {
    console.error("[Tour API Client] Error fetching tour detail:", error);
    console.groupEnd();
    return null;
  }
}

/**
 * 관광지 운영 정보를 가져오는 함수
 * @param contentId - 관광지 콘텐츠 ID
 * @param contentTypeId - 관광지 타입 ID (필수)
 * @returns TourIntro 객체 또는 null (API 실패 시)
 */
export async function fetchTourIntro(
  contentId: string,
  contentTypeId: string
): Promise<TourIntro | null> {
  try {
    console.group("[Tour API Client] Fetching tour intro");
    console.log("Content ID:", contentId);
    console.log("Content Type ID:", contentTypeId);

    // contentTypeId가 없으면 null 반환
    if (!contentTypeId) {
      console.warn("[Tour API Client] contentTypeId is missing");
      console.groupEnd();
      return null;
    }

    // Server Component에서 내부 API 호출 시 절대 URL 필요
    const headersList = await import("next/headers").then((m) => m.headers());
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || "https";

    // baseUrl 결정 로직
    let baseUrl: string;
    if (host) {
      baseUrl = `${protocol}://${host}`;
    } else if (process.env.NEXT_PUBLIC_APP_URL) {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else {
      baseUrl = "http://localhost:3000";
    }

    console.log("[Tour API Client] Base URL:", baseUrl);

    const apiUrl = new URL("/api/tour", baseUrl);
    apiUrl.searchParams.set("endpoint", "detailIntro");
    apiUrl.searchParams.set("contentId", contentId);
    apiUrl.searchParams.set("contentTypeId", contentTypeId);

    console.log("[Tour API Client] API URL:", apiUrl.toString());

    const response = await fetch(apiUrl.toString(), {
      next: {
        revalidate: 3600, // 1시간 캐싱
      },
      headers: {
        "x-forwarded-host": host || "",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Tour API Client] API Error:", response.status, errorData);
      console.groupEnd();
      return null;
    }

    const data: ApiResponse<TourIntro> = await response.json();

    // API 응답 구조 확인
    if (data.response?.header?.resultCode !== "0000") {
      const resultMsg = data.response?.header?.resultMsg || "Unknown error";
      console.error("[Tour API Client] API Error Response:", resultMsg);
      console.groupEnd();
      return null;
    }

    // items.item이 배열인지 단일 객체인지 확인
    const items = data.response?.body?.items?.item;
    const tourIntro: TourIntro | null = Array.isArray(items)
      ? items[0] || null
      : items || null;

    if (tourIntro) {
      console.log("[Tour API Client] Success: Tour intro loaded");
    } else {
      console.warn("[Tour API Client] No tour intro found");
    }

    console.groupEnd();
    return tourIntro;
  } catch (error) {
    console.error("[Tour API Client] Error fetching tour intro:", error);
    console.groupEnd();
    return null;
  }
}

/**
 * 관광지 이미지 목록을 가져오는 함수
 * @param contentId - 관광지 콘텐츠 ID
 * @returns TourImage 배열 (API 실패 시 빈 배열 반환)
 */
export async function fetchTourImages(
  contentId: string
): Promise<TourImage[]> {
  try {
    console.group("[Tour API Client] Fetching tour images");
    console.log("Content ID:", contentId);

    // Server Component에서 내부 API 호출 시 절대 URL 필요
    const headersList = await import("next/headers").then((m) => m.headers());
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || "https";

    // baseUrl 결정 로직
    let baseUrl: string;
    if (host) {
      baseUrl = `${protocol}://${host}`;
    } else if (process.env.NEXT_PUBLIC_APP_URL) {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else {
      baseUrl = "http://localhost:3000";
    }

    console.log("[Tour API Client] Base URL:", baseUrl);

    const apiUrl = new URL("/api/tour", baseUrl);
    apiUrl.searchParams.set("endpoint", "detailImage");
    apiUrl.searchParams.set("contentId", contentId);

    console.log("[Tour API Client] API URL:", apiUrl.toString());

    const response = await fetch(apiUrl.toString(), {
      next: {
        revalidate: 3600, // 1시간 캐싱
      },
      headers: {
        "x-forwarded-host": host || "",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Tour API Client] API Error:", response.status, errorData);
      console.log("[Tour API Client] Returning empty array");
      console.groupEnd();
      return [];
    }

    const data: ApiResponse<TourImage> = await response.json();

    // API 응답 구조 확인
    if (data.response?.header?.resultCode !== "0000") {
      const resultMsg = data.response?.header?.resultMsg || "Unknown error";
      console.error("[Tour API Client] API Error Response:", resultMsg);
      console.log("[Tour API Client] Returning empty array");
      console.groupEnd();
      return [];
    }

    // items.item이 배열인지 단일 객체인지 확인
    const items = data.response?.body?.items?.item;
    const tourImages: TourImage[] = Array.isArray(items)
      ? items
      : items
        ? [items]
        : [];

    console.log(
      "[Tour API Client] Success:",
      tourImages.length,
      "images loaded"
    );
    console.groupEnd();
    return tourImages;
  } catch (error) {
    console.error("[Tour API Client] Error fetching tour images:", error);
    console.log("[Tour API Client] Returning empty array");
    console.groupEnd();
    return [];
  }
}

