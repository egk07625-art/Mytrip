/**
 * @file detail-gallery.tsx
 * @description 관광지 상세 페이지 이미지 갤러리 컴포넌트
 *
 * 관광지의 이미지들을 그리드 레이아웃으로 표시하고, 클릭 시 전체화면 모달로 보여주는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 이미지 그리드 레이아웃 표시 (반응형: 모바일 1열, 태블릿 2열, 데스크톱 3열)
 * 2. 이미지 클릭 시 전체화면 모달 열기
 * 3. 모달 내 이미지 슬라이드 기능 (이전/다음 버튼)
 * 4. 이미지 없을 경우 빈 상태 메시지 표시
 *
 * 핵심 구현 로직:
 * - Client Component로 구현 (이미지 모달 인터랙션)
 * - fetchTourImages로 이미지 목록 가져오기 (Server Component에서 전달)
 * - Next.js Image 컴포넌트 사용 (이미지 최적화)
 * - Dialog 컴포넌트로 모달 구현
 * - Spacing-First 정책 준수 (padding + gap, margin 금지)
 * - 다크 모드 지원
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - @/components/ui/dialog: Dialog 컴포넌트
 * - @/lib/types/tour: TourImage 타입
 * - lucide-react: 아이콘 (ChevronLeft, ChevronRight, Image)
 *
 * @example
 * ```tsx
 * <DetailGallery images={tourImages} />
 * ```
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { TourImage } from "@/lib/types/tour";

interface DetailGalleryProps {
  /**
   * 관광지 이미지 목록
   */
  images: TourImage[];
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
 * 이미지 URL을 가져오는 함수 (원본 우선, 없으면 썸네일)
 */
function getImageUrl(image: TourImage): string | null {
  if (isValidImageUrl(image.originimgurl)) {
    return image.originimgurl!;
  }
  if (isValidImageUrl(image.smallimageurl)) {
    return image.smallimageurl!;
  }
  return null;
}

/**
 * 이미지 갤러리 컴포넌트 (Client Component)
 */
export default function DetailGallery({
  images,
  className,
}: DetailGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  // 유효한 이미지만 필터링
  const validImages = images.filter((image) => getImageUrl(image) !== null);

  // 이미지가 없으면 빈 상태 표시
  if (validImages.length === 0) {
    return (
      <section
        className={`flex flex-col gap-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className || ""}`}
      >
        <div className="flex flex-col gap-4 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            이미지 갤러리
          </h2>
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-600" />
            <p className="text-base text-gray-500 dark:text-gray-400">
              이미지가 없습니다.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /**
   * 이전 이미지로 이동
   */
  const handlePrevious = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex(
      selectedImageIndex > 0 ? selectedImageIndex - 1 : validImages.length - 1
    );
  };

  /**
   * 다음 이미지로 이동
   */
  const handleNext = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex(
      selectedImageIndex < validImages.length - 1
        ? selectedImageIndex + 1
        : 0
    );
  };

  /**
   * 이미지 클릭 핸들러
   */
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  /**
   * 모달 닫기 핸들러
   */
  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };

  return (
    <>
      <section
        className={`flex flex-col gap-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className || ""}`}
      >
        {/* 섹션 제목 */}
        <div className="flex flex-col gap-4 p-6 pb-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            이미지 갤러리
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {validImages.length}개의 이미지
          </p>
        </div>

        {/* 이미지 그리드 */}
        <div className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {validImages.map((image, index) => {
              const imageUrl = getImageUrl(image);
              if (!imageUrl) return null;

              return (
                <button
                  key={`${image.contentid}-${image.serialnum || index}`}
                  onClick={() => handleImageClick(index)}
                  className="relative w-full aspect-video overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label={`이미지 ${index + 1} 보기`}
                >
                  <Image
                    src={imageUrl}
                    alt={image.imgname || `이미지 ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 이미지 모달 */}
      <Dialog
        open={selectedImageIndex !== null}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseModal();
          }
        }}
      >
        <DialogContent className="max-w-7xl w-[calc(100%-2rem)] p-0 bg-black/95 border-none">
          {selectedImageIndex !== null && validImages[selectedImageIndex] && (
            <div className="relative w-full h-[calc(100vh-8rem)] flex items-center justify-center">
              {/* 이미지 */}
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={getImageUrl(validImages[selectedImageIndex])!}
                  alt={
                    validImages[selectedImageIndex].imgname ||
                    `이미지 ${selectedImageIndex + 1}`
                  }
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>

              {/* 이전 버튼 */}
              {validImages.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-white/20"
                  aria-label="이전 이미지"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              )}

              {/* 다음 버튼 */}
              {validImages.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-white/20"
                  aria-label="다음 이미지"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              )}

              {/* 이미지 인덱스 표시 */}
              {validImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                  {selectedImageIndex + 1} / {validImages.length}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

