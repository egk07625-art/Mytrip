/**
 * @file back-button.tsx
 * @description 뒤로가기 버튼 컴포넌트
 *
 * 상세페이지 등에서 이전 페이지로 돌아가기 위한 버튼 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 이전 페이지로 이동 (브라우저 히스토리 또는 홈으로)
 * 2. 접근성 지원 (ARIA 라벨, 키보드 네비게이션)
 * 3. 반응형 디자인 및 다크 모드 지원
 *
 * 핵심 구현 로직:
 * - Next.js Link 컴포넌트를 사용한 네비게이션
 * - lucide-react의 ArrowLeft 아이콘 사용
 * - Spacing-First 정책 준수 (padding + gap, margin 금지)
 * - Tailwind CSS 클래스만 사용 (인라인 style 금지)
 *
 * @dependencies
 * - next/link: 클라이언트 사이드 네비게이션
 * - lucide-react: ArrowLeft 아이콘
 * - @/components/ui/button: shadcn/ui Button 컴포넌트
 *
 * @example
 * ```tsx
 * <BackButton />
 * <BackButton href="/custom-path" />
 * ```
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  /**
   * 특정 경로로 이동할 경우 지정
   * 지정하지 않으면 브라우저 히스토리로 뒤로가기
   */
  href?: string;
  /**
   * 추가 클래스명
   */
  className?: string;
}

export default function BackButton({ href, className }: BackButtonProps) {
  const router = useRouter();

  // href가 지정된 경우 Link 사용, 아니면 router.back() 사용
  if (href) {
    return (
      <Link href={href}>
        <Button
          variant="ghost"
          size="icon"
          className={`flex items-center justify-center gap-2 ${className || ""}`}
          aria-label="이전 페이지로 이동"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="sr-only">뒤로가기</span>
        </Button>
      </Link>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => router.back()}
      className={`flex items-center justify-center gap-2 ${className || ""}`}
      aria-label="이전 페이지로 이동"
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="sr-only">뒤로가기</span>
    </Button>
  );
}



