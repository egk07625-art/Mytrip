/**
 * @file detail-map.tsx
 * @description 관광지 상세 페이지 지도 컴포넌트
 *
 * 단일 관광지의 위치를 네이버 지도에 표시하는 컴포넌트입니다.
 * Naver Maps JavaScript API v3 (NCP)를 사용합니다.
 *
 * 주요 기능:
 * 1. 단일 관광지 위치 표시 (마커 1개)
 * 2. 네이버 지도 길찾기 버튼 (웹/앱 연동)
 * 3. 좌표 변환 (KATEC → Naver Maps)
 *
 * 핵심 구현 로직:
 * - Naver Maps API 스크립트 동적 로드
 * - Client Component로 구현 (SSR 비활성화)
 * - 좌표 변환 유틸리티 사용
 * - 지도 중심을 해당 관광지 좌표로 설정
 * - 적절한 줌 레벨 설정 (15-16)
 * - 좌표가 없는 경우 에러 메시지 표시
 *
 * @dependencies
 * - Naver Maps JavaScript API v3 (NCP)
 * - @/lib/types/tour: TourDetail 타입, Coordinate 타입
 * - @/lib/utils/coordinate: convertKATECToNaver 함수
 * - @/components/ui/button: Button 컴포넌트
 * - lucide-react: Navigation 아이콘
 *
 * @example
 * ```tsx
 * <DetailMap tourDetail={tourDetail} />
 * ```
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TourDetail } from "@/lib/types/tour";
import { convertKATECToNaver } from "@/lib/utils/coordinate";

interface DetailMapProps {
  /**
   * 관광지 상세 정보
   */
  tourDetail: TourDetail;
  /**
   * 추가 클래스명
   */
  className?: string;
}

// Naver Maps API 타입 정의
declare global {
  interface Window {
    naver?: {
      maps: {
        Map: new (element: HTMLElement, options: any) => any;
        Marker: new (options: any) => any;
        InfoWindow: new (options: any) => any;
        LatLng: new (lat: number, lng: number) => any;
        LatLngBounds: new () => any;
        event: {
          addListener: (target: any, event: string, handler: () => void) => void;
        };
      };
    };
  }
}

/**
 * 네이버 지도 API 스크립트 로드
 * @param apiKey - 네이버 지도 API 키
 * @param timeout - 타임아웃 시간 (밀리초)
 * @returns Promise<void>
 */
function loadNaverMapScript(
  apiKey: string,
  timeout = 10000
): Promise<void> {
  return new Promise((resolve, reject) => {
    // 이미 로드되어 있는지 확인
    if (window.naver?.maps) {
      resolve();
      return;
    }

    // 이미 스크립트가 로드 중인지 확인
    const existingScript = document.querySelector(
      `script[src*="navermaps.github.io"]`
    );
    if (existingScript) {
      // 스크립트가 로드 중이면 onload 이벤트 대기
      const checkInterval = setInterval(() => {
        if (window.naver?.maps) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.naver?.maps) {
          reject(new Error("Script load timeout"));
        }
      }, timeout);

      return;
    }

    // 스크립트 생성 및 로드
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${apiKey}`;
    script.async = true;

    const timer = setTimeout(() => {
      reject(new Error("Script load timeout"));
    }, timeout);

    script.onload = () => {
      clearTimeout(timer);
      // 스크립트 로드 후 약간의 지연을 두고 확인
      setTimeout(() => {
        if (window.naver?.maps) {
          resolve();
        } else {
          reject(new Error("Naver Maps API not available"));
        }
      }, 100);
    };

    script.onerror = () => {
      clearTimeout(timer);
      reject(new Error("Script load failed"));
    };

    document.head.appendChild(script);
  });
}

/**
 * 지도 에러 플레이스홀더 컴포넌트
 */
function MapErrorPlaceholder({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className || ""}`}
      style={{ minHeight: "400px" }}
      role="alert"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 p-8 text-center max-w-md">
        <div className="text-6xl">⚠️</div>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            지도를 불러올 수 없습니다
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * 지도 로딩 스켈레톤 컴포넌트
 */
function MapLoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse ${className || ""}`}
      style={{ minHeight: "400px" }}
      role="status"
      aria-label="지도 로딩 중"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          지도를 불러오는 중...
        </p>
      </div>
    </div>
  );
}

/**
 * 네이버 지도 길찾기 URL 생성
 * @param lat - 위도
 * @param lng - 경도
 * @param isMobile - 모바일 여부
 * @returns 길찾기 URL
 */
function getDirectionsUrl(lat: number, lng: number, isMobile: boolean): string {
  if (isMobile) {
    // 네이버 지도 앱 링크 (모바일)
    return `nmap://route/car?dlat=${lat}&dlng=${lng}`;
  } else {
    // 네이버 지도 웹 링크 (데스크톱)
    return `https://map.naver.com/v5/directions/${lng},${lat}`;
  }
}

/**
 * 모바일 기기 감지
 */
