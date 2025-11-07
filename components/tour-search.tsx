/**
 * @file tour-search.tsx
 * @description 관광지 검색창 컴포넌트
 *
 * 키워드로 관광지를 검색할 수 있는 검색창 UI를 제공하는 Client Component입니다.
 * 검색 상태는 URL searchParams를 통해 관리되어 Server Component와 동기화됩니다.
 *
 * 주요 기능:
 * 1. 검색 키워드 입력 (Input 컴포넌트)
 * 2. 검색 실행 (엔터 키 또는 검색 버튼 클릭)
 * 3. 검색어 초기화 버튼
 * 4. URL 파라미터 기반 상태 관리
 * 5. 필터 파라미터 유지 (areaCode, contentTypeId)
 * 6. 로딩 상태 표시 (검색 중 스피너)
 * 7. 중복 요청 방지 (검색 버튼 비활성화)
 *
 * 핵심 구현 로직:
 * - useRouter와 useSearchParams로 URL 파라미터 관리
 * - 검색 실행 시 URL 업데이트하여 페이지 재렌더링
 * - 검색어 유효성 검사 (최소 2자)
 * - URL 파라미터와 입력값 자동 동기화
 * - 로딩 상태 관리 (isSearching) 및 타임아웃 안전장치
 * - 중복 요청 방지 로직
 * - Spacing-First 정책 준수 (gap 사용, margin 금지)
 * - Tailwind CSS만 사용 (인라인 style 금지)
 * - 반응형 디자인 (모바일 퍼스트)
 *
 * @dependencies
 * - next/navigation: useRouter, useSearchParams
 * - @/components/ui/input: Input 컴포넌트
 * - @/components/ui/button: Button 컴포넌트
 * - @/components/ui/loading-spinner: LoadingSpinner 컴포넌트
 * - lucide-react: Search, X 아이콘
 * - @/lib/utils/url-params: updateUrlParam 함수
 *
 * @example
 * ```tsx
 * <TourSearch />
 * ```
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search, X } from "lucide-react";
import { updateUrlParam } from "@/lib/utils/url-params";

interface TourSearchProps {
  className?: string;
}

/**
 * 관광지 검색창 컴포넌트
 * @param className - 추가 CSS 클래스
 */
