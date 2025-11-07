/**
 * @file bookmark.ts
 * @description 북마크 관련 타입 정의
 *
 * Supabase bookmarks 테이블과 연동되는 북마크 데이터 타입을 정의합니다.
 * PRD 문서의 북마크 기능 명세를 기반으로 작성되었습니다.
 */

/**
 * 북마크 데이터 타입 (Supabase bookmarks 테이블)
 */
export interface Bookmark {
  id: string; // UUID
  user_id: string; // UUID (users 테이블 참조)
  content_id: string; // 한국관광공사 API의 contentid
  created_at: string; // ISO 8601 형식의 타임스탬프
}

/**
 * 북마크 상태 타입
 */
export type BookmarkStatus = 'loading' | 'bookmarked' | 'unbookmarked' | 'error';

/**
 * localStorage에 저장되는 북마크 데이터 타입 (비인증 사용자용)
 */
export interface LocalStorageBookmark {
  content_id: string;
  created_at: string; // ISO 8601 형식의 타임스탬프
}

/**
 * 북마크 동기화 결과 타입
 */
export interface BookmarkSyncResult {
  success: boolean;
  synced: number; // 동기화된 북마크 개수
  failed: number; // 실패한 북마크 개수
  errors?: string[]; // 에러 메시지 배열
}

