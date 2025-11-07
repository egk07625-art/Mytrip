/**
 * @file page.tsx
 * @description 북마크 목록 페이지
 *
 * 사용자가 저장한 관광지 북마크 목록을 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 인증된 사용자: Supabase DB에서 북마크 조회
 * 2. 비인증 사용자: 클라이언트 컴포넌트에서 localStorage 조회
 * 3. 북마크된 관광지 상세 정보 병렬 조회
 * 4. 정렬 옵션 처리 (URL 파라미터 기반)
 * 5. 빈 상태 처리 (북마크 없음)
 *
 * 핵심 구현 로직:
 * - Server Component로 구현 (인증된 사용자 처리)
 * - Clerk auth()로 인증 상태 확인
 * - getBookmarks로 북마크 목록 조회
 * - Promise.allSettled로 관광지 정보 병렬 조회
 * - 실패한 항목은 에러 처리하되 나머지 표시
 * - Spacing-First 정책 준수
 *
 * @dependencies
 * - Next.js 15 App Router
 * - @clerk/nextjs/server: auth()
 * - @/lib/supabase/server: createClerkSupabaseClient
 * - @/lib/api/bookmark-api-client: getBookmarks
 * - @/lib/api/tour-api-client: fetchTourDetail
 * - @/components/bookmarks/bookmark-list: BookmarkList 컴포넌트
 */

import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getBookmarks } from "@/lib/api/bookmark-api-client";
import { fetchTourDetail } from "@/lib/api/tour-api-client";
import type { Bookmark, LocalStorageBookmark } from "@/lib/types/bookmark";
import type { TourDetail } from "@/lib/types/tour";
import BookmarkList from "@/components/bookmarks/bookmark-list";
import { Skeleton } from "@/components/ui/skeleton";

interface BookmarksPageProps {
  searchParams: Promise<{ sort?: string }>;
}

/**
 * 북마크와 관광지 정보를 결합한 타입
 */
export interface BookmarkWithTour {
  bookmark: Bookmark | LocalStorageBookmark;
  tour: TourDetail | null;
  error?: string;
}

/**
 * 북마크 목록 페이지
 */
export default async function BookmarksPage({
  searchParams,
}: BookmarksPageProps) {
  console.group("[BookmarksPage] Rendering bookmarks page");
  
  const { sort } = await searchParams;
  const sortOption = sort || "latest";

  // Clerk 인증 상태 확인
  const { userId } = await auth();
  console.log("[BookmarksPage] User ID:", userId);

  // 인증된 사용자: DB에서 북마크 조회
  let bookmarks: Bookmark[] | LocalStorageBookmark[] = [];
  let bookmarksWithTour: BookmarkWithTour[] = [];

  if (userId) {
    try {
      const supabase = createClerkSupabaseClient();
      console.log("[BookmarksPage] Fetching bookmarks from DB");
      
      const fetchedBookmarks = await getBookmarks(supabase, userId);
      bookmarks = fetchedBookmarks as Bookmark[];
      
      console.log("[BookmarksPage] Found bookmarks:", bookmarks.length);

      // 각 북마크에 대해 관광지 정보 병렬 조회
      if (bookmarks.length > 0) {
        console.log("[BookmarksPage] Fetching tour details in parallel");
        
        const tourPromises = bookmarks.map(async (bookmark) => {
          try {
            const tour = await fetchTourDetail(bookmark.content_id);
            return {
              bookmark,
              tour,
            } as BookmarkWithTour;
          } catch (error) {
            console.error(
              `[BookmarksPage] Error fetching tour ${bookmark.content_id}:`,
              error
            );
            return {
              bookmark,
              tour: null,
              error: error instanceof Error ? error.message : "관광지 정보 조회 실패",
            } as BookmarkWithTour;
          }
        });

        // Promise.allSettled로 일부 실패해도 나머지 표시
        const results = await Promise.allSettled(tourPromises);
        
        bookmarksWithTour = results.map((result) => {
          if (result.status === "fulfilled") {
            return result.value;
          } else {
            console.error("[BookmarksPage] Promise rejected:", result.reason);
            return {
              bookmark: bookmarks[results.indexOf(result)],
              tour: null,
              error: "관광지 정보 조회 실패",
            } as BookmarkWithTour;
          }
        });

        // 실패한 항목 필터링 (선택 사항: 에러가 있어도 표시할 수 있음)
        // 여기서는 tour가 null인 항목도 포함하여 표시
        console.log(
          "[BookmarksPage] Successfully fetched tour details:",
          bookmarksWithTour.filter((item) => item.tour !== null).length
        );
      }
    } catch (error) {
      console.error("[BookmarksPage] Error fetching bookmarks:", error);
      // 에러 발생 시 빈 배열 유지
    }
  }

  console.groupEnd();

  return (
    <div className="flex flex-col gap-5 p-3 md:p-5 lg:p-6">
      {/* 페이지 제목 */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          북마크
        </h1>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          저장한 관광지를 확인하고 관리하세요.
        </p>
      </div>

      {/* 북마크 목록 */}
      <Suspense fallback={<BookmarkListSkeleton />}>
        <BookmarkList
          bookmarks={bookmarksWithTour}
          sortOption={sortOption}
          isAuthenticated={!!userId}
        />
      </Suspense>
    </div>
  );
}

/**
 * 북마크 목록 로딩 스켈레톤
 */
function BookmarkListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-52 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

