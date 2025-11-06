/**
 * @file tour-list.tsx
 * @description 관광지 목록 컴포넌트
 *
 * 관광지 목록을 그리드 레이아웃으로 표시하는 컴포넌트입니다.
 * TourCard 컴포넌트를 사용하여 개별 관광지 카드를 렌더링합니다.
 *
 * 주요 기능:
 * 1. TourItem 배열을 받아 카드 리스트로 표시
 * 2. 반응형 그리드 레이아웃 (모바일: 1열, 태블릿: 2열, 데스크톱: 2-3열)
 * 3. 빈 상태 처리
 * 4. Spacing-First 정책 준수
 *
 * 핵심 구현 로직:
 * - TourCard 컴포넌트 재사용
 * - 그리드 레이아웃으로 카드 배치
 * - Spacing-First 정책: padding + gap 사용, margin 금지
 * - Tailwind CSS 클래스만 사용 (인라인 style 금지)
 * - 반응형 디자인 (모바일 퍼스트)
 *
 * @dependencies
 * - @/components/tour-card: TourCard 컴포넌트
 * - @/lib/types/tour: TourItem 타입
 *
 * @example
 * ```tsx
 * <TourList tours={tourItems} />
 * ```
 */

import TourCard from "@/components/tour-card";
import type { TourItem } from "@/lib/types/tour";

interface TourListProps {
  tours: TourItem[];
  className?: string;
}

/**
 * 관광지 목록 컴포넌트
 * @param tours - 표시할 관광지 목록 배열
 * @param className - 추가 CSS 클래스
 */
export default function TourList({ tours, className }: TourListProps) {
  // 빈 상태 처리
  if (tours.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center gap-4 p-12 text-center ${className || ""}`}>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          표시할 관광지가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 ${className || ""}`}>
      {tours.map((tour) => (
        <TourCard key={tour.contentid} tour={tour} />
      ))}
    </div>
  );
}

