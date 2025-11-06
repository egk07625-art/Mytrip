/**
 * @file url-params.ts
 * @description URL 파라미터 관리 유틸리티 함수
 *
 * 필터와 검색 파라미터를 일관되게 관리하기 위한 유틸리티 함수입니다.
 * 검색 기능 추가 시 필터와 검색 파라미터가 서로 상태를 유지하도록 보장합니다.
 *
 * 주요 기능:
 * 1. URL 파라미터 업데이트 (기존 파라미터 유지)
 * 2. 필터 파라미터 관리 (areaCode, contentTypeId)
 * 3. 검색 파라미터 관리 (keyword)
 * 4. 파라미터 검증 및 정리
 *
 * @dependencies
 * - next/navigation: URLSearchParams
 */

/**
 * URL 파라미터 업데이트 옵션
 */
interface UpdateUrlParamsOptions {
  /**
   * 업데이트할 파라미터 키
   */
  key: string;
  /**
   * 업데이트할 파라미터 값 (빈 문자열이면 삭제)
   */
  value: string;
  /**
   * 현재 URL 파라미터 (URLSearchParams 또는 문자열)
   */
  currentParams: URLSearchParams | string;
  /**
   * 유지할 파라미터 키 목록 (기본값: ["keyword", "areaCode", "contentTypeId"])
   */
  preserveKeys?: string[];
}

/**
 * URL 파라미터를 업데이트합니다.
 * 기존 파라미터를 유지하면서 특정 파라미터만 업데이트합니다.
 *
 * @param options - 업데이트 옵션
 * @returns 업데이트된 URL 파라미터 문자열
 *
 * @example
 * ```ts
 * const params = new URLSearchParams("keyword=서울&areaCode=1");
 * const newParams = updateUrlParam({
 *   key: "contentTypeId",
 *   value: "12",
 *   currentParams: params,
 * });
 * // 결과: "keyword=서울&areaCode=1&contentTypeId=12"
 * ```
 */
export function updateUrlParam({
  key,
  value,
  currentParams,
  preserveKeys = ["keyword", "areaCode", "contentTypeId"],
}: UpdateUrlParamsOptions): string {
  // URLSearchParams 객체 생성
  const params =
    typeof currentParams === "string"
      ? new URLSearchParams(currentParams)
      : new URLSearchParams(currentParams);

  // 파라미터 업데이트
  if (value && value.trim() !== "") {
    params.set(key, value);
  } else {
    params.delete(key);
  }

  // 페이지 번호 초기화 (필터/검색 변경 시)
  if (preserveKeys.includes(key) && key !== "pageNo") {
    params.delete("pageNo");
  }

  return params.toString();
}

/**
 * 여러 파라미터를 한 번에 업데이트합니다.
 *
 * @param updates - 업데이트할 파라미터 맵 (key-value 쌍)
 * @param currentParams - 현재 URL 파라미터
 * @returns 업데이트된 URL 파라미터 문자열
 *
 * @example
 * ```ts
 * const params = new URLSearchParams("keyword=서울");
 * const newParams = updateUrlParams({
 *   updates: { areaCode: "1", contentTypeId: "12" },
 *   currentParams: params,
 * });
 * // 결과: "keyword=서울&areaCode=1&contentTypeId=12"
 * ```
 */
export function updateUrlParams({
  updates,
  currentParams,
}: {
  updates: Record<string, string>;
  currentParams: URLSearchParams | string;
}): string {
  const params =
    typeof currentParams === "string"
      ? new URLSearchParams(currentParams)
      : new URLSearchParams(currentParams);

  // 모든 파라미터 업데이트
  Object.entries(updates).forEach(([key, value]) => {
    if (value && value.trim() !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  });

  // 페이지 번호 초기화
  if (Object.keys(updates).some((key) => key !== "pageNo")) {
    params.delete("pageNo");
  }

  return params.toString();
}

/**
 * 특정 파라미터를 제외한 모든 파라미터를 유지합니다.
 *
 * @param excludeKeys - 제외할 파라미터 키 목록
 * @param currentParams - 현재 URL 파라미터
 * @returns 필터링된 URL 파라미터 문자열
 *
 * @example
 * ```ts
 * const params = new URLSearchParams("keyword=서울&areaCode=1&contentTypeId=12");
 * const filtered = preserveUrlParams({
 *   excludeKeys: ["areaCode"],
 *   currentParams: params,
 * });
 * // 결과: "keyword=서울&contentTypeId=12"
 * ```
 */
export function preserveUrlParams({
  excludeKeys,
  currentParams,
}: {
  excludeKeys: string[];
  currentParams: URLSearchParams | string;
}): string {
  const params =
    typeof currentParams === "string"
      ? new URLSearchParams(currentParams)
      : new URLSearchParams(currentParams);

  // 제외할 키 삭제
  excludeKeys.forEach((key) => {
    params.delete(key);
  });

  return params.toString();
}

/**
 * 필터 파라미터를 가져옵니다.
 *
 * @param params - URL 파라미터
 * @returns 필터 파라미터 객체
 */
export function getFilterParams(params: URLSearchParams | string) {
  const searchParams =
    typeof params === "string" ? new URLSearchParams(params) : params;

  return {
    areaCode: searchParams.get("areaCode") || "",
    contentTypeId: searchParams.get("contentTypeId") || "",
    keyword: searchParams.get("keyword") || "",
  };
}

