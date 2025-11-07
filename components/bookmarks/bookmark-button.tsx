/**
 * @file bookmark-button.tsx
 * @description 관광지 상세 페이지 북마크 버튼 컴포넌트
 *
 * 관광지를 북마크하거나 북마크를 제거하는 기능을 제공하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 북마크 추가/제거 (인증된 사용자: DB, 비인증 사용자: localStorage)
 * 2. 북마크 상태 표시 (별 아이콘 채워짐/비어있음)
 * 3. 로딩 상태 표시 (버튼 비활성화)
 * 4. 성공/실패 토스트 메시지 표시
 * 5. 비인증 사용자 로그인 유도
 *
 * 핵심 구현 로직:
 * - Client Component로 구현 (useBookmark 훅 사용)
 * - useBookmark 훅으로 북마크 상태 관리
 * - ShareButton 컴포넌트 패턴 참고
 * - Spacing-First 정책 준수 (gap 사용, margin 금지)
 * - Tailwind CSS 클래스만 사용 (인라인 style 금지)
 * - 다크 모드 지원
 * - 접근성 (ARIA 라벨, 키보드 네비게이션)
 *
 * @dependencies
 * - sonner: toast 알림
 * - lucide-react: Star, StarOff 아이콘
 * - @/components/ui/button: shadcn/ui Button 컴포넌트
 * - @/hooks/use-bookmark: 북마크 상태 관리 훅
 * - @clerk/nextjs: useAuth 훅 (로그인 유도)
 *
 * @example
 * ```tsx
 * <BookmarkButton contentId="125266" />
 * ```
 */

"use client";

import { Star, StarOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useBookmark } from "@/hooks/use-bookmark";

interface BookmarkButtonProps {
  /**
   * 관광지 콘텐츠 ID
   */
  contentId: string;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 북마크 버튼 컴포넌트
 * 관광지를 북마크하거나 북마크를 제거합니다.
 */
export default function BookmarkButton({
  contentId,
  className,
}: BookmarkButtonProps) {
  const { isSignedIn } = useAuth();
  const { isBookmarked, isLoading, toggleBookmark, error } = useBookmark(contentId);

  /**
   * 북마크 토글 핸들러
   */
  const handleToggle = async () => {
    console.group("[BookmarkButton] Toggling bookmark");
    console.log("Content ID:", contentId);
    console.log("Current state:", isBookmarked);

    // 비인증 사용자: 로그인 유도
    if (!isSignedIn) {
      toast.info("로그인이 필요합니다", {
        description: "북마크 기능을 사용하려면 로그인해주세요.",
        duration: 3000,
      });
      console.log("[BookmarkButton] User not signed in, showing login prompt");
      console.groupEnd();
      return;
    }

    // 현재 상태 저장 (토글 후 예상 상태 계산용)
    const wasBookmarked = isBookmarked;

    // 북마크 토글 실행
    await toggleBookmark();

    // 에러 처리 (에러는 toggleBookmark 내부에서 처리되므로 여기서는 확인만)
    // 성공 메시지는 상태 변경 후 다음 렌더링에서 표시되므로 여기서는 표시하지 않음
    // 대신 즉시 피드백을 위해 예상 상태로 메시지 표시
    if (!error) {
      if (wasBookmarked) {
        console.log("[BookmarkButton] Bookmark removed");
        toast.success("북마크에서 제거되었습니다", {
          duration: 2000,
        });
      } else {
        console.log("[BookmarkButton] Bookmark added");
        toast.success("북마크에 추가되었습니다", {
          description: "나중에 다시 확인할 수 있습니다.",
          duration: 3000,
        });
      }
    }

    console.groupEnd();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={className}
      aria-label={isBookmarked ? "북마크 제거" : "북마크 추가"}
      title={isBookmarked ? "북마크 제거" : "북마크 추가"}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="hidden sm:inline">처리 중...</span>
        </>
      ) : isBookmarked ? (
        <>
          <Star className="w-4 h-4 fill-current" />
          <span className="hidden sm:inline">북마크됨</span>
        </>
      ) : (
        <>
          <StarOff className="w-4 h-4" />
          <span className="hidden sm:inline">북마크</span>
        </>
      )}
    </Button>
  );
}

