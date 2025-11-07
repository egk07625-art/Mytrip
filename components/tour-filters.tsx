/**
 * @file tour-filters.tsx
 * @description 관광지 필터 컴포넌트 (지역/타입)
 *
 * 지역 및 관광 타입 필터를 제공하는 Client Component입니다.
 * 필터 상태는 URL searchParams를 통해 관리되어 Server Component와 동기화됩니다.
 *
 * 주요 기능:
 * 1. 지역 필터 (시/도 단위) - Button 그룹 또는 Select
 * 2. 관광 타입 필터 - Button 그룹
 * 3. 필터 초기화 버튼
 * 4. 필터 활성 상태 시각화
 * 5. URL searchParams를 통한 상태 관리
 *
 * 핵심 구현 로직:
 * - useRouter와 useSearchParams로 URL 파라미터 관리
 * - 필터 변경 시 URL 업데이트하여 페이지 재렌더링
 * - Spacing-First 정책 준수 (gap 사용, margin 금지)
 * - Tailwind CSS만 사용 (인라인 style 금지)
 * - 반응형 디자인 (모바일 퍼스트)
 *
 * @dependencies
 * - next/navigation: useRouter, useSearchParams
 * - @/components/ui/button: Button 컴포넌트
 * - @/lib/types/tour: AreaCode, CONTENT_TYPE, CONTENT_TYPE_LABEL
 * - @/lib/api/tour-api-client: fetchAreaCodes
 *
 * @example
 * ```tsx
 * <TourFilters areaCodes={areaCodes} />
 * ```
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { AreaCode } from "@/lib/types/tour";
import { CONTENT_TYPE, CONTENT_TYPE_LABEL } from "@/lib/types/tour";
import { X } from "lucide-react";
import { updateUrlParam } from "@/lib/utils/url-params";

interface TourFiltersProps {
  areaCodes: AreaCode[];
  className?: string;
}

/**
 * 관광 타입 옵션 (전체 포함)
 */
const CONTENT_TYPE_OPTIONS = [
  { value: "", label: "전체" },
  { value: CONTENT_TYPE.TOURIST_SPOT, label: CONTENT_TYPE_LABEL[CONTENT_TYPE.TOURIST_SPOT] },
  { value: CONTENT_TYPE.CULTURAL_FACILITY, label: CONTENT_TYPE_LABEL[CONTENT_TYPE.CULTURAL_FACILITY] },
  { value: CONTENT_TYPE.FESTIVAL, label: CONTENT_TYPE_LABEL[CONTENT_TYPE.FESTIVAL] },
  { value: CONTENT_TYPE.TRAVEL_COURSE, label: CONTENT_TYPE_LABEL[CONTENT_TYPE.TRAVEL_COURSE] },
  { value: CONTENT_TYPE.LEISURE_SPORTS, label: CONTENT_TYPE_LABEL[CONTENT_TYPE.LEISURE_SPORTS] },
  { value: CONTENT_TYPE.ACCOMMODATION, label: CONTENT_TYPE_LABEL[CONTENT_TYPE.ACCOMMODATION] },
  { value: CONTENT_TYPE.SHOPPING, label: CONTENT_TYPE_LABEL[CONTENT_TYPE.SHOPPING] },
  { value: CONTENT_TYPE.RESTAURANT, label: CONTENT_TYPE_LABEL[CONTENT_TYPE.RESTAURANT] },
] as const;

/**
 * 관광지 필터 컴포넌트
 * @param areaCodes - 지역 코드 목록
 * @param className - 추가 CSS 클래스
 */
export default function TourFilters({ areaCodes, className }: TourFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 현재 필터 값 가져오기
  const currentAreaCode = searchParams.get("areaCode") || "";
  const currentContentTypeId = searchParams.get("contentTypeId") || "";

  // 필터가 활성화되어 있는지 확인
  const hasActiveFilters = Boolean(currentAreaCode || currentContentTypeId);

  /**
   * 필터 업데이트 함수
   * 기존 파라미터(검색 키워드 등)를 유지하면서 필터만 업데이트합니다.
   */
  const updateFilter = (key: string, value: string) => {
    // URL 파라미터 유틸리티 함수를 사용하여 기존 파라미터 유지
    const newParams = updateUrlParam({
      key,
      value,
      currentParams: searchParams,
      preserveKeys: ["keyword", "areaCode", "contentTypeId"],
    });

    // URL 업데이트
    router.push(`/?${newParams}`);
  };

  /**
   * 필터 초기화 함수
   */
  const resetFilters = () => {
    router.push("/");
  };

  return (
    <div
      className={`flex flex-col gap-4 ${className || ""}`}
      role="region"
      aria-label="관광지 필터"
    >
      {/* 필터 설명 (스크린 리더용) */}
      <div id="filter-description" className="sr-only">
        지역과 관광 타입을 선택하여 관광지 목록을 필터링할 수 있습니다.
      </div>

      {/* 지역 필터 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label id="area-filter-label" htmlFor="area-filter-group" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            📍 지역
          </label>
          {hasActiveFilters && currentAreaCode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-6 px-2 gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              aria-label="필터 초기화"
            >
              <X className="size-3" aria-hidden="true" />
            </Button>
          )}
        </div>
        <div
          id="area-filter-group"
          role="group"
          aria-labelledby="area-filter-label"
          className="flex flex-wrap gap-2 overflow-x-auto pb-2"
        >
          <Button
            variant={currentAreaCode === "" ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("areaCode", "")}
            aria-pressed={currentAreaCode === ""}
            aria-label={`지역 필터: 전체${currentAreaCode === "" ? " (선택됨)" : ""}`}
            className={currentAreaCode === "" ? "" : "hover:bg-gray-50 dark:hover:bg-gray-700"}
          >
            전체
          </Button>
          {areaCodes.map((area) => (
            <Button
              key={area.code}
              variant={currentAreaCode === area.code ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter("areaCode", area.code)}
              aria-pressed={currentAreaCode === area.code}
              aria-label={`지역 필터: ${area.name}${currentAreaCode === area.code ? " (선택됨)" : ""}`}
              className={currentAreaCode === area.code ? "" : "hover:bg-gray-50 dark:hover:bg-gray-700"}
            >
              {area.name}
            </Button>
          ))}
        </div>
      </div>

      {/* 관광 타입 필터 */}
      <div className="flex flex-col gap-2">
        <label id="content-type-filter-label" htmlFor="content-type-filter-group" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          🎯 관광타입
        </label>
        <div
          id="content-type-filter-group"
          role="group"
          aria-labelledby="content-type-filter-label"
          className="flex flex-wrap gap-2 overflow-x-auto pb-2"
        >
          {CONTENT_TYPE_OPTIONS.map((option) => (
            <Button
              key={option.value || "all"}
              variant={currentContentTypeId === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter("contentTypeId", option.value)}
              aria-pressed={currentContentTypeId === option.value}
              aria-label={`관광 타입 필터: ${option.label}${currentContentTypeId === option.value ? " (선택됨)" : ""}`}
              className={currentContentTypeId === option.value ? "" : "hover:bg-gray-50 dark:hover:bg-gray-700"}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
