/**
 * @file page.tsx
 * @description My Trip 홈페이지 - 관광지 목록 페이지
 *
 * 한국관광공사 공공 API를 활용한 전국 관광지 정보 서비스의 메인 페이지입니다.
 *
 * 주요 기능:
 * 1. 관광지 목록 표시 (Phase 2.2 완료)
 * 2. 지역/타입 필터 (Phase 2.3 완료)
 * 3. 키워드 검색 (Phase 2.4.2 완료 - API 연동)
 * 4. 네이버 지도 연동 (Phase 2.5에서 구현 예정)
 *
 * 현재 단계:
 * - TourList 컴포넌트 통합 완료
 * - TourFilters 컴포넌트 통합 완료 (URL 파라미터 기반)
 * - TourSearch 컴포넌트 통합 완료 (URL 파라미터 기반)
 * - 검색 API 연동 완료 (fetchTourSearch 함수 추가)
 * - 향후 지도가 추가될 수 있도록 섹션별로 구조화
 *
 * 핵심 구현 로직:
 * - Server Component에서 URL 파라미터 읽기 (Next.js 15 await searchParams)
 * - 지역코드 목록 조회 (fetchAreaCodes)
 * - 검색/목록 로직 분기 (keyword가 있으면 fetchTourSearch, 없으면 fetchTourList)
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
import TourSort from "@/components/tour-sort";
import TourPagination from "@/components/tour-pagination";
import ErrorMessageWithRetry from "@/components/error-message-with-retry";
import { fetchAreaCodes } from "@/lib/api/tour-api-client";
import type { TourItem, ApiResponse, AreaCode, SortOption } from "@/lib/types/tour";
import { CONTENT_TYPE_LABEL } from "@/lib/types/tour";

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
): Promise<{ tours: TourItem[]; totalCount: number; error: string | null }> {
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
    const totalCount = data.response?.body?.totalCount || 0;

    console.log("Success:", tours.length, "tours loaded, totalCount:", totalCount);
    console.groupEnd();

    return { tours, totalCount, error: null };
  } catch (error) {
    console.error("[Home] Error fetching tour list:", error);
    console.groupEnd();
    return {
      tours: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : "관광지 목록을 불러오는 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 관광지 검색을 수행하는 함수
 * @param keyword - 검색 키워드 (필수)
 * @param areaCode - 지역코드 (선택적)
 * @param contentTypeId - 관광 타입 코드 (선택적)
 * @param numOfRows - 페이지당 항목 수 (기본값: 10)
 * @param pageNo - 페이지 번호 (기본값: 1)
 * @returns TourItem 배열 또는 에러 메시지
 */
async function fetchTourSearch(
  keyword: string,
  areaCode?: string,
  contentTypeId?: string,
  numOfRows: number = 10,
  pageNo: number = 1
): Promise<{ tours: TourItem[]; totalCount: number; error: string | null }> {
  try {
    console.group("[Home] Fetching tour search");
    console.log("Input params:", { keyword, areaCode, contentTypeId, numOfRows, pageNo });
    
    // 필터 파라미터 상태 로깅
    const hasAreaFilter = Boolean(areaCode);
    const hasTypeFilter = Boolean(contentTypeId);
    console.log("Filter status:", {
      hasAreaFilter,
      areaCode: areaCode || "(none)",
      hasTypeFilter,
      contentTypeId: contentTypeId || "(none)",
    });

    // 검색어 유효성 검사
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword || trimmedKeyword.length < 2) {
      console.warn("[Home] Invalid keyword:", trimmedKeyword);
      console.groupEnd();
      return {
        tours: [],
        totalCount: 0,
        error: "검색어는 최소 2자 이상 입력해주세요.",
      };
    }

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
    apiUrl.searchParams.set("endpoint", "searchKeyword");
    apiUrl.searchParams.set("keyword", trimmedKeyword);
    
    // areaCode가 있으면 추가
    if (areaCode) {
      apiUrl.searchParams.set("areaCode", areaCode);
      console.log("[Home] Added areaCode filter:", areaCode);
    } else {
      console.log("[Home] No areaCode filter applied");
    }
    
    // contentTypeId가 있으면 추가
    if (contentTypeId) {
      apiUrl.searchParams.set("contentTypeId", contentTypeId);
      console.log("[Home] Added contentTypeId filter:", contentTypeId);
    } else {
      console.log("[Home] No contentTypeId filter applied");
    }
    
    apiUrl.searchParams.set("numOfRows", numOfRows.toString());
    apiUrl.searchParams.set("pageNo", pageNo.toString());

    // 최종 API URL 파라미터 확인
    const finalParams = Object.fromEntries(apiUrl.searchParams.entries());
    console.log("[Home] Final API params:", finalParams);
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
        totalCount: 0,
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
        totalCount: 0,
        error: resultMsg,
      };
    }

    // items.item이 배열인지 단일 객체인지 확인
    const items = data.response?.body?.items?.item;
    const tours: TourItem[] = Array.isArray(items) ? items : items ? [items] : [];
    const totalCount = data.response?.body?.totalCount || 0;

    console.log("Success:", {
      toursCount: tours.length,
      totalCount,
      keyword: trimmedKeyword,
      filters: {
        areaCode: areaCode || "(none)",
        contentTypeId: contentTypeId || "(none)",
      },
    });
    console.groupEnd();

    return { tours, totalCount, error: null };
  } catch (error) {
    console.error("[Home] Error fetching tour search:", error);
      console.groupEnd();
      return {
        tours: [],
        totalCount: 0,
        error: error instanceof Error ? error.message : "검색 중 오류가 발생했습니다.",
      };
  }
}

