/**
 * @file naver-map.tsx
 * @description 네이버 지도 컴포넌트
 *
 * 관광지 목록을 네이버 지도에 마커로 표시하는 컴포넌트입니다.
 * Naver Maps JavaScript API v3 (NCP)를 사용합니다.
 *
 * 주요 기능:
 * 1. 관광지 목록을 마커로 표시
 * 2. 마커 클릭 시 인포윈도우 표시
 * 3. 리스트-지도 연동 (선택된 관광지로 지도 이동)
 * 4. 좌표 변환 (KATEC → Naver Maps)
 *
 * 핵심 구현 로직:
 * - Naver Maps API 스크립트 동적 로드
 * - Client Component로 구현 (SSR 비활성화)
 * - 좌표 변환 유틸리티 사용
 * - 지도 중심 좌표 자동 계산 (bounds 기반)
 * - 마커 및 인포윈도우 관리
 *
 * @dependencies
 * - Naver Maps JavaScript API v3 (NCP)
 * - @/lib/types/tour: TourItem 타입
 * - @/lib/utils/coordinate: 좌표 변환 유틸리티
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TourItem } from "@/lib/types/tour";
import {
  convertToursToCoordinates,
  calculateCenter,
  calculateBounds,
} from "@/lib/utils/coordinate";
import { CONTENT_TYPE_LABEL } from "@/lib/types/tour";

interface NaverMapProps {
  tours: TourItem[];
  selectedTourId?: string; // 리스트에서 선택된 관광지 ID
  onMarkerClick?: (tour: TourItem) => void; // 마커 클릭 콜백
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
      style={{ minHeight: "600px" }}
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

// MapLoadingSkeleton은 현재 사용되지 않으므로 제거
// 필요시 인라인 로딩 UI 사용

/**
 * 네이버 지도 컴포넌트
 */
