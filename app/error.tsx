/**
 * @file error.tsx
 * @description 전역 에러 핸들링 컴포넌트 (Next.js App Router)
 *
 * Next.js 15 App Router의 error.tsx는 서버/클라이언트 에러를 처리합니다.
 * 이 파일은 해당 세그먼트와 하위 세그먼트에서 발생한 에러를 캐치합니다.
 *
 * 주요 기능:
 * 1. 서버/클라이언트 에러 처리
 * 2. 에러 로깅
 * 3. 사용자 친화적인 에러 메시지 표시
 * 4. 재시도 기능 제공
 *
 * @dependencies
 * - @/components/error-message: ErrorMessage 컴포넌트
 * - next/navigation: useRouter
 */

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/error-message";
import { AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 에러 로깅 (향후 에러 모니터링 서비스 연동 가능)
    console.error("[Global Error]", error);
    
    // 에러 모니터링 서비스 연동 예시 (향후 확장)
    // if (process.env.NODE_ENV === 'production') {
    //   logErrorToService(error);
    // }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 min-h-[calc(100vh-80px)] p-8">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <AlertTriangle className="size-16 text-destructive" />
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            오류가 발생했습니다
          </h1>
          <p className="text-muted-foreground">
            예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 다시 시도해주세요.
          </p>
        </div>
        <ErrorMessage
          message={error.message || "알 수 없는 오류가 발생했습니다."}
          type="unknown"
          className="w-full"
        />
        {error.digest && (
          <p className="text-xs text-muted-foreground">
            오류 ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-4">
        <Button onClick={reset} variant="default" size="lg">
          다시 시도
        </Button>
        <Button
          onClick={() => (window.location.href = "/")}
          variant="outline"
          size="lg"
        >
          홈으로 가기
        </Button>
      </div>
    </div>
  );
}

