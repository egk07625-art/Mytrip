/**
 * @file detail-info.tsx
 * @description 관광지 상세 페이지 기본 정보 컴포넌트
 *
 * 관광지의 기본 정보(이름, 이미지, 주소, 전화번호, 홈페이지, 개요)를 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 관광지명, 이미지, 주소, 전화번호, 홈페이지, 개요 표시
 * 2. 주소 복사 기능 (클립보드 API)
 * 3. 전화번호 클릭 시 전화 연결 (tel: 프로토콜)
 * 4. 관광 타입 뱃지 표시
 *
 * 핵심 구현 로직:
 * - Client Component로 구현 (클립보드 API 사용)
 * - Next.js Image 컴포넌트를 사용한 이미지 최적화
 * - 이미지 없을 경우 플레이스홀더 표시
 * - Spacing-First 정책 준수 (padding + gap, margin 금지)
 * - Tailwind CSS 클래스만 사용 (인라인 style 금지)
 * - 다크 모드 지원
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - lucide-react: 아이콘 (Copy, Phone, MapPin, Globe, ExternalLink)
 * - @/lib/types/tour: TourDetail 타입, CONTENT_TYPE_LABEL
 * - @/components/ui/button: shadcn/ui Button 컴포넌트
 *
 * @example
 * ```tsx
 * <DetailInfo tourDetail={tourDetail} />
 * ```
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { Copy, Phone, MapPin, Globe, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TourDetail } from "@/lib/types/tour";
import { CONTENT_TYPE_LABEL } from "@/lib/types/tour";

interface DetailInfoProps {
  /**
   * 관광지 상세 정보
   */
  tourDetail: TourDetail;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 이미지 URL이 유효한지 확인하는 헬퍼 함수
 */
function isValidImageUrl(url?: string): boolean {
  return Boolean(url && url.trim().length > 0);
}

/**
 * 관광 타입 라벨을 가져오는 헬퍼 함수
 */
function getContentTypeLabel(contenttypeid: string): string {
  return (
    CONTENT_TYPE_LABEL[contenttypeid as keyof typeof CONTENT_TYPE_LABEL] ||
    "기타"
  );
}

/**
 * 주소를 복사하는 함수
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
    console.error("[DetailInfo] Copy to clipboard error:", error);
    return false;
  }
}

export default function DetailInfo({
  tourDetail,
  className,
}: DetailInfoProps) {
  const [copied, setCopied] = useState(false);

  const imageUrl = tourDetail.firstimage || tourDetail.firstimage2;
  const hasImage = isValidImageUrl(imageUrl);
  const contentTypeLabel = getContentTypeLabel(tourDetail.contenttypeid);
  const fullAddress = tourDetail.addr2
    ? `${tourDetail.addr1} ${tourDetail.addr2}`
    : tourDetail.addr1;

  /**
   * 주소 복사 핸들러
   */
  const handleCopyAddress = async () => {
    const success = await copyToClipboard(fullAddress);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      alert("주소 복사에 실패했습니다. 수동으로 복사해주세요.");
    }
  };

  return (
    <section
      className={`flex flex-col gap-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className || ""}`}
    >
      {/* 기본 정보 */}
      <div className="flex flex-col gap-4 p-6">
        {/* 주소 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                주소
              </span>
              <div className="flex items-start gap-2">
                <span className="text-base text-gray-900 dark:text-white flex-1">
                  {fullAddress}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="flex items-center gap-2 flex-shrink-0"
                  aria-label="주소 복사"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="text-xs">복사됨</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="text-xs">복사</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 전화번호 */}
        {tourDetail.tel && (
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  전화번호
                </span>
                <a
                  href={`tel:${tourDetail.tel.replace(/[^0-9]/g, "")}`}
                  className="text-base text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  {tourDetail.tel}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 홈페이지 */}
        {tourDetail.homepage && (
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  홈페이지
                </span>
                <a
                  href={tourDetail.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  {tourDetail.homepage}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 개요 */}
        {tourDetail.overview && (
          <div className="flex flex-col gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              개요
            </span>
            <p className="text-base text-gray-900 dark:text-white leading-relaxed whitespace-pre-line">
              {tourDetail.overview}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}



