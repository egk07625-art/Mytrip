/**
 * @file tour-card.tsx
 * @description 관광지 카드 컴포넌트
 *
 * 관광지 목록을 표시하기 위한 카드 컴포넌트입니다.
 * 관광지의 기본 정보(이미지, 이름, 주소, 타입)를 표시하고,
 * 클릭 시 상세페이지로 이동합니다.
 *
 * 주요 기능:
 * 1. 관광지 이미지 표시 (이미지 없을 경우 플레이스홀더)
 * 2. 관광지명, 주소, 관광 타입 뱃지 표시
 * 3. 카드 클릭 시 상세페이지로 이동
 * 4. 호버 효과 및 반응형 디자인 지원
 *
 * 핵심 구현 로직:
 * - Next.js Image 컴포넌트를 사용한 이미지 최적화
 * - CONTENT_TYPE_LABEL을 사용한 관광 타입 표시
 * - Spacing-First 정책 준수 (padding + gap, margin 금지)
 * - Tailwind CSS 클래스만 사용 (인라인 style 금지)
 * - 다크 모드 지원
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - next/link: 클라이언트 사이드 네비게이션
 * - lucide-react: 아이콘
 * - @/lib/types/tour: TourItem 타입, CONTENT_TYPE_LABEL
 *
 * @example
 * ```tsx
 * <TourCard tour={tourItem} />
 * ```
 */

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { TourItem } from "@/lib/types/tour";
import { CONTENT_TYPE_LABEL } from "@/lib/types/tour";

interface TourCardProps {
  tour: TourItem;
  /**
   * 카드 클릭 핸들러 (리스트-지도 연동용)
   * 기본 동작(상세페이지 이동) 전에 호출됩니다.
   */
  onClick?: () => void;
  className?: string;
}

/**
 * 관광 타입 라벨을 가져오는 헬퍼 함수
 * contenttypeid가 매핑에 없으면 "기타" 반환
 */
function getContentTypeLabel(contenttypeid: string): string {
  return CONTENT_TYPE_LABEL[contenttypeid as keyof typeof CONTENT_TYPE_LABEL] || "기타";
}

/**
 * 이미지 URL이 유효한지 확인하는 헬퍼 함수
 */
function isValidImageUrl(url?: string): boolean {
  return Boolean(url && url.trim().length > 0);
}

export default function TourCard({ tour, onClick, className }: TourCardProps) {
  const imageUrl = tour.firstimage || tour.firstimage2;
  const hasImage = isValidImageUrl(imageUrl);
  const contentTypeLabel = getContentTypeLabel(tour.contenttypeid);
  const detailPageUrl = `/places/${tour.contentid}`;

  const handleClick = () => {
    // 리스트-지도 연동용 클릭 핸들러 호출
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link
      href={detailPageUrl}
      onClick={handleClick}
      className={`block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-300 ease-out overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className || ""}`}
      aria-label={`${tour.title} 관광지 상세보기`}
    >
      {/* 이미지 영역 */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-700">
        {hasImage && imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${tour.title} 이미지`}
            fill
            className="object-cover hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900 dark:to-teal-900">
            <MapPin className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-col gap-2.5 p-4">
        {/* 관광지명 */}
        <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
          {tour.title}
        </h3>

        {/* 주소 및 타입 뱃지 */}
        <div className="flex flex-col gap-1.5">
          {/* 주소 */}
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
              {tour.addr1}
            </span>
          </div>

          {/* 관광 타입 뱃지 */}
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              🎯 {contentTypeLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