export default function TourSearch({ className }: TourSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // 현재 검색 키워드 가져오기
  const currentKeyword = searchParams.get("keyword") || "";

  // 로컬 입력값 상태 (URL 파라미터와 동기화)
  const [inputValue, setInputValue] = useState(currentKeyword);

  // 로딩 상태 관리 (검색 실행 중 여부)
  const [isSearching, setIsSearching] = useState(false);

  // URL 파라미터 변경 시 입력값 동기화
  useEffect(() => {
    setInputValue(currentKeyword);
  }, [currentKeyword]);

  // URL 파라미터 변경 감지: 검색이 완료되었음을 의미 (로딩 상태 해제)
  // 검색어가 변경되었거나 비어있을 때 로딩 상태 해제
  useEffect(() => {
    if (isSearching) {
      // URL 파라미터가 변경되었으므로 검색이 완료된 것으로 간주
      console.log("[TourSearch] 검색 완료 - 로딩 상태 해제");
      setIsSearching(false);
    }
  }, [currentKeyword]); // currentKeyword 변경 시 로딩 상태 해제

  // 타임아웃 안전장치: 30초 후 자동으로 로딩 상태 해제
  useEffect(() => {
    if (!isSearching) return;

    const timeout = setTimeout(() => {
      console.warn("[TourSearch] 로딩 타임아웃 - 상태 해제");
      setIsSearching(false);
    }, 30000); // 30초 타임아웃

    return () => {
      clearTimeout(timeout);
    };
  }, [isSearching]);

  /**
   * 검색 실행 함수
   * 검색어 유효성 검사 후 URL 파라미터 업데이트
   * 중복 요청 방지 및 로딩 상태 관리 포함
   */
  const handleSearch = useCallback(
    (keyword: string) => {
      // 중복 요청 방지: 이미 검색 중이면 스킵
      if (isSearching) {
        console.log("[TourSearch] 이미 검색 중입니다. 중복 요청을 무시합니다.");
        return;
      }

      // 공백 제거 및 검증
      const trimmedKeyword = keyword.trim();

      // 빈 검색어인 경우 keyword 파라미터 제거
      if (!trimmedKeyword) {
        const newParams = updateUrlParam({
          key: "keyword",
          value: "",
          currentParams: searchParams,
          preserveKeys: ["keyword", "areaCode", "contentTypeId"],
        });
        const newUrl = newParams ? `/?${newParams}` : "/";
        // Next.js 15: router.replace를 startTransition으로 감싸서 즉시 URL 업데이트
        startTransition(() => {
          router.replace(newUrl);
        });
        return;
      }

      // 최소 길이 검증 (2자 이상)
      if (trimmedKeyword.length < 2) {
        console.log("[TourSearch] 검색어는 최소 2자 이상 입력해주세요.");
        return;
      }

      // 동일한 검색어인 경우 스킵 (중복 요청 방지)
      if (trimmedKeyword === currentKeyword) {
        console.log("[TourSearch] 동일한 검색어입니다. 요청을 스킵합니다.");
        return;
      }

      // 로딩 상태 시작
      setIsSearching(true);

      // URL 파라미터 업데이트 (필터 파라미터 유지)
      const newParams = updateUrlParam({
        key: "keyword",
        value: trimmedKeyword,
        currentParams: searchParams,
        preserveKeys: ["keyword", "areaCode", "contentTypeId"],
      });

      console.group("[TourSearch] 검색 실행");
      console.log("검색어:", trimmedKeyword);
      console.log("URL 파라미터:", newParams);
      console.log("로딩 상태: 시작");
      console.log("router.replace 호출 전");
      console.groupEnd();

      // URL 업데이트 (Next.js 15: router.replace를 startTransition으로 감싸서 즉시 URL 업데이트)
      const targetUrl = `/?${newParams}`;
      console.log("[TourSearch] router.replace 호출:", targetUrl);
      startTransition(() => {
        router.replace(targetUrl);
      });
      console.log("[TourSearch] router.replace 호출 완료");
    },
    [router, searchParams, isSearching, currentKeyword, startTransition]
  );

  /**
   * 엔터 키 이벤트 처리
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(inputValue);
    }
  };

  /**
   * 검색 버튼 클릭 이벤트 처리
   */
  const handleSearchClick = () => {
    console.log("[TourSearch] 검색 버튼 클릭", { inputValue, currentKeyword });
    handleSearch(inputValue);
  };

  /**
   * 초기화 버튼 클릭 이벤트 처리
   * 검색어만 제거하고 필터는 유지
   */
  const handleReset = () => {
    setInputValue("");
    setIsSearching(false); // 초기화 시 로딩 상태도 해제
    handleSearch("");
  };

  // 검색어가 있는지 확인
  const hasKeyword = Boolean(currentKeyword);

  // 검색 버튼 비활성화 조건
  const isButtonDisabled =
    isSearching || // 검색 실행 중
    isPending || // 네비게이션 진행 중
    inputValue.trim().length < 2 || // 검색어 유효성 검사 실패
    inputValue.trim() === currentKeyword; // 동일한 검색어

  return (
    <div
      className={`flex flex-col gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className || ""}`}
      role="search"
      aria-label="관광지 검색"
    >
      {/* 검색 설명 (스크린 리더용) */}
      <div id="search-description" className="sr-only">
        키워드로 관광지를 검색할 수 있습니다. 최소 2자 이상 입력해주세요.
      </div>

      {/* 검색 헤더 */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          검색
        </h2>
        {hasKeyword && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            aria-label="검색어 초기화"
            aria-describedby="search-description"
          >
            <X className="size-4" aria-hidden="true" />
            초기화
          </Button>
        )}
      </div>

      {/* 검색 입력 영역 */}
      <div className="flex flex-col gap-3">
        <label
          id="search-input-label"
          htmlFor="search-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          키워드
        </label>
        <div className="flex gap-2">
          {/* 검색 입력창 */}
          <div className="relative flex-1">
            <Input
              id="search-input"
              type="search"
              placeholder="관광지명, 주소, 설명으로 검색..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSearching || isPending}
              className="w-full pr-10"
              aria-label="검색어 입력"
              aria-describedby="search-description search-input-label"
              aria-invalid={inputValue.trim().length > 0 && inputValue.trim().length < 2}
              aria-busy={isSearching || isPending}
            />
            {/* 검색 아이콘 (입력창 내부) */}
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 dark:text-gray-500 pointer-events-none"
              aria-hidden="true"
            />
          </div>

          {/* 검색 버튼 */}
          <Button
            onClick={handleSearchClick}
            disabled={isButtonDisabled}
            className="shrink-0"
            aria-label={isSearching || isPending ? "검색 중..." : "검색 실행"}
            aria-describedby="search-description"
            aria-busy={isSearching || isPending}
          >
            {isSearching || isPending ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              <Search className="size-4" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">
              {isSearching || isPending ? "검색 중..." : "검색"}
            </span>
          </Button>
        </div>

        {/* 검색어 유효성 검사 안내 (2자 미만일 때) */}
        {inputValue.trim().length > 0 && inputValue.trim().length < 2 && (
          <p
            className="text-sm text-amber-600 dark:text-amber-400"
            role="alert"
            aria-live="polite"
          >
            검색어는 최소 2자 이상 입력해주세요.
          </p>
        )}

        {/* 현재 검색어 표시 (검색 실행 후) */}
        {hasKeyword && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            검색어: <span className="font-medium">{currentKeyword}</span>
          </p>
        )}
      </div>
    </div>
  );
}

