/**
 * @file detail-hero.tsx
 * @description 관광지 상세 페이지 히어로 이미지 섹션
 *
 * 관광지의 대표 이미지를 큰 사이즈로 표시하고, 이미지 갤러리 썸네일을 제공하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 대표 이미지 큰 사이즈 표시
 * 2. 이미지 갤러리 썸네일 표시
 * 3. 이미지 클릭 시 갤러리 모달 열기 (향후 구현)
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - @/lib/types/tour: TourDetail, TourImage 타입
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import type { TourDetail, TourImage } from "@/lib/types/tour";

interface DetailHeroProps {
  /**
   * 관광지 상세 정보
   */
  tourDetail: TourDetail;
  /**
   * 이미지 갤러리 목록
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
 * 관광지 상세 페이지 히어로 이미지 섹션
 */
export default function DetailHero({ tourDetail, images, className }: DetailHeroProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // 대표 이미지 또는 첫 번째 이미지 선택
  const mainImage = isValidImageUrl(tourDetail.firstimage)
    ? tourDetail.firstimage
    : images.length > 0
    ? images[0].originimgurl
    : null;

  // 썸네일 이미지 목록 (대표 이미지 + 갤러리 이미지 최대 4개)
  const thumbnails = [
    ...(isValidImageUrl(tourDetail.firstimage) ? [tourDetail.firstimage!] : []),
    ...images.slice(0, 4).map((img) => img.originimgurl),
  ].filter(Boolean);

  if (!mainImage) {
    return (
      <section className={`flex flex-col gap-4 ${className || ""}`}>
        <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">이미지 없음</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`flex flex-col gap-4 ${className || ""}`}>
      {/* 대표 이미지 */}
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
        <Image
          src={mainImage}
          alt={tourDetail.title || "관광지 이미지"}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
        />
      </div>

      {/* 이미지 갤러리 썸네일 */}
      {thumbnails.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {thumbnails.map((thumbnail, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImageIndex === index
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
              aria-label={`이미지 ${index + 1} 선택`}
            >
              <Image
                src={thumbnail}
                alt={`${tourDetail.title || "관광지"} 이미지 ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
          {images.length > 4 && (
            <div className="flex-shrink-0 w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                +{images.length - 4}
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

