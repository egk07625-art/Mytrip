/**
 * @file page.tsx
 * @description My Trip 홈페이지 - 관광지 목록 페이지
 *
 * 한국관광공사 공공 API를 활용한 전국 관광지 정보 서비스의 메인 페이지입니다.
 *
 * 주요 기능:
 * 1. 관광지 목록 표시 (Phase 2.2 완료)
 * 2. 지역/타입 필터 (Phase 2.3 완료)
 * 3. 키워드 검색 (Phase 2.4.1 완료 - UI 컴포넌트)
 * 4. 네이버 지도 연동 (Phase 2.5에서 구현 예정)
 *
 * 현재 단계:
 * - TourList 컴포넌트 통합 완료
 * - TourFilters 컴포넌트 통합 완료 (URL 파라미터 기반)
 * - TourSearch 컴포넌트 통합 완료 (URL 파라미터 기반)
 * - 향후 검색 API 연동, 지도가 추가될 수 있도록 섹션별로 구조화
 *
 * 핵심 구현 로직:
 * - Server Component에서 URL 파라미터 읽기 (Next.js 15 await searchParams)
 * - 지역코드 목록 조회 (fetchAreaCodes)
 * - 필터링된 관광지 목록 조회 (fetchTourList)
 * - Client Component로 필터 UI 분리 (TourFiltersClient)
 *
 * @dependencies
 * - Next.js 15 App Router
 * - Tailwind CSS v4
 * - @/components/tour-list: TourList 컴포넌트
 * - @/components/tour-filters: TourFilters 컴포넌트
 * - @/components/tour-search: TourSearch 컴포넌트
 * - @/lib/api/tour-api-client: fetchAreaCodes 함수
 * - @/lib/types/tour: TourItem, AreaCode 타입
 */

import TourList from "@/components/tour-list";
import TourListWrapper from "@/components/tour-list-wrapper";
import TourFilters from "@/components/tour-filters";
import TourSearch from "@/components/tour-search";
import ErrorMessageWithRetry from "@/components/error-message-with-retry";
import { fetchAreaCodes } from "@/lib/api/tour-api-client";
import type { TourItem, ApiResponse } from "@/lib/types/tour";

// 빌드 타임에 API 호출을 방지하고 런타임에만 실행되도록 설정
export const dynamic = 'force-dynamic';

/**
 * 관광지 목록을 가져오는 함수
 * @param areaCode - 지역코드 (기본값: "1" - 서울)
 * @param contentTypeId - 관광 타입 코드 (선택적, 빈 값이면 필터링 안 함)
 * @param numOfRows - 페이지당 항목 수 (기본값: 10)
 * @param pageNo - 페이지 번호 (기본값: 1)
 * @returns TourItem 배열 또는 에러 메시지
 */
