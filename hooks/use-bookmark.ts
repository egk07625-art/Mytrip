/**
 * @file use-bookmark.ts
 * @description 북마크 상태 관리 훅
 *
 * 북마크 추가/제거 및 상태 관리를 제공하는 커스텀 훅입니다.
 *
 * 주요 기능:
 * 1. 북마크 상태 관리 (loading, bookmarked, unbookmarked)
 * 2. 북마크 추가/제거 로직
 * 3. localStorage 동기화 (비인증 사용자)
 * 4. 로그인 후 localStorage → DB 동기화
 *
 * 핵심 구현 로직:
 * - Clerk 인증 상태 확인
 * - 인증된 사용자: Supabase DB 사용
 * - 비인증 사용자: localStorage 사용
 * - 로그인 시 localStorage → DB 자동 동기화
 *
 * @dependencies
 * - @clerk/nextjs: useAuth 훅
 * - @/lib/supabase/clerk-client: useClerkSupabaseClient 훅
 * - @/lib/api/bookmark-api-client: 북마크 API 함수들
 * - @/lib/types/bookmark: 북마크 타입 정의
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useBookmark } from '@/hooks/use-bookmark';
 *
 * export default function MyComponent({ contentId }: { contentId: string }) {
 *   const { isBookmarked, isLoading, toggleBookmark } = useBookmark(contentId);
 *
 *   return (
 *     <button onClick={toggleBookmark} disabled={isLoading}>
 *       {isBookmarked ? '북마크 제거' : '북마크 추가'}
 *     </button>
 *   );
 * }
 * ```
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import {
  getUserIdByClerkId,
  addBookmark,
  removeBookmark,
  checkBookmark,
  syncLocalStorageToDB,
} from "@/lib/api/bookmark-api-client";
import type { LocalStorageBookmark } from "@/lib/types/bookmark";

const LOCAL_STORAGE_KEY = "bookmarks";

/**
 * localStorage에서 북마크 목록을 가져옵니다.
 */
function getLocalStorageBookmarks(): LocalStorageBookmark[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as LocalStorageBookmark[];
  } catch (error) {
    console.error("[useBookmark] Error reading localStorage:", error);
    return [];
  }
}

/**
 * localStorage에 북마크를 저장합니다.
 */
function saveLocalStorageBookmark(contentId: string): void {
  if (typeof window === "undefined") return;

  try {
    const bookmarks = getLocalStorageBookmarks();
    const exists = bookmarks.some((b) => b.content_id === contentId);

    if (!exists) {
      bookmarks.push({
        content_id: contentId,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bookmarks));
    }
  } catch (error) {
    console.error("[useBookmark] Error saving to localStorage:", error);
  }
}

/**
 * localStorage에서 북마크를 제거합니다.
 */
