/**
 * @file tour-sort.tsx
 * @description 관광지 정렬 옵션 컴포넌트
 *
 * 관광지 목록을 정렬하는 Select 컴포넌트입니다.
 * 최신순(modifiedtime 기준)과 이름순(title 가나다순) 옵션을 제공합니다.
 *
 * 주요 기능:
 * 1. 정렬 옵션 선택 (최신순, 이름순)
 * 2. URL 파라미터를 통한 상태 관리
 * 3. 기존 필터/검색 파라미터 유지
 *
 * 핵심 구현 로직:
 * - useRouter와 useSearchParams로 URL 파라미터 관리
 * - 정렬 변경 시 URL 업데이트하여 페이지 재렌더링
 * - Spacing-First 정책 준수 (gap 사용, margin 금지)
 * - Tailwind CSS만 사용 (인라인 style 금지)
 * - 반응형 디자인 (모바일 퍼스트)
 *
 * @dependencies
 * - next/navigation: useRouter, useSearchParams
 * - @/components/ui/select: Select 컴포넌트
 * - @/lib/types/tour: SortOption, SORT_OPTION_LABEL
 * - @/lib/utils/url-params: updateUrlParam
 *
 * @example
 * ```tsx
 * <TourSort />
 * ```
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortOption } from "@/lib/types/tour";
import { SORT_OPTION_LABEL } from "@/lib/types/tour";
import { updateUrlParam } from "@/lib/utils/url-params";

interface TourSortProps {
  className?: string;
}

/**
 * 관광지 정렬 컴포넌트
 * @param className - 추가 CSS 클래스
 */
export default function TourSort({ className }: TourSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 현재 정렬 옵션 가져오기 (기본값: latest)
  const currentSort = (searchParams.get("sort") || "latest") as SortOption;

  /**
   * 정렬 옵션 변경 핸들러
   * 기존 파라미터(검색 키워드, 필터 등)를 유지하면서 정렬만 업데이트합니다.
   */
  const handleSortChange = (value: SortOption) => {
    // URL 파라미터 유틸리티 함수를 사용하여 기존 파라미터 유지
    const newParams = updateUrlParam({
      key: "sort",
      value,
      currentParams: searchParams,
      preserveKeys: ["keyword", "areaCode", "contentTypeId", "sort", "page"],
    });

    // URL 업데이트
    router.push(`/?${newParams}`);
  };

  return (
    <div className={`flex flex-col gap-2 ${className || ""}`}>
      <label
        htmlFor="sort-select"
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        정렬
      </label>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger
          id="sort-select"
          className="w-full sm:w-[180px]"
          aria-label="정렬 옵션 선택"
        >
          <SelectValue placeholder="정렬 선택" />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(SORT_OPTION_LABEL) as SortOption[]).map((option) => (
            <SelectItem key={option} value={option}>
              {SORT_OPTION_LABEL[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}



