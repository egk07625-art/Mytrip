/**
 * @file share-button.tsx
 * @description 관광지 상세 페이지 공유 버튼 컴포넌트
 *
 * 현재 페이지 URL을 클립보드에 복사하는 공유 기능을 제공하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 현재 페이지 URL 복사 (클립보드 API)
 * 2. 복사 완료 토스트 메시지 표시
 * 3. 복사 실패 시 에러 토스트 표시
 *
 * 핵심 구현 로직:
 * - Client Component로 구현 (클립보드 API 사용)
 * - Sonner toast를 사용한 알림 표시
 * - DetailInfo의 copyToClipboard 패턴 참고
 * - Spacing-First 정책 준수 (gap 사용, margin 금지)
 * - Tailwind CSS 클래스만 사용 (인라인 style 금지)
 * - 다크 모드 지원
 * - 접근성 (ARIA 라벨, 키보드 네비게이션)
 *
 * @dependencies
 * - sonner: toast 알림
 * - lucide-react: Share2 아이콘
 * - @/components/ui/button: shadcn/ui Button 컴포넌트
 *
 * @example
 * ```tsx
 * <ShareButton />
 * ```
 */

"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * URL을 클립보드에 복사하는 함수
 * DetailInfo의 copyToClipboard 패턴 참고
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 폴백: 구식 방법 (HTTPS가 아닌 환경)
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        document.body.removeChild(textArea);
        return true;
      } catch {
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (error) {
    console.error("[ShareButton] Copy to clipboard error:", error);
    return false;
  }
}

/**
 * 공유 버튼 컴포넌트
 * 현재 페이지 URL을 클립보드에 복사합니다.
 */
export default function ShareButton({ className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  /**
   * URL 복사 핸들러
   */
  const handleShare = async () => {
    console.group("[ShareButton] Sharing URL");
    
    // 현재 페이지 URL 가져오기
    const currentUrl = window.location.href;
    console.log("[ShareButton] Current URL:", currentUrl);

    const success = await copyToClipboard(currentUrl);
    
    if (success) {
      console.log("[ShareButton] URL copied successfully");
      setCopied(true);
      toast.success("링크가 복사되었습니다", {
        description: "공유하고 싶은 곳에 붙여넣으세요.",
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 2000);
    } else {
      console.error("[ShareButton] Failed to copy URL");
      toast.error("링크 복사에 실패했습니다", {
        description: "수동으로 복사해주세요.",
        duration: 3000,
      });
    }
    
    console.groupEnd();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={className}
      aria-label="링크 공유"
      title="링크 복사"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          <span className="hidden sm:inline">복사됨</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">공유</span>
        </>
      )}
    </Button>
  );
}

