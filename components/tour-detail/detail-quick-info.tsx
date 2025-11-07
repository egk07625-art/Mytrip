/**
 * @file detail-quick-info.tsx
 * @description 관광지 상세 페이지 빠른 정보 카드
 *
 * 관광지의 주요 정보를 한눈에 볼 수 있는 빠른 정보 카드 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 운영시간, 입장료, 주차, 반려동물 등 빠른 정보 표시
 * 2. 정보가 없으면 표시하지 않음
 *
 * @dependencies
 * - @/lib/types/tour: TourIntro 타입
 */

import type { TourIntro } from "@/lib/types/tour";

interface DetailQuickInfoProps {
  /**
   * 관광지 운영 정보
   */
  tourIntro?: TourIntro;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 관광지 상세 페이지 빠른 정보 카드
 */
export default function DetailQuickInfo({ tourIntro, className }: DetailQuickInfoProps) {
  if (!tourIntro) {
    return null;
  }

  const quickInfoItems = [
    {
      label: "운영시간",
      value: tourIntro.usetime || tourIntro.opentime || tourIntro.usetimeculture || tourIntro.usetimefestival,
      icon: "⏰",
    },
    {
      label: "입장료",
      value: tourIntro.usefee || tourIntro.entrancefee || tourIntro.usefeeleports || tourIntro.usefee || "무료",
      icon: "💰",
    },
    {
      label: "주차",
      value: tourIntro.parking || tourIntro.parkingculture || tourIntro.parkingleports || "정보 없음",
      icon: "🅿️",
    },
    {
      label: "반려동물",
      value: tourIntro.chkpet || tourIntro.chkpetleash || "정보 없음",
      icon: "🐕",
    },
  ].filter((item) => item.value && item.value !== "정보 없음");

  if (quickInfoItems.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-col gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className || ""}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        💡 빠른 정보
      </h3>
      <div className="flex flex-col gap-3">
        {quickInfoItems.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0" aria-hidden="true">
              {item.icon}
            </span>
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.label}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

