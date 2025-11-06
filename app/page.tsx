/**
 * @file page.tsx
 * @description My Trip 홈페이지 - 관광지 목록 페이지
 *
 * 한국관광공사 공공 API를 활용한 전국 관광지 정보 서비스의 메인 페이지입니다.
 *
 * 주요 기능:
 * 1. 관광지 목록 표시 (Phase 2.2에서 구현 예정)
 * 2. 지역/타입 필터 (Phase 2.3에서 구현 예정)
 * 3. 키워드 검색 (Phase 2.4에서 구현 예정)
 * 4. 네이버 지도 연동 (Phase 2.5에서 구현 예정)
 *
 * 현재 단계:
 * - TourList 컴포넌트 통합 (하드코딩 데이터로 테스트)
 * - 향후 필터, 지도가 추가될 수 있도록 섹션별로 구조화
 *
 * @dependencies
 * - Next.js 15 App Router
 * - Tailwind CSS v4
 * - @/components/tour-list: TourList 컴포넌트
 * - @/lib/types/tour: TourItem 타입
 */

import { headers } from "next/headers";
import TourList from "@/components/tour-list";
import ErrorMessage from "@/components/error-message";
import type { TourItem, ApiResponse } from "@/lib/types/tour";

/**
 * 관광지 목록을 가져오는 함수
 * @param areaCode - 지역코드 (기본값: "1" - 서울)
 * @param contentTypeId - 관광 타입 코드 (기본값: "12" - 관광지)
 * @param numOfRows - 페이지당 항목 수 (기본값: 10)
 * @param pageNo - 페이지 번호 (기본값: 1)
 * @returns TourItem 배열 또는 에러 메시지
 */
async function fetchTourList(
  areaCode: string = "1",
  contentTypeId: string = "12",
  numOfRows: number = 10,
  pageNo: number = 1
): Promise<{ tours: TourItem[]; error: string | null }> {
  try {
    console.group("[Home] Fetching tour list");
    console.log("Params:", { areaCode, contentTypeId, numOfRows, pageNo });

    // Server Component에서 호스트 정보 가져오기
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = `${protocol}://${host}`;
    
    const apiUrl = new URL("/api/tour", baseUrl);
    apiUrl.searchParams.set("endpoint", "areaBasedList");
    apiUrl.searchParams.set("areaCode", areaCode);
    apiUrl.searchParams.set("contentTypeId", contentTypeId);
    apiUrl.searchParams.set("numOfRows", numOfRows.toString());
    apiUrl.searchParams.set("pageNo", pageNo.toString());

    const response = await fetch(apiUrl.toString(), {
      next: {
        revalidate: 3600, // 1시간 캐싱
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error:", response.status, errorData);
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

export default async function Home() {
  // API에서 관광지 목록 가져오기
  const { tours, error } = await fetchTourList("1", "12", 10, 1);
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

        {/* 필터 및 컨트롤 영역 (Phase 2.3에서 구현 예정) */}
        <section className="pb-8">
          <div className="flex flex-col gap-4">
            {/* 필터 영역 - 향후 TourFilters 컴포넌트로 교체 예정 */}
            <div className="flex flex-wrap gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                필터 기능 (준비 중)
              </div>
            </div>
          </div>
        </section>

        {/* 메인 콘텐츠 영역: 리스트 (지도는 Phase 2.5에서 구현 예정) */}
        <section>
          {/* 리스트 영역 (지도 구현 전까지 전체 너비 사용) */}
          {error ? (
            <ErrorMessage message={error} />
          ) : (
            <TourList tours={tours} />
          )}
        </section>
      </div>
    </main>
  );
}