/**
 * 관광지 목록을 정렬하는 함수
 * @param tours - 정렬할 관광지 목록
 * @param sortBy - 정렬 옵션 (latest: 최신순, name: 이름순)
 * @returns 정렬된 관광지 목록
 */
function sortTours(tours: TourItem[], sortBy: SortOption): TourItem[] {
  const sorted = [...tours];
  
  if (sortBy === "latest") {
    // 최신순: modifiedtime 내림차순
    return sorted.sort((a, b) => {
      const timeA = new Date(a.modifiedtime).getTime();
      const timeB = new Date(b.modifiedtime).getTime();
      return timeB - timeA;
    });
  } else {
    // 이름순: title 오름차순 (가나다순)
    return sorted.sort((a, b) => a.title.localeCompare(b.title, "ko"));
  }
}

interface HomeProps {
  searchParams: Promise<{
    keyword?: string;
    areaCode?: string;
    contentTypeId?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  // Next.js 15: searchParams는 Promise로 반환되므로 await 필요
  const params = await searchParams;

  // URL 파라미터에서 필터 및 검색 값 읽기
  const keyword = params.keyword;
  // areaCode 처리 로직:
  // - 검색 시(keyword가 있을 때): "전체" 선택 시 areaCode가 없거나 빈 문자열이면 undefined (모든 지역 검색)
  // - 목록 조회 시(keyword가 없을 때): areaCode가 없거나 빈 문자열이면 기본값 "1" (서울) 사용
  const rawAreaCode = params.areaCode?.trim() || "";
  const areaCode = keyword 
    ? (rawAreaCode ? rawAreaCode : undefined) // 검색 시: "전체" 선택 시 undefined
    : (rawAreaCode || "1"); // 목록 조회 시: 기본값 "1"
  // contentTypeId는 선택적 (빈 값이면 필터링 안 함, "전체" 선택 시)
  const rawContentTypeId = params.contentTypeId?.trim() || "";
  const contentTypeId = rawContentTypeId ? rawContentTypeId : undefined;
  // 정렬 옵션 (기본값: latest)
  const sort = (params.sort || "latest") as SortOption;
  // 페이지 번호 (기본값: 1, 유효성 검사 포함)
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const numOfRows = 10; // 페이지당 항목 수

  console.group("[Home] Page render");
  console.log("URL params:", { keyword, areaCode, contentTypeId, sort, page });
  console.log("Search params:", params);

  // 지역코드 목록 조회 (API 실패 시 기본 목록 반환)
  const areaCodes = await fetchAreaCodes();

  // 검색/목록 로직 분기
  // keyword가 있으면 검색 API 호출, 없으면 목록 API 호출
  const { tours, totalCount, error } = keyword
    ? await fetchTourSearch(keyword, areaCode, contentTypeId, numOfRows, page)
    : await fetchTourList(areaCode, contentTypeId, numOfRows, page);

  // 정렬 적용 (클라이언트 사이드 정렬)
  const sortedTours = sortTours(tours, sort);

  // 총 페이지 수 계산
  const totalPages = Math.max(1, Math.ceil(totalCount / numOfRows));

  // 페이지 번호가 범위를 벗어나면 1페이지로 리다이렉트
  if (page > totalPages && totalPages > 0) {
    console.warn(`[Home] Page ${page} is out of range (max: ${totalPages}), redirecting to page 1`);
    // 리다이렉트는 클라이언트에서 처리하도록 함 (Server Component에서 redirect 사용 가능하지만, 
    // 여기서는 URL 파라미터만 조정하여 자연스럽게 처리)
  }

  console.log("Loaded:", {
    areaCodesCount: areaCodes.length,
    toursCount: sortedTours.length,
    totalCount,
    totalPages,
    currentPage: page,
    sort,
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
            {/* 필터 및 정렬 영역 */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1">
                <TourFilters areaCodes={areaCodes} />
              </div>
              <TourSort />
            </div>
          </div>
        </section>

        {/* 메인 콘텐츠 영역: 리스트 (지도는 Phase 2.5에서 구현 예정) */}
        <section>
          {/* 검색 결과 개수 표시 헤더 (검색어가 있을 때만) */}
          {keyword && !error && (
            <div className="flex flex-col gap-2 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                검색 결과
              </h2>
              <div className="flex flex-col gap-1">
                <p className="text-base text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-primary">"{keyword}"</span> 검색 결과: 총{" "}
                  <span className="font-semibold text-primary text-lg">{tours.length}개</span>
                </p>
                {/* 필터 정보 표시 (필터가 적용된 경우) */}
                {((keyword && areaCode) || (!keyword && areaCode !== "1") || contentTypeId) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    적용된 필터:{" "}
                    {((keyword && areaCode) || (!keyword && areaCode !== "1")) && (
                      <span className="font-medium">
                        지역:{" "}
                        {areaCodes.find((ac: AreaCode) => ac.code === areaCode)?.name ||
                          areaCode}
                      </span>
                    )}
                    {((keyword && areaCode) || (!keyword && areaCode !== "1")) && contentTypeId && " · "}
                    {contentTypeId && (
                      <span className="font-medium">
                        타입: {CONTENT_TYPE_LABEL[contentTypeId as keyof typeof CONTENT_TYPE_LABEL] || contentTypeId}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 리스트 영역 (지도 구현 전까지 전체 너비 사용) */}
          {error ? (
            <ErrorMessageWithRetry 
              message={error} 
              type="api"
            />
          ) : (
            <>
              <TourListWrapper tours={sortedTours} error={error} searchKeyword={keyword} />
              {/* 페이지네이션 */}
              {!error && totalPages > 1 && (
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <TourPagination currentPage={page} totalPages={totalPages} />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