function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * 관광지 상세 페이지 지도 컴포넌트
 */
export default function DetailMap({
  tourDetail,
  className,
}: DetailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // API 키 확인
  const apiKey =
    process.env.NEXT_PUBLIC_NAVER_MAP_NCP_KEY_ID ||
    process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  // 좌표 변환
  useEffect(() => {
    console.group("[DetailMap] 좌표 변환");
    console.log("TourDetail:", tourDetail.title);
    console.log("mapx:", tourDetail.mapx, "mapy:", tourDetail.mapy);

    if (!tourDetail.mapx || !tourDetail.mapy) {
      console.warn("[DetailMap] 좌표 데이터가 없습니다");
      setError("위치 정보가 없습니다.");
      setLoading(false);
      console.groupEnd();
      return;
    }

    const coord = convertKATECToNaver(tourDetail.mapx, tourDetail.mapy);
    if (!coord) {
      console.error("[DetailMap] 좌표 변환 실패");
      setError("좌표를 변환할 수 없습니다.");
      setLoading(false);
      console.groupEnd();
      return;
    }

    console.log("[DetailMap] 변환된 좌표:", coord);
    setCoordinates({ lat: coord.lat, lng: coord.lng });
    console.groupEnd();
  }, [tourDetail.mapx, tourDetail.mapy, tourDetail.title]);

  // 지도 초기화
  useEffect(() => {
    if (!apiKey) {
      console.error("[DetailMap] API 키가 설정되지 않았습니다");
      setError("네이버 지도 API 키가 설정되지 않았습니다. 환경변수를 확인해주세요.");
      setLoading(false);
      return;
    }

    if (!mapRef.current || !coordinates) {
      return;
    }

    let isMounted = true;

    // 스크립트 로드 및 지도 초기화
    loadNaverMapScript(apiKey)
      .then(() => {
        if (!isMounted || !mapRef.current || !window.naver?.maps || !coordinates) {
          return;
        }

        console.group("[DetailMap] 지도 초기화");
        console.log("좌표:", coordinates);

        const { maps } = window.naver;

        // 지도 중심 좌표 설정
        const mapCenter = new maps.LatLng(coordinates.lat, coordinates.lng);

        // 지도 초기화
        mapInstanceRef.current = new maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: 15, // 적절한 줌 레벨
        });

        // 마커 생성
        markerRef.current = new maps.Marker({
          position: mapCenter,
          map: mapInstanceRef.current,
        });

        // 인포윈도우 생성
        const infoWindowContent = `
          <div style="padding: 10px; min-width: 200px;">
            <div style="font-weight: bold; margin-bottom: 5px;">${tourDetail.title}</div>
            <div style="font-size: 12px; color: #666;">${tourDetail.addr1 || ""}</div>
          </div>
        `;

        infoWindowRef.current = new maps.InfoWindow({
          content: infoWindowContent,
        });

        // 마커 클릭 시 인포윈도우 표시
        maps.event.addListener(markerRef.current, "click", () => {
          infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
        });

        // 초기 인포윈도우 표시
        infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);

        console.log("[DetailMap] 지도 초기화 완료");
        console.groupEnd();

        setLoading(false);
      })
      .catch((err) => {
        console.error("[DetailMap] 지도 초기화 실패:", err);
        setError("지도를 불러올 수 없습니다. 다시 시도해주세요.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [apiKey, coordinates, tourDetail.title, tourDetail.addr1]);

  // 길찾기 버튼 클릭 핸들러
  const handleDirectionsClick = () => {
    if (!coordinates) {
      return;
    }

    const isMobile = isMobileDevice();
    const url = getDirectionsUrl(coordinates.lat, coordinates.lng, isMobile);

    console.group("[DetailMap] 길찾기 버튼 클릭");
    console.log("URL:", url);
    console.log("모바일:", isMobile);
    console.groupEnd();

    // 새 창에서 열기
    window.open(url, "_blank");
  };

  // 에러 상태
  if (error) {
    return <MapErrorPlaceholder message={error} className={className} />;
  }

  // 로딩 상태
  if (loading) {
    return <MapLoadingSkeleton className={className} />;
  }

  // 좌표가 없는 경우
  if (!coordinates) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className || ""}`}
        style={{ minHeight: "400px" }}
      >
        <div className="flex flex-col items-center gap-4 p-8 text-center max-w-md">
          <div className="text-6xl">📍</div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              위치 정보 없음
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              이 관광지의 위치 정보가 제공되지 않습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 지도 컨테이너
  return (
    <div className={`flex flex-col gap-4 ${className || ""}`}>
      <div
        ref={mapRef}
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
        style={{ minHeight: "400px" }}
        role="application"
        aria-label="네이버 지도"
      />
      <Button
        onClick={handleDirectionsClick}
        className="w-full"
        variant="default"
      >
        <Navigation className="w-4 h-4 mr-2" />
        길찾기
      </Button>
    </div>
  );
}