export default function NaverMap({
  tours,
  selectedTourId,
  onMarkerClick,
  className,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const infoWindowsRef = useRef<Map<string, any>>(new Map());
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapRefReady, setMapRefReady] = useState(false);

  // API 키 확인
  const apiKey =
    process.env.NEXT_PUBLIC_NAVER_MAP_NCP_KEY_ID ||
    process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  // mapRef 연결 확인 (주기적으로 확인)
  useEffect(() => {
    // mapRef가 이미 연결되어 있으면 즉시 설정
    if (mapRef.current) {
      console.log("[NaverMap] mapRef 연결 확인됨 (즉시)");
      setMapRefReady(true);
      return;
    }

    const checkMapRef = () => {
      if (mapRef.current) {
        console.log("[NaverMap] mapRef 연결 확인됨");
        setMapRefReady(true);
        return true;
      }
      return false;
    };

    // 주기적으로 확인 (최대 2초)
    const intervalId = setInterval(() => {
      if (checkMapRef()) {
        clearInterval(intervalId);
      }
    }, 100);

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      if (!mapRefReady) {
        console.warn("[NaverMap] mapRef 연결 타임아웃 (2초)");
      }
    }, 2000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []); // 마운트 시 한 번만 실행

  // 지도 초기화 (스크립트 로드 및 지도 인스턴스 생성만)
  useEffect(() => {
    console.group("[NaverMap] 지도 초기화 시작");
    console.log("[NaverMap] API 키:", apiKey ? "설정됨" : "없음");
    console.log("[NaverMap] tours 개수:", tours.length);
    console.log("[NaverMap] mapRef.current:", mapRef.current ? "존재" : "없음");
    console.log("[NaverMap] mapRefReady:", mapRefReady);

    if (!apiKey) {
      console.error("[NaverMap] API 키가 없습니다");
      setError("네이버 지도 API 키가 설정되지 않았습니다. 환경변수를 확인해주세요.");
      setLoading(false);
      console.groupEnd();
      return;
    }

    // mapRef가 연결되지 않았으면 대기
    if (!mapRefReady || !mapRef.current) {
      console.warn("[NaverMap] mapRef가 아직 연결되지 않았습니다. 대기 중...");
      console.groupEnd();
      return;
    }

    // 이미 지도 인스턴스가 있으면 스킵
    if (mapInstanceRef.current) {
      console.log("[NaverMap] 지도 인스턴스가 이미 존재합니다");
      setLoading(false);
      console.groupEnd();
      return;
    }

    let isMounted = true;

    // 스크립트 로드 및 지도 초기화
    console.log("[NaverMap] 스크립트 로드 시작");
    loadNaverMapScript(apiKey)
      .then(() => {
        console.log("[NaverMap] 스크립트 로드 완료");
        if (!isMounted || !mapRef.current || !window.naver?.maps) {
          console.warn("[NaverMap] 초기화 조건 불만족:", {
            isMounted,
            mapRef: !!mapRef.current,
            naverMaps: !!window.naver?.maps,
          });
          console.groupEnd();
          return;
        }

        const maps = window.naver.maps;
        console.log("[NaverMap] Naver Maps API 사용 가능");

        // 지도 컨테이너 크기 확인
        // 네이버 지도 API는 컨테이너 크기가 0이면 타일을 렌더링하지 않음
        if (!mapRef.current) {
          console.error("[NaverMap] mapRef.current가 null입니다");
          setError("지도 컨테이너를 찾을 수 없습니다.");
          setLoading(false);
          console.groupEnd();
          return;
        }

        const rect = mapRef.current.getBoundingClientRect();
        const containerWidth = rect.width || mapRef.current.clientWidth;
        const containerHeight = rect.height || mapRef.current.clientHeight;

        console.log("[NaverMap] 지도 컨테이너 크기:", {
          width: containerWidth,
          height: containerHeight,
          rectWidth: rect.width,
          rectHeight: rect.height,
          clientWidth: mapRef.current.clientWidth,
          clientHeight: mapRef.current.clientHeight,
        });

        // 컨테이너 크기가 0이면 지도 생성을 지연
        if (containerWidth === 0 || containerHeight === 0) {
          console.warn("[NaverMap] 컨테이너 크기가 0입니다. 지도 생성을 지연합니다.");
          
          // 여러 번 재시도 (최대 5회, 총 1초)
          let retryCount = 0;
          const maxRetries = 5;
          const retryDelay = 200;
          
          const retryTimer = setInterval(() => {
            if (!isMounted || !mapRef.current) {
              clearInterval(retryTimer);
              console.groupEnd();
              return;
            }
            
            retryCount++;
            const retryRect = mapRef.current.getBoundingClientRect();
            const retryWidth = retryRect.width || mapRef.current.clientWidth;
            const retryHeight = retryRect.height || mapRef.current.clientHeight;
            
            console.log(`[NaverMap] 재시도 ${retryCount}/${maxRetries}: 크기 = ${retryWidth}x${retryHeight}`);
            
            if (retryWidth > 0 && retryHeight > 0) {
              clearInterval(retryTimer);
              console.log("[NaverMap] 컨테이너 크기 확인됨, 지도 생성");
              // 지도 생성
              const defaultCenter = new maps.LatLng(37.5665, 126.978);
              mapInstanceRef.current = new maps.Map(mapRef.current, {
                center: defaultCenter,
                zoom: 10,
              });
              console.log("[NaverMap] 지도 인스턴스 생성 완료 (재시도 성공)");
              setLoading(false);
              console.log("[NaverMap] 지도 초기화 완료");
              console.groupEnd();
            } else if (retryCount >= maxRetries) {
              clearInterval(retryTimer);
              console.error("[NaverMap] 컨테이너 크기를 확인할 수 없습니다 (최대 재시도 횟수 초과)");
              setError("지도 컨테이너의 크기를 확인할 수 없습니다. 페이지를 새로고침해주세요.");
              setLoading(false);
              console.groupEnd();
            }
          }, retryDelay);
          
          return () => {
            clearInterval(retryTimer);
          };
        }

        // 지도는 기본 중심 좌표로 초기화
        // 중심 좌표와 마커는 두 번째 useEffect에서 처리
        const defaultCenter = new maps.LatLng(37.5665, 126.978); // 서울

        // 지도 초기화
        console.log("[NaverMap] 지도 인스턴스 생성 시작");
        
        // 지도 타입 설정 (네이버 지도 API v3)
        // MapTypeId는 타입 정의에 없으므로 타입 단언 사용
        const mapTypeId = (maps as any).MapTypeId?.NORMAL || (maps as any).MapTypeId?.normal || 'normal';
        
        const mapOptions: any = {
          center: defaultCenter,
          zoom: 10,
        };
        
        // mapTypeId가 존재하면 추가
        if (mapTypeId && mapTypeId !== 'normal') {
          mapOptions.mapTypeId = mapTypeId;
        }
        
        mapInstanceRef.current = new maps.Map(mapRef.current, mapOptions);
        console.log("[NaverMap] 지도 인스턴스 생성 완료", { mapTypeId });

        // 지도 이벤트 리스너 추가 (타일 로드 확인)
        // Event는 타입 정의에 없으므로 타입 단언 사용
        const eventAPI = (maps as any).Event || maps.event;
        if (eventAPI && eventAPI.addListener) {
          // 지도가 완전히 로드되었을 때 확인
          eventAPI.addListener(mapInstanceRef.current, 'idle', () => {
            console.log("[NaverMap] 지도 idle 이벤트 발생 - 타일 로드 완료");
          });

          // 지도 타일이 로드되었을 때 확인
          eventAPI.addListener(mapInstanceRef.current, 'tilesloaded', () => {
            console.log("[NaverMap] 지도 타일 로드 완료");
          });
        }

        // 지도 컨테이너가 실제로 보이는지 확인
        if (mapRef.current) {
          const computedStyle = window.getComputedStyle(mapRef.current);
          console.log("[NaverMap] 지도 컨테이너 스타일:", {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            width: computedStyle.width,
            height: computedStyle.height,
            zIndex: computedStyle.zIndex,
          });

          // 컨테이너가 보이지 않으면 경고
          if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
            console.warn("[NaverMap] 지도 컨테이너가 보이지 않는 상태입니다!");
          }
        }

        // 지도 인스턴스 생성 완료 후 약간의 지연을 두고 로딩 종료
        // 타일이 로드될 시간을 제공
        setTimeout(() => {
          if (isMounted) {
            setLoading(false);
            console.log("[NaverMap] 지도 초기화 완료");
            console.groupEnd();
          }
        }, 300);
      })
      .catch((err) => {
        if (!isMounted) {
          console.groupEnd();
          return;
        }
        console.error("[NaverMap] 지도 로드 실패:", err);
        setError(
          `지도를 불러올 수 없습니다: ${err instanceof Error ? err.message : "알 수 없는 오류"}`
        );
        setLoading(false);
        console.groupEnd();
      });

    return () => {
      isMounted = false;
      console.log("[NaverMap] cleanup 실행");
    };
  }, [apiKey, mapRefReady, tours.length]); // apiKey, mapRefReady, tours.length를 의존성으로 추가

  // 관광지 목록 변경 시 마커 업데이트
  useEffect(() => {
    console.group("[NaverMap] 마커 업데이트 시작");
    console.log("[NaverMap] 조건 체크:", {
      mapInstance: !!mapInstanceRef.current,
      naverMaps: !!window.naver?.maps,
      loading,
      error,
      toursCount: tours.length,
    });

    if (!mapInstanceRef.current || !window.naver?.maps || loading || error) {
      console.log("[NaverMap] 마커 업데이트 스킵 (조건 불만족)");
      console.groupEnd();
      return;
    }

    // maps 객체 전체 참조 (구조 분해 할당 시 event 속성이 누락될 수 있음)
    const maps = window.naver.maps;
    
    // Event API 확인
    // Event는 타입 정의에 없으므로 타입 단언 사용
    if (!(maps as any).Event && !maps.event) {
      console.error("[NaverMap] Event API를 찾을 수 없습니다:", {
        mapsKeys: Object.keys(maps),
        hasEvent: !!maps.event,
        hasEventCapital: !!(maps as any).Event,
      });
      console.groupEnd();
      return;
    }

    // 기존 마커 제거
    console.log("[NaverMap] 기존 마커 제거:", markersRef.current.size);
    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current.clear();
    infoWindowsRef.current.clear();

    // 좌표 변환
    const coordinateMap = convertToursToCoordinates(tours);
    const validTours = tours.filter((tour) =>
      coordinateMap.has(tour.contentid)
    );

    console.log("[NaverMap] 유효한 관광지:", validTours.length, "/", tours.length);

    if (validTours.length === 0) {
      console.log("[NaverMap] 유효한 관광지가 없어 마커를 생성하지 않습니다");
      console.groupEnd();
      return;
    }

    // 중심 좌표 재계산
    const center = calculateCenter(coordinateMap);
    const bounds = calculateBounds(coordinateMap);

    if (center && bounds) {
      const mapCenter = new maps.LatLng(center.lat, center.lng);
      // LatLngBounds는 타입 정의와 다르게 인자를 받을 수 있으므로 타입 단언 사용
      const mapBounds = new (maps.LatLngBounds as any)(
        new maps.LatLng(bounds.minLat, bounds.minLng),
        new maps.LatLng(bounds.maxLat, bounds.maxLng)
      );

      mapInstanceRef.current.setCenter(mapCenter);
      if (validTours.length > 1) {
        mapInstanceRef.current.fitBounds(mapBounds);
        console.log("[NaverMap] 지도 중심 및 bounds 조정 완료");
      } else {
        console.log("[NaverMap] 지도 중심 조정 완료 (단일 마커)");
      }
    }

    // 마커 재생성
    console.log("[NaverMap] 마커 생성 시작");
    validTours.forEach((tour) => {
      const coord = coordinateMap.get(tour.contentid);
      if (!coord) {
        console.warn("[NaverMap] 좌표 없음:", tour.contentid);
        return;
      }

      const position = new maps.LatLng(coord.lat, coord.lng);

      const marker = new maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: tour.title,
      });

      markersRef.current.set(tour.contentid, marker);

      const contentTypeLabel =
        CONTENT_TYPE_LABEL[
          tour.contenttypeid as keyof typeof CONTENT_TYPE_LABEL
        ] || "기타";

      const infoWindowContent = `
        <div style="padding: 12px; min-width: 200px; max-width: 300px;">
          <h3 style="font-weight: 600; font-size: 16px; margin-bottom: 8px; color: #1f2937;">
            ${tour.title}
          </h3>
          <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
            ${tour.addr1 || "주소 정보 없음"}
          </p>
          <p style="font-size: 11px; color: #9ca3af; margin-bottom: 12px;">
            🎯 ${contentTypeLabel}
          </p>
          <button 
            id="info-window-btn-${tour.contentid}"
            style="
              width: 100%;
              padding: 8px 16px;
              background-color: #3b82f6;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: background-color 0.2s;
            "
            onmouseover="this.style.backgroundColor='#2563eb'"
            onmouseout="this.style.backgroundColor='#3b82f6'"
          >
            상세보기
          </button>
        </div>
      `;

      const infoWindow = new maps.InfoWindow({
        content: infoWindowContent,
      });

      infoWindowsRef.current.set(tour.contentid, infoWindow);

      // Event API 사용 (Event 또는 event 모두 지원)
      // Event는 타입 정의에 없으므로 타입 단언 사용
      const eventAPI = (maps as any).Event || maps.event;
      if (eventAPI && eventAPI.addListener) {
        eventAPI.addListener(marker, "click", () => {
          infoWindowsRef.current.forEach((iw) => iw.close());
          infoWindow.open(mapInstanceRef.current, marker);

          if (onMarkerClick) {
            onMarkerClick(tour);
          }

          setTimeout(() => {
            const btn = document.getElementById(
              `info-window-btn-${tour.contentid}`
            );
            if (btn) {
              btn.addEventListener("click", () => {
                router.push(`/places/${tour.contentid}`);
              });
            }
          }, 100);
        });
      } else {
        console.error("[NaverMap] addListener를 사용할 수 없습니다:", {
          hasEventAPI: !!eventAPI,
          eventAPI,
        });
      }
    });
    console.log("[NaverMap] 마커 생성 완료:", markersRef.current.size, "개");
    console.groupEnd();
  }, [tours, router, onMarkerClick, loading, error]);

  // 선택된 관광지로 지도 이동
  useEffect(() => {
    if (
      !selectedTourId ||
      !mapInstanceRef.current ||
      !window.naver?.maps ||
      loading ||
      error
    ) {
      return;
    }

    const marker = markersRef.current.get(selectedTourId);
    const infoWindow = infoWindowsRef.current.get(selectedTourId);

    if (marker && infoWindow) {
      // 지도 중심 이동
      mapInstanceRef.current.setCenter(marker.getPosition());
      mapInstanceRef.current.setZoom(15);

      // 다른 인포윈도우 닫기
      infoWindowsRef.current.forEach((iw) => {
        if (iw !== infoWindow) {
          iw.close();
        }
      });

      // 인포윈도우 열기
      infoWindow.open(mapInstanceRef.current, marker);
    }
  }, [selectedTourId, loading, error]);

  // 에러 상태
  if (error) {
    return <MapErrorPlaceholder message={error} className={className} />;
  }

  // 지도 컨테이너 (항상 렌더링하여 mapRef 연결 보장)
  return (
    <div className={`relative w-full h-full ${className || ""}`} style={{ minHeight: "400px" }}>
      {/* 지도 div - 항상 렌더링하여 mapRef 연결 */}
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700"
        style={{ 
          minHeight: "400px",
          height: "100%",
          width: "100%",
          position: "relative", // z-index를 위한 position 설정
          zIndex: loading ? 0 : 1, // 로딩 중이 아닐 때 z-index 설정
        }}
        role="application"
        aria-label="네이버 지도"
      />
      {/* 로딩 오버레이 */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse z-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600 dark:text-gray-400">지도를 불러오는 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}
