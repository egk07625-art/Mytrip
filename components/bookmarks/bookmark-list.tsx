/**
 * @file bookmark-list.tsx
 * @description 북마크 리스트 컴포넌트
 *
 * 북마크된 관광지 목록을 표시하고 관리하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 북마크 목록 표시 (TourCard 재사용)
 * 2. 체크박스 선택 기능 (일괄 삭제용)
 * 3. 정렬 옵션 UI (최신순, 이름순, 지역별)
 * 4. 일괄 삭제 기능
 * 5. 빈 상태 UI
 *
 * 핵심 구현 로직:
 * - Client Component로 구현
 * - TourCard 재사용 (TourDetail을 TourItem으로 변환)
 * - 체크박스로 여러 북마크 선택
 * - 정렬 옵션에 따라 클라이언트 사이드 정렬
 * - 일괄 삭제 시 확인 다이얼로그 표시
 * - Spacing-First 정책 준수
 *
 * @dependencies
 * - @/components/tour-card: TourCard 컴포넌트
 * - @/components/ui/checkbox: Checkbox 컴포넌트
 * - @/components/ui/select: Select 컴포넌트
 * - @/components/ui/dialog: Dialog 컴포넌트
 * - @/components/ui/button: Button 컴포넌트
 * - @/lib/types/bookmark: Bookmark, LocalStorageBookmark 타입
 * - @/lib/types/tour: TourDetail, TourItem 타입
 * - @/hooks/use-bookmark: 북마크 관리 훅
 */

"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { Trash2, Star, AlertCircle, ArrowRight } from "lucide-react";
import TourCard from "@/components/tour-card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { BookmarkWithTour } from "@/app/bookmarks/page";
import type { TourItem, TourDetail } from "@/lib/types/tour";
import type { LocalStorageBookmark } from "@/lib/types/bookmark";
import { getUserIdByClerkId, removeBookmark } from "@/lib/api/bookmark-api-client";
import type { ApiResponse } from "@/lib/types/tour";
import { toast } from "sonner";

/**
 * 클라이언트 컴포넌트에서 관광지 상세 정보를 가져오는 함수
 */
async function fetchTourDetailClient(contentId: string): Promise<TourDetail | null> {
  try {
    const apiUrl = new URL("/api/tour", window.location.origin);
    apiUrl.searchParams.set("endpoint", "detailCommon");
    apiUrl.searchParams.set("contentId", contentId);

    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      console.error("[BookmarkList] API Error:", response.status);
      return null;
    }

    const data: ApiResponse<TourDetail> = await response.json();

    if (data.response?.header?.resultCode !== "0000") {
      console.error("[BookmarkList] API Error Response:", data.response?.header?.resultMsg);
      return null;
    }

    const items = data.response?.body?.items?.item;
    const tourDetail: TourDetail | null = Array.isArray(items)
      ? items[0] || null
      : items || null;

    return tourDetail;
  } catch (error) {
    console.error("[BookmarkList] Error fetching tour detail:", error);
    return null;
  }
}

interface BookmarkListProps {
  bookmarks: BookmarkWithTour[];
  sortOption: string;
  isAuthenticated: boolean;
}

const LOCAL_STORAGE_KEY = "bookmarks";

type SortOption = "latest" | "name" | "region";

/**
 * TourDetail을 TourItem으로 변환하는 헬퍼 함수
 */
function tourDetailToTourItem(tour: NonNullable<BookmarkWithTour["tour"]>): TourItem {
  return {
    contentid: tour.contentid,
    contenttypeid: tour.contenttypeid,
    title: tour.title,
    addr1: tour.addr1,
    addr2: tour.addr2,
    areacode: extractAreaCode(tour.addr1) || "1", // 기본값: 서울
    firstimage: tour.firstimage,
    firstimage2: tour.firstimage2,
    tel: tour.tel,
    mapx: tour.mapx,
    mapy: tour.mapy,
    modifiedtime: new Date().toISOString(), // 북마크 생성일 사용 불가, 현재 시간 사용
  };
}

/**
 * 주소에서 지역코드를 추출하는 헬퍼 함수
 * 간단한 매핑 (실제로는 더 정교한 로직 필요)
 */
function extractAreaCode(addr: string): string | null {
  if (!addr) return null;
  
  const areaMap: Record<string, string> = {
    서울: "1",
    인천: "2",
    대전: "3",
    대구: "4",
    광주: "5",
    부산: "6",
    울산: "7",
    세종: "8",
    경기: "31",
    강원: "32",
    충북: "33",
    충남: "34",
    전북: "35",
    전남: "36",
    경북: "37",
    경남: "38",
    제주: "39",
  };

  for (const [key, code] of Object.entries(areaMap)) {
    if (addr.includes(key)) {
      return code;
    }
  }

  return null;
}

