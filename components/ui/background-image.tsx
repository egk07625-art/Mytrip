/**
 * @file background-image.tsx
 * @description 배경 이미지 컴포넌트 (Image + 오버레이 패턴)
 *
 * Next.js Image 컴포넌트와 오버레이를 결합한 재사용 가능한 배경 이미지 컴포넌트입니다.
 * 인라인 스타일을 사용하지 않고 Tailwind CSS 클래스만 사용합니다.
 *
 * 주요 기능:
 * 1. Next.js Image 컴포넌트를 사용한 이미지 최적화
 * 2. 그라디언트 오버레이 지원 (선택적)
 * 3. 반응형 이미지 크기 최적화
 * 4. 접근성 고려 (aria-hidden 오버레이)
 *
 * 핵심 구현 로직:
 * - Image 컴포넌트의 fill 속성 사용
 * - 오버레이는 absolute positioning으로 Image 위에 배치
 * - 그라디언트는 Tailwind CSS 클래스로 구현
 *
 * @dependencies
 * - next/image: 이미지 최적화
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <BackgroundImage
 *   src="/hero.jpg"
 *   alt="Hero image"
 *   className="h-96"
 * />
 *
 * // 그라디언트 오버레이 포함
 * <BackgroundImage
 *   src="/hero.jpg"
 *   alt="Hero image"
 *   overlay="gradient-to-b from-transparent to-black/60"
 *   className="h-96"
 * />
 * ```
 */

import Image from "next/image";
import { cn } from "@/lib/utils";

interface BackgroundImageProps {
  /**
   * 이미지 소스 URL
   */
  src: string;
  /**
   * 이미지 대체 텍스트 (접근성)
   */
  alt: string;
  /**
   * 추가 CSS 클래스명
   */
  className?: string;
  /**
   * 이미지 컨테이너 클래스명
   */
  containerClassName?: string;
  /**
   * 그라디언트 오버레이 클래스명
   * 예: "gradient-to-b from-transparent to-black/60"
   * 없으면 오버레이 없음
   */
  overlay?: string;
  /**
   * 이미지 우선순위 (above-the-fold 이미지에 사용)
   */
  priority?: boolean;
  /**
   * 반응형 이미지 크기 설정
   */
  sizes?: string;
  /**
   * 이미지 object-fit 클래스
   */
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

/**
 * 배경 이미지 컴포넌트
 * Next.js Image 컴포넌트와 오버레이를 결합한 재사용 가능한 컴포넌트
 */
export default function BackgroundImage({
  src,
  alt,
  className,
  containerClassName,
  overlay,
  priority = false,
  sizes = "100vw",
  objectFit = "cover",
}: BackgroundImageProps) {
  const objectFitClass = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
    none: "object-none",
    "scale-down": "object-scale-down",
  }[objectFit];

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        containerClassName,
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn(objectFitClass)}
      />
      {overlay && (
        <div
          className={cn("absolute inset-0 bg-gradient-to-b", overlay)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

