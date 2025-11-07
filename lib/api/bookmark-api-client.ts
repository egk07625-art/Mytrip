/**
 * @file bookmark-api-client.ts
 * @description 북마크 API 클라이언트
 *
 * Supabase bookmarks 테이블과 연동하는 북마크 관련 함수들을 제공합니다.
 *
 * 주요 기능:
 * 1. 북마크 추가/제거
 * 2. 북마크 상태 확인
 * 3. 북마크 목록 조회
 * 4. localStorage → DB 동기화
 *
 * 핵심 구현 로직:
 * - Supabase 클라이언트를 파라미터로 받는 순수 함수
 * - Clerk user ID를 사용하여 users 테이블에서 user_id 조회
 * - 에러 처리 및 로깅 포함
 * - UNIQUE 제약 위반 시 중복 북마크 에러 처리
 *
 * @dependencies
 * - @supabase/supabase-js: Supabase 클라이언트 타입
 * - @/lib/types/bookmark: 북마크 타입 정의
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
 * import { addBookmark, checkBookmark } from '@/lib/api/bookmark-api-client';
 *
 * export default function MyComponent() {
 *   const supabase = useClerkSupabaseClient();
 *
 *   async function handleBookmark(contentId: string) {
 *     const userId = await getUserIdByClerkId(supabase, clerkId);
 *     await addBookmark(supabase, userId, contentId);
 *   }
 * }
 * ```
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Bookmark, BookmarkSyncResult, LocalStorageBookmark } from "@/lib/types/bookmark";

/**
 * Clerk ID로 users 테이블에서 user_id (UUID)를 조회합니다.
 *
 * @param supabase Supabase 클라이언트
 * @param clerkId Clerk User ID
 * @returns user_id (UUID) 또는 null
 */
export async function getUserIdByClerkId(
  supabase: SupabaseClient,
  clerkId: string
): Promise<string | null> {
  console.group("[BookmarkAPI] Getting user ID by Clerk ID");
  console.log("Clerk ID:", clerkId);

  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkId)
      .single();

    if (error) {
      console.error("[BookmarkAPI] Error fetching user ID:", error);
      console.groupEnd();
      return null;
    }

    if (!data) {
      console.warn("[BookmarkAPI] User not found for Clerk ID:", clerkId);
      console.groupEnd();
      return null;
    }

    console.log("[BookmarkAPI] User ID found:", data.id);
    console.groupEnd();
    return data.id;
  } catch (error) {
    console.error("[BookmarkAPI] Unexpected error:", error);
    console.groupEnd();
    return null;
  }
}

/**
 * 북마크를 추가합니다.
 *
 * @param supabase Supabase 클라이언트
 * @param userId 사용자 ID (UUID)
 * @param contentId 관광지 콘텐츠 ID
 * @returns 성공 여부
 */
