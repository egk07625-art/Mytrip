/**
 * @file coordinate.ts
 * @description 좌표 변환 유틸리티 함수
 *
 * 한국관광공사 API에서 제공하는 KATEC 좌표계를
 * Naver Maps API에서 사용하는 좌표계로 변환하는 함수를 제공합니다.
 *
 * 주요 기능:
 * 1. KATEC 좌표계 → Naver Maps 좌표계 변환
 * 2. 좌표 유효성 검사
 * 3. 에러 처리 (좌표가 없거나 잘못된 경우)
 *
 * 핵심 구현 로직:
 * - KATEC 좌표계는 정수형으로 저장됨 (예: 127.1234567 → 1271234567)
 * - 변환 공식: lng = mapx / 10000000, lat = mapy / 10000000
 * - 좌표 유효성 검사: 경도(-180~180), 위도(-90~90)
 * - 변환 실패 시 null 반환
 *
 * @dependencies
 * - @/lib/types/tour: Coordinate 타입
 */

import type { Coordinate } from "@/lib/types/tour";

/**
 * KATEC 좌표계를 Naver Maps 좌표계로 변환
 * @param mapx - 경도 (KATEC 좌표계, 정수형 문자열)
 * @param mapy - 위도 (KATEC 좌표계, 정수형 문자열)
 * @returns 변환된 좌표 (lng, lat) 또는 null (변환 실패 시)
 *
 * @example
 * ```ts
 * const coord = convertKATECToNaver("1271234567", "371234567");
 * // { lng: 127.1234567, lat: 37.1234567 }
 * ```
 */
export function convertKATECToNaver(
  mapx: string,
  mapy: string
): Coordinate | null {
  // 좌표가 없거나 빈 문자열인 경우
  if (!mapx || !mapy || mapx.trim() === "" || mapy.trim() === "") {
    console.warn("[coordinate] 좌표가 없습니다:", { mapx, mapy });
    return null;
  }

  // 문자열을 숫자로 변환
  const lng = parseFloat(mapx) / 10000000;
  const lat = parseFloat(mapy) / 10000000;

  // NaN 체크
  if (isNaN(lng) || isNaN(lat)) {
    console.warn("[coordinate] 좌표 변환 실패 (NaN):", { mapx, mapy, lng, lat });
    return null;
  }

  // 좌표 범위 유효성 검사
  // 경도: -180 ~ 180, 위도: -90 ~ 90
  // 한국 지역: 경도 약 124~132, 위도 약 33~43
  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    console.warn("[coordinate] 좌표 범위 초과:", { lng, lat });
    return null;
  }

  return { lng, lat };
}

/**
 * 여러 관광지의 좌표를 변환하여 유효한 좌표만 필터링
 * @param tours - 관광지 목록
 * @returns 좌표가 유효한 관광지와 변환된 좌표의 맵
 */
export function convertToursToCoordinates(
  tours: Array<{ contentid: string; mapx: string; mapy: string }>
): Map<string, Coordinate> {
  const coordinateMap = new Map<string, Coordinate>();

  for (const tour of tours) {
    const coord = convertKATECToNaver(tour.mapx, tour.mapy);
    if (coord) {
      coordinateMap.set(tour.contentid, coord);
    }
  }

  return coordinateMap;
}

/**
 * 관광지 목록의 중심 좌표 계산
 * @param coordinates - 좌표 맵 (contentid -> Coordinate)
 * @returns 중심 좌표 또는 null (좌표가 없는 경우)
 */
export function calculateCenter(
  coordinates: Map<string, Coordinate>
): Coordinate | null {
  if (coordinates.size === 0) {
    return null;
  }

  let sumLng = 0;
  let sumLat = 0;

  for (const coord of coordinates.values()) {
    sumLng += coord.lng;
    sumLat += coord.lat;
  }

  return {
    lng: sumLng / coordinates.size,
    lat: sumLat / coordinates.size,
  };
}

/**
 * 관광지 목록의 경계(bounds) 계산
 * @param coordinates - 좌표 맵 (contentid -> Coordinate)
 * @returns 경계 정보 { minLng, maxLng, minLat, maxLat } 또는 null
 */
export function calculateBounds(
  coordinates: Map<string, Coordinate>
): { minLng: number; maxLng: number; minLat: number; maxLat: number } | null {
  if (coordinates.size === 0) {
    return null;
  }

  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  for (const coord of coordinates.values()) {
    minLng = Math.min(minLng, coord.lng);
    maxLng = Math.max(maxLng, coord.lng);
    minLat = Math.min(minLat, coord.lat);
    maxLat = Math.max(maxLat, coord.lat);
  }

  return { minLng, maxLng, minLat, maxLat };
}

