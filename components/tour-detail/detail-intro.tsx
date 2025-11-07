/**
 * @file detail-intro.tsx
 * @description 관광지 상세 페이지 운영 정보 컴포넌트
 *
 * 관광지의 운영 정보(이용시간, 휴무일, 주차, 문의처 등)를 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 이용시간, 휴무일, 주차 가능 여부 등 운영 정보 표시
 * 2. contentTypeId에 따라 다른 필드 표시 (동적 필드 렌더링)
 * 3. 빈 값 필드는 표시하지 않음
 *
 * 핵심 구현 로직:
 * - Server Component로 구현 (데이터 fetching)
 * - fetchTourIntro로 운영 정보 가져오기
 * - Spacing-First 정책 준수 (padding + gap, margin 금지)
 * - Tailwind CSS 클래스만 사용 (인라인 style 금지)
 * - 다크 모드 지원
 *
 * @dependencies
 * - @/lib/api/tour-api-client: fetchTourIntro 함수
 * - @/lib/types/tour: TourIntro 타입
 * - lucide-react: 아이콘
 *
 * @example
 * ```tsx
 * <DetailIntro contentId="123456" contentTypeId="12" />
 * ```
 */

import {
  Clock,
  Calendar,
  Car,
  Phone,
  CreditCard,
  Baby,
  Dog,
  Info,
} from "lucide-react";
import { fetchTourIntro } from "@/lib/api/tour-api-client";
import ErrorMessageWithRetry from "@/components/error-message-with-retry";

interface DetailIntroProps {
  /**
   * 관광지 콘텐츠 ID
   */
  contentId: string;
  /**
   * 관광지 타입 ID (필수)
   */
  contentTypeId: string;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 운영 정보 필드 라벨 매핑
 */
const INTRO_FIELD_LABELS: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  usetime: { label: "이용시간", icon: Clock },
  restdate: { label: "휴무일", icon: Calendar },
  parking: { label: "주차 가능", icon: Car },
  infocenter: { label: "문의처", icon: Phone },
  chkcreditcard: { label: "신용카드 가능", icon: CreditCard },
  chkbabycarriage: { label: "유모차 대여", icon: Baby },
  chkpet: { label: "반려동물 동반", icon: Dog },
  expguide: { label: "체험 안내", icon: Info },
  expagerange: { label: "체험 가능 연령", icon: Info },
};

/**
 * 운영 정보 필드 표시 순서
 */
const INTRO_FIELD_ORDER = [
  "usetime",
  "restdate",
  "parking",
  "infocenter",
  "chkcreditcard",
  "chkbabycarriage",
  "chkpet",
  "expguide",
  "expagerange",
];

/**
 * 운영 정보 필드가 표시 가능한지 확인하는 함수
 */
function hasValue(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

/**
 * 운영 정보 컴포넌트 (Server Component)
 */
export default async function DetailIntro({
  contentId,
  contentTypeId,
  className,
}: DetailIntroProps) {
  console.group("[DetailIntro] Fetching tour intro");
  console.log("Content ID:", contentId);
  console.log("Content Type ID:", contentTypeId);

  const tourIntro = await fetchTourIntro(contentId, contentTypeId);

  if (!tourIntro) {
    console.warn("[DetailIntro] Tour intro not found");
    console.groupEnd();
    return (
      <ErrorMessageWithRetry
        message="운영 정보를 불러올 수 없습니다."
        type="api"
      />
    );
  }

  console.log("[DetailIntro] Tour intro loaded");
  console.groupEnd();

  // 표시할 필드만 필터링
  const displayFields = INTRO_FIELD_ORDER.filter((field) => {
    const value = tourIntro[field];
    return hasValue(value);
  });

  // 표시할 필드가 없으면 빈 상태 표시
  if (displayFields.length === 0) {
    return (
      <section
        className={`flex flex-col gap-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className || ""}`}
      >
        <div className="flex flex-col gap-4 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            운영 정보
          </h2>
          <p className="text-base text-gray-500 dark:text-gray-400">
            운영 정보가 없습니다.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`flex flex-col gap-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className || ""}`}
    >
      {/* 섹션 제목 */}
      <div className="flex flex-col gap-4 p-6 pb-0">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          운영 정보
        </h2>
      </div>

      {/* 운영 정보 목록 */}
      <div className="flex flex-col gap-4 p-6 pt-0">
        {displayFields.map((field) => {
          const value = tourIntro[field];
          const fieldConfig = INTRO_FIELD_LABELS[field];
          const Icon = fieldConfig?.icon || Info;

          if (!value || !fieldConfig) return null;

          return (
            <div key={field} className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {fieldConfig.label}
                  </span>
                  <p className="text-base text-gray-900 dark:text-white leading-relaxed whitespace-pre-line">
                    {value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

