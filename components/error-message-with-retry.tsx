/**
 * @file error-message-with-retry.tsx
 * @description 에러 메시지 컴포넌트 (재시도 기능 포함)
 *
 * 재시도 버튼이 포함된 에러 메시지 컴포넌트입니다.
 * Client Component로 구현하여 페이지 새로고침 기능을 제공합니다.
 *
 * @dependencies
 * - @/components/error-message: ErrorMessage 컴포넌트
 */

"use client";

import ErrorMessage from "@/components/error-message";
import type { ErrorType } from "@/components/error-message";

interface ErrorMessageWithRetryProps {
  /**
   * 에러 메시지
   */
  message?: string;
  /**
   * 에러 타입
   */
  type?: ErrorType;
  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

/**
 * 재시도 기능이 포함된 에러 메시지 컴포넌트
 * @param message - 에러 메시지
 * @param type - 에러 타입
 * @param className - 추가 CSS 클래스
 */
export default function ErrorMessageWithRetry({ 
  message, 
  type = "api",
  className 
}: ErrorMessageWithRetryProps) {
  const handleRetry = () => {
    // 페이지 새로고침으로 재시도
    window.location.reload();
  };

  return (
    <ErrorMessage
      message={message}
      type={type}
      showRetry={true}
      onRetry={handleRetry}
      className={className}
    />
  );
}