/**
 * 북마크 리스트 컴포넌트
 */
/**
 * localStorage에서 북마크 목록을 가져오는 함수
 */
function getLocalStorageBookmarks(): LocalStorageBookmark[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as LocalStorageBookmark[];
  } catch (error) {
    console.error("[BookmarkList] Error reading localStorage:", error);
    return [];
  }
}

export default function BookmarkList({
  bookmarks: initialBookmarks,
  sortOption,
  isAuthenticated,
}: BookmarkListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  const supabase = useClerkSupabaseClient();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [isLoading, setIsLoading] = useState(!isAuthenticated && initialBookmarks.length === 0);

  // 비인증 사용자: localStorage에서 북마크 조회 및 관광지 정보 가져오기
  useEffect(() => {
    // 인증된 사용자는 이미 Server Component에서 데이터를 받았으므로 스킵
    if (isAuthenticated) {
      setIsLoading(false);
      return;
    }

    // 이미 북마크가 있으면 스킵 (Server Component에서 받은 데이터)
    if (initialBookmarks.length > 0) {
      setIsLoading(false);
      return;
    }

    console.group("[BookmarkList] Loading bookmarks from localStorage");
    setIsLoading(true);

    const localStorageBookmarks = getLocalStorageBookmarks();
    console.log("[BookmarkList] Found bookmarks in localStorage:", localStorageBookmarks.length);

    if (localStorageBookmarks.length > 0) {
      // 관광지 정보 병렬 조회
      const tourPromises = localStorageBookmarks.map(async (bookmark) => {
        try {
          const tour = await fetchTourDetailClient(bookmark.content_id);
          return {
            bookmark,
            tour,
          } as BookmarkWithTour;
        } catch (error) {
          console.error(
            `[BookmarkList] Error fetching tour ${bookmark.content_id}:`,
            error
          );
          return {
            bookmark,
            tour: null,
            error: error instanceof Error ? error.message : "관광지 정보 조회 실패",
          } as BookmarkWithTour;
        }
      });

      Promise.allSettled(tourPromises).then((results) => {
        const bookmarksWithTour = results.map((result) => {
          if (result.status === "fulfilled") {
            return result.value;
          } else {
            return {
              bookmark: localStorageBookmarks[results.indexOf(result)],
              tour: null,
              error: "관광지 정보 조회 실패",
            } as BookmarkWithTour;
          }
        });

        setBookmarks(bookmarksWithTour);
        setIsLoading(false);
        console.log(
          "[BookmarkList] Successfully loaded bookmarks:",
          bookmarksWithTour.filter((item) => item.tour !== null).length
        );
        console.groupEnd();
      });
    } else {
      setIsLoading(false);
      console.groupEnd();
    }
  }, [isAuthenticated, initialBookmarks.length]);

  // 정렬된 북마크 목록
  const sortedBookmarks = useMemo(() => {
    const filtered = bookmarks.filter((item) => item.tour !== null);
    const sort = (sortOption || "latest") as SortOption;

    switch (sort) {
      case "latest":
        return [...filtered].sort((a, b) => {
          const dateA = new Date(a.bookmark.created_at).getTime();
          const dateB = new Date(b.bookmark.created_at).getTime();
          return dateB - dateA; // 내림차순
        });

      case "name":
        return [...filtered].sort((a, b) => {
          const titleA = a.tour?.title || "";
          const titleB = b.tour?.title || "";
          return titleA.localeCompare(titleB, "ko"); // 가나다순
        });

      case "region":
        return [...filtered].sort((a, b) => {
          const addrA = a.tour?.addr1 || "";
          const addrB = b.tour?.addr1 || "";
          return addrA.localeCompare(addrB, "ko");
        });

      default:
        return filtered;
    }
  }, [bookmarks, sortOption]);

  // 정렬 옵션 변경 핸들러
  const handleSortChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", value);
      router.push(`/bookmarks?${params.toString()}`);
    },
    [router, searchParams]
  );

  // 체크박스 선택/해제 핸들러
  const handleToggleSelect = useCallback((contentId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(contentId)) {
        next.delete(contentId);
      } else {
        next.add(contentId);
      }
      return next;
    });
  }, []);

  // 전체 선택/해제 핸들러
  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === sortedBookmarks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedBookmarks.map((item) => item.bookmark.content_id)));
    }
  }, [selectedIds.size, sortedBookmarks]);

  // 일괄 삭제 핸들러
  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;

    setIsDeleting(true);
    console.group("[BookmarkList] Bulk deleting bookmarks");
    console.log("Selected IDs:", Array.from(selectedIds));

    try {
      if (!isAuthenticated || !userId) {
        // 비인증 사용자: localStorage에서 삭제
        const stored = localStorage.getItem("bookmarks");
        if (stored) {
          const bookmarks = JSON.parse(stored);
          const filtered = bookmarks.filter(
            (b: { content_id: string }) => !selectedIds.has(b.content_id)
          );
          localStorage.setItem("bookmarks", JSON.stringify(filtered));
        }

        // 상태 업데이트
        setBookmarks((prev) =>
          prev.filter((item) => !selectedIds.has(item.bookmark.content_id))
        );
        setSelectedIds(new Set());
        setShowDeleteDialog(false);

        // 페이지 새로고침
        router.refresh();

        toast.success(`${selectedIds.size}개의 북마크가 삭제되었습니다.`);
        console.log("[BookmarkList] Deleted from localStorage");
        console.groupEnd();
        setIsDeleting(false);
        return;
      }

      // 인증된 사용자: DB에서 삭제
      const dbUserId = await getUserIdByClerkId(supabase, userId);
      if (!dbUserId) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }

      const deletePromises = Array.from(selectedIds).map(async (contentId) => {
        const result = await removeBookmark(supabase, dbUserId, contentId);
        if (!result.success) {
          console.error(`[BookmarkList] Failed to delete ${contentId}:`, result.error);
          throw new Error(result.error || "북마크 삭제 실패");
        }
        return contentId;
      });

      await Promise.all(deletePromises);

      // 상태 업데이트
      setBookmarks((prev) =>
        prev.filter((item) => !selectedIds.has(item.bookmark.content_id))
      );
      setSelectedIds(new Set());
      setShowDeleteDialog(false);

      // 페이지 새로고침
      router.refresh();

      toast.success(`${selectedIds.size}개의 북마크가 삭제되었습니다.`);
      console.log("[BookmarkList] Successfully deleted bookmarks");
      console.groupEnd();
    } catch (error) {
      console.error("[BookmarkList] Error deleting bookmarks:", error);
      toast.error(
        error instanceof Error ? error.message : "북마크 삭제 중 오류가 발생했습니다."
      );
    } finally {
      setIsDeleting(false);
    }
  }, [selectedIds, isAuthenticated, userId, supabase, router]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-64 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      </div>
    );
  }

  // 빈 상태
  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 px-4 text-center">
        <div className="text-6xl">⭐</div>
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            아직 북마크한 관광지가 없습니다
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400">
            관광지를 북마크하여 나중에 다시 확인하세요.
          </p>
        </div>
        <Button
          onClick={() => router.push("/")}
          className="gap-2"
          aria-label="관광지 둘러보기"
        >
          관광지 둘러보기
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // 관광지 정보가 있는 북마크만 필터링
  const validBookmarks = sortedBookmarks.filter((item) => item.tour !== null);

  if (validBookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-500" />
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            관광지 정보를 불러올 수 없습니다
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            일부 북마크의 관광지 정보를 조회하지 못했습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 컨트롤 바 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* 정렬 옵션 */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="sort-select" className="text-xs font-medium text-gray-700 dark:text-gray-300">
            정렬:
          </label>
          <Select value={sortOption} onValueChange={handleSortChange}>
            <SelectTrigger id="sort-select" className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="name">이름순</SelectItem>
              <SelectItem value="region">지역별</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 일괄 삭제 버튼 */}
        {selectedIds.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            선택 삭제 ({selectedIds.size})
          </Button>
        )}
      </div>

      {/* 북마크 목록 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {validBookmarks.map((item) => {
          const tourItem = tourDetailToTourItem(item.tour!);
          const isSelected = selectedIds.has(item.bookmark.content_id);

          return (
            <div key={item.bookmark.content_id} className="relative">
              {/* 체크박스 */}
              <div
                className="absolute top-2 left-2 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => {
                    handleToggleSelect(item.bookmark.content_id);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  aria-label={`${tourItem.title} 선택`}
                  className="bg-white dark:bg-gray-800"
                />
              </div>

              {/* TourCard */}
              <TourCard tour={tourItem} />
            </div>
          );
        })}
      </div>

      {/* 전체 선택 버튼 */}
      {validBookmarks.length > 0 && (
        <div className="flex items-center justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="gap-2"
          >
            {selectedIds.size === validBookmarks.length ? "전체 해제" : "전체 선택"}
          </Button>
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>북마크 삭제 확인</DialogTitle>
            <DialogDescription>
              선택한 {selectedIds.size}개의 북마크를 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

