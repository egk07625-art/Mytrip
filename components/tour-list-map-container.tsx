/**
 * @file tour-list-map-container.tsx
 * @description 리스트-지도 연동 컨테이너 컴포넌트
 *
 * 관광지 리스트와 지도를 연결하여 양방향 연동을 제공하는 Client Component입니다.
 * 리스트 항목 클릭 시 지도에서 해당 마커로 이동하고,
 * 마커 클릭 시 리스트에서 해당 항목을 강조합니다.
 *
 * 주요 기능:
 * 1. 선택된 관광지 상태 관리
 * 2. 리스트 클릭 시 지도 이동
 * 3. 마커 클릭 시 콜백 처리
 * 4. 반응형 레이아웃 지원
 *
 * @dependencies
 * - @/components/tour-list-wrapper: TourListWrapper 컴포넌트
 * - @/components/naver-map: NaverMap 컴포넌트
 * - @/components/map-tabs: MapTabs 컴포넌트
 * - @/lib/types/tour: TourItem 타입
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TourListWrapper from "@/components/tour-list-wrapper";
import NaverMap from "@/components/naver-map";
import MapTabs from "@/components/map-tabs";
import TourPagination from "@/components/tour-pagination";
import type { TourItem } from "@/lib/types/tour";

interface TourListMapContainerProps {
  tours: TourItem[];
  error?: string | null;
  searchKeyword?: string;
  currentPage?: number;
  totalPages?: number;
  className?: string;
}

/**
 * 리스트-지도 연동 컨테이너 컴포넌트
 */
export default function TourListMapContainer({
  tours,
  error,
  searchKeyword,
  currentPage = 1,
  totalPages = 1,
  className,
}: TourListMapContainerProps) {
  const [selectedTourId, setSelectedTourId] = useState<string | undefined>();
  const router = useRouter();

  // 마커 클릭 핸들러
  const handleMarkerClick = (tour: TourItem) => {
    setSelectedTourId(tour.contentid);
    // 스크롤은 NaverMap 컴포넌트에서 처리
  };

  // 리스트 항목 클릭 핸들러 (TourCard에서 호출)
  const handleTourClick = (tourId: string) => {
    setSelectedTourId(tourId);
  };

  // 리스트 콘텐츠 (클릭 핸들러 포함)
  const listContent = (
    <div className="flex flex-col gap-8">
      <TourListWrapper
        tours={tours}
        error={error}
        searchKeyword={searchKeyword}
        onTourClick={handleTourClick}
      />
      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <TourPagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );

  // 지도 콘텐츠
  const mapContent = (
    <NaverMap
      tours={tours}
      selectedTourId={selectedTourId}
      onMarkerClick={handleMarkerClick}
    />
  );

  return (
    <div className={className}>
      {/* 모바일: 탭 형태로 리스트/지도 전환 */}
      <div className="lg:hidden">
        <MapTabs listContent={listContent} mapContent={mapContent} />
      </div>

      {/* 데스크톱: 좌우 분할 레이아웃 (50% 리스트, 50% 지도) */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
        {/* 좌측: 리스트 영역 */}
        <div className="flex flex-col">
          {listContent}
        </div>

        {/* 우측: 지도 영역 */}
        <div className="sticky top-24 h-[calc(100vh-120px)] min-h-[600px]">
          <NaverMap
            tours={tours}
            selectedTourId={selectedTourId}
            onMarkerClick={handleMarkerClick}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}