function removeLocalStorageBookmark(contentId: string): void {
  if (typeof window === "undefined") return;

  try {
    const bookmarks = getLocalStorageBookmarks();
    const filtered = bookmarks.filter((b) => b.content_id !== contentId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("[useBookmark] Error removing from localStorage:", error);
  }
}

/**
 * localStorage에서 특정 북마크가 있는지 확인합니다.
 */
function isLocalStorageBookmarked(contentId: string): boolean {
  const bookmarks = getLocalStorageBookmarks();
  return bookmarks.some((b) => b.content_id === contentId);
}

/**
 * localStorage의 모든 북마크를 제거합니다.
 */
function clearLocalStorageBookmarks(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

/**
 * 북마크 상태 관리 훅
 *
 * @param contentId 관광지 콘텐츠 ID
 * @returns 북마크 상태 및 토글 함수
 */
export function useBookmark(contentId: string) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const supabase = useClerkSupabaseClient();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 북마크 상태를 확인합니다.
   */
  const checkBookmarkStatus = useCallback(async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError(null);

    try {
      // 비인증 사용자: localStorage 확인
      if (!isSignedIn || !userId) {
        const bookmarked = isLocalStorageBookmarked(contentId);
        setIsBookmarked(bookmarked);
        setIsLoading(false);
        return;
      }

      // 인증된 사용자: DB 확인
      const dbUserId = await getUserIdByClerkId(supabase, userId);
      if (!dbUserId) {
        console.warn("[useBookmark] User not found in DB, using localStorage");
        const bookmarked = isLocalStorageBookmarked(contentId);
        setIsBookmarked(bookmarked);
        setIsLoading(false);
        return;
      }

      const bookmarked = await checkBookmark(supabase, dbUserId, contentId);
      setIsBookmarked(bookmarked);
    } catch (err) {
      console.error("[useBookmark] Error checking bookmark status:", err);
      setError(err instanceof Error ? err.message : "북마크 상태 확인 실패");
      // 에러 발생 시 localStorage 확인
      const bookmarked = isLocalStorageBookmarked(contentId);
      setIsBookmarked(bookmarked);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, userId, contentId, supabase]);

  /**
   * 로그인 후 localStorage → DB 동기화
   */
  const syncLocalStorage = useCallback(async () => {
    if (!isSignedIn || !userId) return;

    const localBookmarks = getLocalStorageBookmarks();
    if (localBookmarks.length === 0) return;

    console.group("[useBookmark] Syncing localStorage to DB");
    console.log("Local bookmarks:", localBookmarks.length);

    try {
      const dbUserId = await getUserIdByClerkId(supabase, userId);
      if (!dbUserId) {
        console.warn("[useBookmark] User not found in DB, skipping sync");
        return;
      }

      const result = await syncLocalStorageToDB(supabase, dbUserId, localBookmarks);
      console.log("[useBookmark] Sync result:", result);

      if (result.success && result.synced > 0) {
        // 동기화 성공 시 localStorage 정리
        clearLocalStorageBookmarks();
        // 현재 북마크 상태 다시 확인
        await checkBookmarkStatus();
      }
    } catch (err) {
      console.error("[useBookmark] Error syncing localStorage:", err);
    } finally {
      console.groupEnd();
    }
  }, [isSignedIn, userId, supabase, checkBookmarkStatus]);

  /**
   * 북마크를 토글합니다.
   */
  const toggleBookmark = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    console.group("[useBookmark] Toggling bookmark");
    console.log("Content ID:", contentId);
    console.log("Is signed in:", isSignedIn);

    try {
      // 비인증 사용자: localStorage 사용
      if (!isSignedIn || !userId) {
        const currentlyBookmarked = isLocalStorageBookmarked(contentId);

        if (currentlyBookmarked) {
          removeLocalStorageBookmark(contentId);
          setIsBookmarked(false);
          console.log("[useBookmark] Removed from localStorage");
        } else {
          saveLocalStorageBookmark(contentId);
          setIsBookmarked(true);
          console.log("[useBookmark] Added to localStorage");
        }

        setIsLoading(false);
        console.groupEnd();
        return;
      }

      // 인증된 사용자: DB 사용
      const dbUserId = await getUserIdByClerkId(supabase, userId);
      if (!dbUserId) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }

      const currentlyBookmarked = await checkBookmark(supabase, dbUserId, contentId);

      if (currentlyBookmarked) {
        // 북마크 제거
        const result = await removeBookmark(supabase, dbUserId, contentId);
        if (result.success) {
          setIsBookmarked(false);
          console.log("[useBookmark] Removed from DB");
        } else {
          throw new Error(result.error || "북마크 제거 실패");
        }
      } else {
        // 북마크 추가
        const result = await addBookmark(supabase, dbUserId, contentId);
        if (result.success) {
          setIsBookmarked(true);
          console.log("[useBookmark] Added to DB");
        } else {
          // 중복 북마크 에러는 무시 (이미 북마크됨)
          if (result.error?.includes("이미 북마크")) {
            setIsBookmarked(true);
            console.log("[useBookmark] Already bookmarked");
          } else {
            throw new Error(result.error || "북마크 추가 실패");
          }
        }
      }
    } catch (err) {
      console.error("[useBookmark] Error toggling bookmark:", err);
      setError(err instanceof Error ? err.message : "북마크 처리 실패");
    } finally {
      setIsLoading(false);
      console.groupEnd();
    }
  }, [isLoading, contentId, isSignedIn, userId, supabase]);

  // 초기 상태 확인
  useEffect(() => {
    checkBookmarkStatus();
  }, [checkBookmarkStatus]);

  // 로그인 시 localStorage 동기화
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      syncLocalStorage();
    }
  }, [isLoaded, isSignedIn, syncLocalStorage]);

  return {
    isBookmarked,
    isLoading,
    toggleBookmark,
    error,
  };
}

