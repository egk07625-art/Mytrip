/**
 * @file test-error/page.tsx
 * @description 에러 핸들링 테스트 페이지 (개발 환경 전용)
 *
 * 전역 에러 핸들링이 제대로 작동하는지 테스트하기 위한 페이지입니다.
 * 프로덕션 환경에서는 이 페이지를 제거하거나 접근을 제한해야 합니다.
 *
 * 테스트 항목:
 * 1. app/error.tsx 동작 확인
 * 2. 에러 메시지 표시 확인
 * 3. 재시도 기능 확인
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function TestErrorPage() {
  const [shouldThrowError, setShouldThrowError] = useState(false);

  // 개발 환경에서만 접근 가능하도록 체크
  if (process.env.NODE_ENV === "production") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[calc(100vh-80px)] p-8">
        <AlertTriangle className="size-16 text-destructive" />
        <h1 className="text-2xl font-bold">접근 불가</h1>
        <p className="text-muted-foreground">
          이 페이지는 개발 환경에서만 사용할 수 있습니다.
        </p>
      </div>
    );
  }

  // 의도적으로 에러 발생
  if (shouldThrowError) {
    throw new Error("테스트 에러: 전역 에러 핸들링 테스트를 위한 의도적 에러입니다.");
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 min-h-[calc(100vh-80px)] p-8">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <AlertTriangle className="size-16 text-yellow-500" />
        <h1 className="text-3xl font-bold">에러 핸들링 테스트</h1>
        <p className="text-muted-foreground">
          이 페이지는 전역 에러 핸들링을 테스트하기 위한 페이지입니다.
        </p>
        <div className="flex flex-col gap-2 text-left bg-muted p-4 rounded-lg">
          <p className="font-semibold">테스트 방법:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>아래 버튼을 클릭하여 의도적으로 에러를 발생시킵니다.</li>
            <li>app/error.tsx가 에러를 캐치하는지 확인합니다.</li>
            <li>에러 메시지가 올바르게 표시되는지 확인합니다.</li>
            <li>재시도 버튼이 작동하는지 확인합니다.</li>
          </ol>
        </div>
      </div>
      <Button
        onClick={() => setShouldThrowError(true)}
        variant="destructive"
        size="lg"
      >
        에러 발생시키기
      </Button>
    </div>
  );
}