async function fetchTourList(
  areaCode: string = "1",
  contentTypeId?: string,
  numOfRows: number = 10,
  pageNo: number = 1
): Promise<{ tours: TourItem[]; error: string | null }> {
  try {
    console.group("[Home] Fetching tour list");
    console.log("Params:", { areaCode, contentTypeId, numOfRows, pageNo });

    // Server Component에서 내부 API 호출 시 절대 URL 필요
    // Next.js 15의 headers()를 사용하여 요청 URL 가져오기
    const headersList = await import("next/headers").then((m) => m.headers());
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || "https";
    
    // baseUrl 결정 로직 개선
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
    
    console.log("[Home] Base URL:", baseUrl);
    
    const apiUrl = new URL("/api/tour", baseUrl);
    apiUrl.searchParams.set("endpoint", "areaBasedList");
    apiUrl.searchParams.set("areaCode", areaCode);
    // contentTypeId가 있으면 추가 (없으면 필터링 안 함)
    if (contentTypeId) {
      apiUrl.searchParams.set("contentTypeId", contentTypeId);
    }
    apiUrl.searchParams.set("numOfRows", numOfRows.toString());
    apiUrl.searchParams.set("pageNo", pageNo.toString());

    console.log("[Home] API URL:", apiUrl.toString());

    const response = await fetch(apiUrl.toString(), {
      next: {
        revalidate: 3600, // 1시간 캐싱
      },
      // Vercel에서 내부 API 호출 시 헤더 추가 (필요시)
      headers: {
        "x-forwarded-host": host || "",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Home] API Error:", response.status, errorData);
      console.error("[Home] Response headers:", Object.fromEntries(response.headers.entries()));
      console.groupEnd();
      return {
        tours: [],
        error: errorData.message || `API 요청 실패: ${response.status}`,
      };
    }

    const data: ApiResponse<TourItem> = await response.json();

    // API 응답 구조 확인
    if (data.response?.header?.resultCode !== "0000") {
      const resultMsg = data.response?.header?.resultMsg || "Unknown error";
      console.error("API Error Response:", resultMsg);
      console.groupEnd();
      return {
        tours: [],
        error: resultMsg,
      };
    }

    // items.item이 배열인지 단일 객체인지 확인
    const items = data.response?.body?.items?.item;
    const tours: TourItem[] = Array.isArray(items) ? items : items ? [items] : [];

    console.log("Success:", tours.length, "tours loaded");
    console.groupEnd();

    return { tours, error: null };
  } catch (error) {
    console.error("[Home] Error fetching tour list:", error);
    console.groupEnd();
    return {
      tours: [],
      error: error instanceof Error ? error.message : "관광지 목록을 불러오는 중 오류가 발생했습니다.",
    };
  }
}

interface HomeProps {
  searchParams: Promise<{
    keyword?: string;
    areaCode?: string;
    contentTypeId?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  // Next.js 15: searchParams는 Promise로 반환되므로 await 필요
  const params = await searchParams;

  // URL 파라미터에서 필터 및 검색 값 읽기
  // keyword는 선택적 (검색 기능은 Phase 2.4.2에서 API 연동 예정)
  const keyword = params.keyword;
  // areaCode가 없거나 빈 값이면 기본값 "1" (서울) 사용
  // 필터에서 "전체"를 선택하면 areaCode 파라미터가 없으므로 기본값 사용
  const areaCode = params.areaCode || "1";
  // contentTypeId는 선택적 (빈 값이면 필터링 안 함, "전체" 선택 시)
  const contentTypeId = params.contentTypeId;

  console.group("[Home] Page render");
  console.log("URL params:", { keyword, areaCode, contentTypeId });
  console.log("Search params:", params);

  // 지역코드 목록 조회 (API 실패 시 기본 목록 반환)
  const areaCodes = await fetchAreaCodes();

  // 필터링된 관광지 목록 조회
  const { tours, error } = await fetchTourList(areaCode, contentTypeId, 10, 1);

  console.log("Loaded:", {
    areaCodesCount: areaCodes.length,
    toursCount: tours.length,
    hasError: !!error,
  });
  console.groupEnd();

  return (
    <main className="min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-7xl mx-auto px-4 py-8 lg:px-8 lg:py-12">
        {/* 페이지 제목 영역 */}
        <section className="flex flex-col gap-4 pb-8">
          <h1 className="text-4xl lg:text-5xl font-bold">전국 관광지 탐험</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            한국의 아름다운 관광지를 검색하고 정보를 확인해보세요
          </p>
        </section>

        {/* 필터 및 컨트롤 영역 */}
        <section className="pb-8">
          <div className="flex flex-col gap-4">
            {/* 검색 영역 */}
            <TourSearch />
            {/* 필터 영역 */}
            <TourFilters areaCodes={areaCodes} />
          </div>
        </section>

        {/* 메인 콘텐츠 영역: 리스트 (지도는 Phase 2.5에서 구현 예정) */}
        <section>
          {/* 리스트 영역 (지도 구현 전까지 전체 너비 사용) */}
          {error ? (
            <ErrorMessageWithRetry 
              message={error} 
              type="api"
            />
          ) : (
            <TourListWrapper tours={tours} error={error} />
          )}
        </section>
      </div>
    </main>
  );
}
