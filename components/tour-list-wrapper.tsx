/**
 * @file tour-list-wrapper.tsx
 * @description 관광지 목록 래퍼 컴포넌트 (로딩 상태 처리)
 *
 * 필터 및 검색 변경 시 로딩 상태를 표시하기 위한 Client Component 래퍼입니다.
 * useTransition을 사용하여 필터/검색 변경 시 스켈레톤 UI를 표시합니다.
 *
 * 주요 기능:
 * 1. 필터 변경 시 로딩 상태 표시
 * 2. 검색어 변경 시 로딩 상태 표시
 * 3. useTransition을 사용한 부드러운 전환
 * 4. 스켈레톤 UI 표시
 *
 * 핵심 구현 로직:
 * - useTransition으로 pending 상태 관리
 * - 필터 및 검색어 변경 감지
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
   * 검색 키워드 (있는 경우)
   */
  searchKeyword?: string;
  /**
   * 관광지 클릭 핸들러 (리스트-지도 연동용)
   */
  onTourClick?: (tourId: string) => void;
  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

/**
 * 관광지 목록 래퍼 컴포넌트
 * 필터 및 검색 변경 시 로딩 상태를 표시합니다.
 * @param tours - 관광지 목록 배열
 * @param error - 에러 메시지
 * @param searchKeyword - 검색 키워드 (선택적)
 * @param className - 추가 CSS 클래스
 */
export default function TourListWrapper({ 
  tours, 
  error, 
  searchKeyword,
  onTourClick,
  className 
}: TourListWrapperProps) {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [prevFilterKey, setPrevFilterKey] = useState<string>("");
  const [prevSearchKey, setPrevSearchKey] = useState<string>("");
  const [prevSortKey, setPrevSortKey] = useState<string>("");
  const [prevPageKey, setPrevPageKey] = useState<string>("");

  // 필터 파라미터 추출
  const areaCode = searchParams.get("areaCode") || "";
  const contentTypeId = searchParams.get("contentTypeId") || "";
  const currentFilterKey = `${areaCode}-${contentTypeId}`;

  // 검색어 파라미터 추출
  const keyword = searchParams.get("keyword") || "";
  const currentSearchKey = keyword;

  // 정렬 파라미터 추출
  const sort = searchParams.get("sort") || "latest";
  const currentSortKey = sort;

  // 페이지 파라미터 추출
  const page = searchParams.get("page") || "1";
  const currentPageKey = page;

  // 필터가 변경되었는지 감지
  useEffect(() => {
    if (prevFilterKey && prevFilterKey !== currentFilterKey) {
      // 필터가 변경되었을 때 로딩 상태 표시
      console.log("[TourListWrapper] 필터 변경 감지 - 로딩 상태 시작");
      setIsLoading(true);
      startTransition(() => {
        // 데이터가 로드되면 로딩 상태 해제 (최소 500ms 표시로 사용자 피드백 개선)
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      });
    }
    setPrevFilterKey(currentFilterKey);
  }, [currentFilterKey, prevFilterKey]);

  // 검색어가 변경되었는지 감지
  useEffect(() => {
    if (prevSearchKey !== currentSearchKey) {
      // 검색어가 변경되었을 때 로딩 상태 표시
      if (prevSearchKey !== "" || currentSearchKey !== "") {
        console.log("[TourListWrapper] 검색어 변경 감지 - 로딩 상태 시작", {
          prev: prevSearchKey,
          current: currentSearchKey,
        });
        setIsLoading(true);
        startTransition(() => {
          // 데이터가 로드되면 로딩 상태 해제 (최소 500ms 표시로 사용자 피드백 개선)
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        });
      }
    }
    setPrevSearchKey(currentSearchKey);
  }, [currentSearchKey, prevSearchKey]);

  // 정렬이 변경되었는지 감지
  useEffect(() => {
    if (prevSortKey && prevSortKey !== currentSortKey) {
      console.log("[TourListWrapper] 정렬 변경 감지 - 로딩 상태 시작", {
        prev: prevSortKey,
        current: currentSortKey,
      });
      setIsLoading(true);
      startTransition(() => {
        setTimeout(() => {
          setIsLoading(false);
        }, 300); // 정렬은 빠르므로 300ms로 단축
      });
    }
    setPrevSortKey(currentSortKey);
  }, [currentSortKey, prevSortKey]);

  // 페이지가 변경되었는지 감지
  useEffect(() => {
    if (prevPageKey && prevPageKey !== currentPageKey) {
      console.log("[TourListWrapper] 페이지 변경 감지 - 로딩 상태 시작", {
        prev: prevPageKey,
        current: currentPageKey,
      });
      setIsLoading(true);
      startTransition(() => {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      });
    }
    setPrevPageKey(currentPageKey);
  }, [currentPageKey, prevPageKey]);

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
  return <TourList tours={tours} searchKeyword={searchKeyword} onTourClick={onTourClick} className={className} />;
}

