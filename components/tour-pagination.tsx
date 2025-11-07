/**
 * @file tour-pagination.tsx
 * @description 관광지 목록 페이지네이션 컴포넌트
 *
 * 관광지 목록을 페이지별로 탐색할 수 있는 페이지네이션 컴포넌트입니다.
 * 이전/다음 버튼과 페이지 번호 버튼을 제공합니다.
 *
 * 주요 기능:
 * 1. 페이지 번호 표시 및 이동
 * 2. 이전/다음 페이지 버튼
 * 3. URL 파라미터를 통한 상태 관리
 * 4. 기존 필터/검색/정렬 파라미터 유지
 *
 * 핵심 구현 로직:
 * - useRouter와 useSearchParams로 URL 파라미터 관리
 * - 페이지 변경 시 URL 업데이트하여 페이지 재렌더링
 * - Spacing-First 정책 준수 (gap 사용, margin 금지)
 * - Tailwind CSS만 사용 (인라인 style 금지)
 * - 반응형 디자인 (모바일 퍼스트)
 *
 * @dependencies
 * - next/navigation: useRouter, useSearchParams
 * - @/components/ui/button: Button 컴포넌트
 * - lucide-react: ChevronLeft, ChevronRight 아이콘
 * - @/lib/utils/url-params: updateUrlParam
 *
 * @example
 * ```tsx
 * <TourPagination currentPage={1} totalPages={10} />
 * ```
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { updateUrlParam } from "@/lib/utils/url-params";

interface TourPaginationProps {
  /**
   * 현재 페이지 번호 (1부터 시작)
   */
  currentPage: number;
  /**
   * 전체 페이지 수
   */
  totalPages: number;
  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

/**
 * 관광지 페이지네이션 컴포넌트
 * @param currentPage - 현재 페이지 번호
 * @param totalPages - 전체 페이지 수
 * @param className - 추가 CSS 클래스
 */
export default function TourPagination({
  currentPage,
  totalPages,
  className,
}: TourPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 페이지가 1개 이하면 페이지네이션 표시 안 함
  if (totalPages <= 1) {
    return null;
  }

  /**
   * 페이지 변경 핸들러
   * 기존 파라미터(검색 키워드, 필터, 정렬 등)를 유지하면서 페이지만 업데이트합니다.
   */
  const handlePageChange = (page: number) => {
    // 페이지 범위 검증
    if (page < 1 || page > totalPages) {
      return;
    }

    // URL 파라미터 유틸리티 함수를 사용하여 기존 파라미터 유지
    const newParams = updateUrlParam({
      key: "page",
      value: page.toString(),
      currentParams: searchParams,
      preserveKeys: ["keyword", "areaCode", "contentTypeId", "sort", "page"],
    });

    // URL 업데이트
    router.push(`/?${newParams}`);

    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * 표시할 페이지 번호 배열 생성
   * 현재 페이지 주변의 페이지 번호만 표시
   */
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisible = 5; // 최대 표시할 페이지 번호 개수

    if (totalPages <= maxVisible) {
      // 전체 페이지가 적으면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지를 중심으로 표시
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(totalPages, start + maxVisible - 1);

      // 끝에 가까우면 시작점 조정
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <nav
      className={`flex flex-col items-center gap-4 ${className || ""}`}
      role="navigation"
      aria-label="페이지네이션"
    >
      {/* 페이지 정보 */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {currentPage} / {totalPages} 페이지
      </div>

      {/* 페이지네이션 버튼 */}
      <div className="flex items-center gap-2">
        {/* 이전 페이지 버튼 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={isFirstPage}
          aria-label="이전 페이지"
          aria-disabled={isFirstPage}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          <span className="sr-only">이전</span>
        </Button>

        {/* 페이지 번호 버튼 */}
        <div className="flex items-center gap-1">
          {/* 첫 페이지가 표시 범위에 없으면 첫 페이지와 생략 표시 */}
          {pageNumbers[0] > 1 && (
            <>
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(1)}
                aria-label="1페이지로 이동"
                aria-current={currentPage === 1 ? "page" : undefined}
              >
                1
              </Button>
              {pageNumbers[0] > 2 && (
                <span className="px-2 text-gray-500 dark:text-gray-400">
                  ...
                </span>
              )}
            </>
          )}

          {/* 페이지 번호 버튼들 */}
          {pageNumbers.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
              aria-label={`${page}페이지로 이동`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </Button>
          ))}

          {/* 마지막 페이지가 표시 범위에 없으면 생략 표시와 마지막 페이지 */}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="px-2 text-gray-500 dark:text-gray-400">
                  ...
                </span>
              )}
              <Button
                variant={currentPage === totalPages ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                aria-label={`${totalPages}페이지로 이동`}
                aria-current={currentPage === totalPages ? "page" : undefined}
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>

        {/* 다음 페이지 버튼 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={isLastPage}
          aria-label="다음 페이지"
          aria-disabled={isLastPage}
        >
          <span className="sr-only">다음</span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}



