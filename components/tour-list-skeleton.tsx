/**
 * @file tour-list-skeleton.tsx
 * @description 관광지 목록 스켈레톤 UI 컴포넌트
 *
 * 관광지 목록이 로딩 중일 때 표시되는 스켈레톤 UI입니다.
 * TourCard의 레이아웃과 동일한 구조로 스켈레톤을 표시하여
 * 로딩 상태를 자연스럽게 표현합니다.
 *
 * 주요 기능:
 * 1. TourCard와 동일한 레이아웃 구조
 * 2. 반응형 그리드 레이아웃 (모바일: 1열, 태블릿: 2열, 데스크톱: 3열)
 * 3. Spacing-First 정책 준수
 *
 * 핵심 구현 로직:
 * - shadcn/ui Skeleton 컴포넌트 사용
 * - TourCard와 동일한 그리드 레이아웃
 * - Spacing-First 정책: padding + gap 사용, margin 금지
 * - Tailwind CSS 클래스만 사용 (인라인 style 금지)
 * - 반응형 디자인 (모바일 퍼스트)
 *
 * @dependencies
 * - @/components/ui/skeleton: Skeleton 컴포넌트
 *
 * @example
 * ```tsx
 * <TourListSkeleton count={6} />
 * ```
 */

import { Skeleton } from "@/components/ui/skeleton";

interface TourListSkeletonProps {
  /**
   * 표시할 스켈레톤 카드 개수
   * @default 6
   */
  count?: number;
  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

/**
 * 관광지 목록 스켈레톤 컴포넌트
 * @param count - 표시할 스켈레톤 카드 개수
 * @param className - 추가 CSS 클래스
 */
export default function TourListSkeleton({ count = 6, className }: TourListSkeletonProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 lg:gap-6 ${className || ""}`}
      role="status"
      aria-label="관광지 목록 로딩 중"
      aria-live="polite"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden"
        >
          {/* 이미지 영역 스켈레톤 */}
          <div className="relative w-full aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
            <Skeleton className="w-full h-full" />
          </div>

          {/* 정보 영역 스켈레톤 */}
          <div className="flex flex-col gap-3 p-4 md:p-6">
            {/* 관광지명 스켈레톤 */}
            <Skeleton className="h-6 w-3/4" />

            {/* 주소 및 타입 뱃지 스켈레톤 */}
            <div className="flex flex-col gap-2">
              {/* 주소 스켈레톤 */}
              <Skeleton className="h-4 w-full" />

              {/* 타입 뱃지 스켈레톤 */}
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

