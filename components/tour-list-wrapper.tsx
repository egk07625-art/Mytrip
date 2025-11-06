/**
 * @file tour-list-wrapper.tsx
 * @description 관광지 목록 래퍼 컴포넌트 (로딩 상태 처리)
 *
 * 필터 변경 시 로딩 상태를 표시하기 위한 Client Component 래퍼입니다.
 * useTransition을 사용하여 필터 변경 시 스켈레톤 UI를 표시합니다.
 *
 * 주요 기능:
 * 1. 필터 변경 시 로딩 상태 표시
 * 2. useTransition을 사용한 부드러운 전환
 * 3. 스켈레톤 UI 표시
 *
 * 핵심 구현 로직:
 * - useTransition으로 pending 상태 관리
 * - pending 상태일 때 스켈레톤 UI 표시
 * - 일반 상태일 때 TourList 표시
 *
 * @dependencies
 * - react: useTransition
 * - @/components/tour-list: TourList 컴포넌트
 * - @/components/tour-list-skeleton: TourListSkeleton 컴포넌트
 * - @/lib/types/tour: TourItem 타입
 */

"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import TourList from "@/components/tour-list";
import TourListSkeleton from "@/components/tour-list-skeleton";
import type { TourItem } from "@/lib/types/tour";

interface TourListWrapperProps {
  /**
   * 관광지 목록 데이터
   */
  tours: TourItem[];
  /**
   * 에러 메시지 (있는 경우)
   */
  error?: string | null;
  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

/**
 * 관광지 목록 래퍼 컴포넌트
 * 필터 변경 시 로딩 상태를 표시합니다.
 * @param tours - 관광지 목록 배열
 * @param error - 에러 메시지
 * @param className - 추가 CSS 클래스
 */
export default function TourListWrapper({ tours, error, className }: TourListWrapperProps) {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [prevFilterKey, setPrevFilterKey] = useState<string>("");

  // 필터 파라미터 추출
  const areaCode = searchParams.get("areaCode") || "";
  const contentTypeId = searchParams.get("contentTypeId") || "";
  const currentFilterKey = `${areaCode}-${contentTypeId}`;

  // 필터가 변경되었는지 감지
  useEffect(() => {
    if (prevFilterKey && prevFilterKey !== currentFilterKey) {
      // 필터가 변경되었을 때 로딩 상태 표시
      setIsLoading(true);
      startTransition(() => {
        // 데이터가 로드되면 로딩 상태 해제
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
      });
    }
    setPrevFilterKey(currentFilterKey);
  }, [currentFilterKey, prevFilterKey]);

  // 에러가 있으면 에러 표시 (TourListWrapper는 에러를 표시하지 않고, 
  // 상위 컴포넌트에서 처리하도록 함)
  if (error) {
    return null; // 에러는 상위에서 처리
  }

  // 로딩 중일 때만 스켈레톤 표시
  if (isLoading || isPending) {
    return <TourListSkeleton count={6} className={className} />;
  }

  // 데이터가 없으면 빈 상태 표시 (TourList에서 처리)
  // 데이터가 있으면 리스트 표시
  return <TourList tours={tours} className={className} />;
}