export async function addBookmark(
  supabase: SupabaseClient,
  userId: string,
  contentId: string
): Promise<{ success: boolean; error?: string }> {
  console.group("[BookmarkAPI] Adding bookmark");
  console.log("User ID:", userId);
  console.log("Content ID:", contentId);

  try {
    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        user_id: userId,
        content_id: contentId,
      })
      .select()
      .single();

    if (error) {
      // UNIQUE 제약 위반 (이미 북마크됨)
      if (error.code === "23505") {
        console.log("[BookmarkAPI] Bookmark already exists");
        console.groupEnd();
        return { success: false, error: "이미 북마크된 항목입니다." };
      }

      console.error("[BookmarkAPI] Error adding bookmark:", error);
      console.groupEnd();
      return { success: false, error: error.message };
    }

    console.log("[BookmarkAPI] Bookmark added successfully:", data);
    console.groupEnd();
    return { success: true };
  } catch (error) {
    console.error("[BookmarkAPI] Unexpected error:", error);
    console.groupEnd();
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 북마크를 제거합니다.
 *
 * @param supabase Supabase 클라이언트
 * @param userId 사용자 ID (UUID)
 * @param contentId 관광지 콘텐츠 ID
 * @returns 성공 여부
 */
export async function removeBookmark(
  supabase: SupabaseClient,
  userId: string,
  contentId: string
): Promise<{ success: boolean; error?: string }> {
  console.group("[BookmarkAPI] Removing bookmark");
  console.log("User ID:", userId);
  console.log("Content ID:", contentId);

  try {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("content_id", contentId);

    if (error) {
      console.error("[BookmarkAPI] Error removing bookmark:", error);
      console.groupEnd();
      return { success: false, error: error.message };
    }

    console.log("[BookmarkAPI] Bookmark removed successfully");
    console.groupEnd();
    return { success: true };
  } catch (error) {
    console.error("[BookmarkAPI] Unexpected error:", error);
    console.groupEnd();
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 북마크 상태를 확인합니다.
 *
 * @param supabase Supabase 클라이언트
 * @param userId 사용자 ID (UUID)
 * @param contentId 관광지 콘텐츠 ID
 * @returns 북마크 여부
 */
export async function checkBookmark(
  supabase: SupabaseClient,
  userId: string,
  contentId: string
): Promise<boolean> {
  console.group("[BookmarkAPI] Checking bookmark status");
  console.log("User ID:", userId);
  console.log("Content ID:", contentId);

  try {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", userId)
      .eq("content_id", contentId)
      .maybeSingle();

    if (error) {
      console.error("[BookmarkAPI] Error checking bookmark:", error);
      console.groupEnd();
      return false;
    }

    const isBookmarked = !!data;
    console.log("[BookmarkAPI] Bookmark status:", isBookmarked);
    console.groupEnd();
    return isBookmarked;
  } catch (error) {
    console.error("[BookmarkAPI] Unexpected error:", error);
    console.groupEnd();
    return false;
  }
}

/**
 * localStorage에 저장된 북마크를 DB에 동기화합니다.
 *
 * @param supabase Supabase 클라이언트
 * @param userId 사용자 ID (UUID)
 * @param bookmarks localStorage 북마크 배열
 * @returns 동기화 결과
 */
export async function syncLocalStorageToDB(
  supabase: SupabaseClient,
  userId: string,
  bookmarks: LocalStorageBookmark[]
): Promise<BookmarkSyncResult> {
  console.group("[BookmarkAPI] Syncing localStorage to DB");
  console.log("User ID:", userId);
  console.log("Bookmarks to sync:", bookmarks.length);

  const result: BookmarkSyncResult = {
    success: true,
    synced: 0,
    failed: 0,
    errors: [],
  };

  if (bookmarks.length === 0) {
    console.log("[BookmarkAPI] No bookmarks to sync");
    console.groupEnd();
    return result;
  }

  for (const bookmark of bookmarks) {
    // 중복 체크
    const isBookmarked = await checkBookmark(supabase, userId, bookmark.content_id);

    if (isBookmarked) {
      console.log(
        "[BookmarkAPI] Bookmark already exists, skipping:",
        bookmark.content_id
      );
      continue;
    }

    // 북마크 추가
    const addResult = await addBookmark(supabase, userId, bookmark.content_id);

    if (addResult.success) {
      result.synced++;
      console.log("[BookmarkAPI] Synced bookmark:", bookmark.content_id);
    } else {
      result.failed++;
      result.errors?.push(
        `북마크 추가 실패 (${bookmark.content_id}): ${addResult.error}`
      );
      console.error("[BookmarkAPI] Failed to sync bookmark:", bookmark.content_id);
    }
  }

  console.log("[BookmarkAPI] Sync completed:", result);
  console.groupEnd();
  return result;
}

/**
 * localStorage에서 북마크 목록을 가져옵니다.
 *
 * @returns localStorage 북마크 배열
 */
function getLocalStorageBookmarks(): LocalStorageBookmark[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem("bookmarks");
    if (!stored) return [];
    return JSON.parse(stored) as LocalStorageBookmark[];
  } catch (error) {
    console.error("[BookmarkAPI] Error reading localStorage:", error);
    return [];
  }
}

/**
 * 북마크 목록을 조회합니다.
 *
 * 인증된 사용자의 경우 Supabase DB에서 조회하고,
 * 비인증 사용자의 경우 localStorage에서 조회합니다.
 * 모든 결과는 created_at 기준 내림차순으로 정렬됩니다.
 *
 * @param supabase Supabase 클라이언트 (인증된 사용자일 경우 필수)
 * @param clerkId Clerk User ID (인증된 사용자일 경우 필수)
 * @returns 북마크 목록 (인증: Bookmark[], 비인증: LocalStorageBookmark[])
 */
export async function getBookmarks(
  supabase: SupabaseClient | null,
  clerkId: string | null
): Promise<Bookmark[] | LocalStorageBookmark[]> {
  console.group("[BookmarkAPI] Getting bookmarks");
  console.log("Clerk ID:", clerkId);
  console.log("Is authenticated:", !!clerkId && !!supabase);

  try {
    // 비인증 사용자: localStorage에서 조회
    if (!clerkId || !supabase) {
      console.log("[BookmarkAPI] Fetching from localStorage");
      const bookmarks = getLocalStorageBookmarks();

      // created_at 기준 내림차순 정렬 (최신순)
      const sortedBookmarks = bookmarks.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA; // 내림차순
      });

      console.log("[BookmarkAPI] Found bookmarks in localStorage:", sortedBookmarks.length);
      console.groupEnd();
      return sortedBookmarks;
    }

    // 인증된 사용자: DB에서 조회
    console.log("[BookmarkAPI] Fetching from database");
    const userId = await getUserIdByClerkId(supabase, clerkId);

    if (!userId) {
      console.warn("[BookmarkAPI] User not found in DB, falling back to localStorage");
      const bookmarks = getLocalStorageBookmarks();
      const sortedBookmarks = bookmarks.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
      console.log("[BookmarkAPI] Found bookmarks in localStorage:", sortedBookmarks.length);
      console.groupEnd();
      return sortedBookmarks;
    }

    const { data, error } = await supabase
      .from("bookmarks")
      .select("id, user_id, content_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[BookmarkAPI] Error fetching bookmarks from DB:", error);
      console.groupEnd();
      return [];
    }

    const bookmarks = (data || []) as Bookmark[];
    console.log("[BookmarkAPI] Found bookmarks in database:", bookmarks.length);
    console.groupEnd();
    return bookmarks;
  } catch (error) {
    console.error("[BookmarkAPI] Unexpected error:", error);
    console.groupEnd();
    return [];
  }
}

