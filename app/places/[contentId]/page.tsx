/**
 * @file page.tsx
 * @description 관광지 상세페이지
 *
 * 관광지의 상세 정보를 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 동적 라우트 파라미터 처리 (contentId)
 * 2. 동적 메타데이터 생성 (generateMetadata)
 * 3. 기본 레이아웃 구조 (뒤로가기 버튼, 섹션 구분)
 * 4. detailCommon2 API 연동 및 기본 정보 표시 (Phase 3.2)
 *
 * 현재 단계:
 * - Phase 3.2: 기본 정보 섹션 구현 완료
 * - Phase 3.4: 공유 기능 구현 완료
 * - Phase 3.5: 운영 정보 및 이미지 갤러리 섹션 구현 완료
 *
 * 핵심 구현 로직:
 * - Next.js 15 App Router 동적 라우트 파라미터 처리 (await params)
 * - Server Component로 구현
 * - generateMetadata 함수로 동적 메타데이터 생성
 * - fetchTourDetail로 관광지 상세 정보 가져오기
 * - DetailInfo 컴포넌트로 기본 정보 표시
 * - Spacing-First 정책 준수 (padding + gap, margin 금지)
 *
 * @dependencies
 * - Next.js 15 App Router
 * - @/components/back-button: BackButton 컴포넌트
 * - @/components/tour-detail/detail-info: DetailInfo 컴포넌트
 * - @/components/tour-detail/share-button: ShareButton 컴포넌트
 * - @/lib/api/tour-api-client: fetchTourDetail 함수
 * - @/components/loading-page: LoadingPage 컴포넌트
 * - @/components/error-message-with-retry: ErrorMessageWithRetry 컴포넌트
 * - Tailwind CSS v4
 *
 * @see {@link /docs/PRD.md#2.4-상세페이지} - 상세페이지 요구사항
 * @see {@link /docs/TODO.md#3.2-기본-정보-섹션} - 구현 계획
 * @see {@link /docs/TODO.md#3.4-공유-기능} - 공유 기능 구현 계획
 */

import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import BackButton from "@/components/back-button";
import DetailInfo from "@/components/tour-detail/detail-info";
import DetailIntro from "@/components/tour-detail/detail-intro";
import DetailGallery from "@/components/tour-detail/detail-gallery";
import DetailHero from "@/components/tour-detail/detail-hero";
import DetailQuickInfo from "@/components/tour-detail/detail-quick-info";
import DetailMap from "@/components/tour-detail/detail-map";
import ShareButton from "@/components/tour-detail/share-button";
import BookmarkButton from "@/components/bookmarks/bookmark-button";
import ErrorMessageWithRetry from "@/components/error-message-with-retry";
import {
  fetchTourDetail,
  fetchTourImages,
  fetchTourIntro,
} from "@/lib/api/tour-api-client";
import { CONTENT_TYPE_LABEL } from "@/lib/types/tour";
import { Skeleton } from "@/components/ui/skeleton";

interface PlaceDetailPageProps {
  params: Promise<{ contentId: string }>;
}

/**
 * 동적 메타데이터 생성 함수
 * API 연동하여 실제 관광지 정보로 메타데이터 생성
 */
export async function generateMetadata({
  params,
}: PlaceDetailPageProps): Promise<Metadata> {
  try {
    const { contentId } = await params;

    // 현재 페이지 URL 생성
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || "https";
    const baseUrl = host
      ? `${protocol}://${host}`
      : process.env.NEXT_PUBLIC_APP_URL || "https://mytrip.example.com";
    const pageUrl = `${baseUrl}/places/${contentId}`;

    // contentId 유효성 검사
    if (!contentId || isNaN(Number(contentId))) {
      return {
        title: "관광지 상세 | My Trip",
        description: "관광지 상세 정보를 확인하세요.",
        openGraph: {
          title: "관광지 상세 | My Trip",
          description: "관광지 상세 정보를 확인하세요.",
          type: "website",
          url: pageUrl,
          siteName: "My Trip",
          locale: "ko_KR",
        },
        twitter: {
          card: "summary",
          title: "관광지 상세 | My Trip",
          description: "관광지 상세 정보를 확인하세요.",
        },
      };
    }

    // API에서 관광지 정보 가져오기
    const tourDetail = await fetchTourDetail(contentId);

    if (!tourDetail) {
      return {
        title: `관광지 상세 #${contentId} | My Trip`,
        description: `관광지 상세 정보를 확인하세요. (ID: ${contentId})`,
        openGraph: {
          title: `관광지 상세 #${contentId} | My Trip`,
          description: `관광지 상세 정보를 확인하세요. (ID: ${contentId})`,
          type: "website",
          url: pageUrl,
          siteName: "My Trip",
          locale: "ko_KR",
        },
        twitter: {
          card: "summary",
          title: `관광지 상세 #${contentId} | My Trip`,
          description: `관광지 상세 정보를 확인하세요. (ID: ${contentId})`,
        },
      };
    }

    // 개요를 100자 이내로 제한
    const description =
      tourDetail.overview && tourDetail.overview.length > 100
        ? `${tourDetail.overview.substring(0, 100)}...`
        : tourDetail.overview || `관광지 상세 정보를 확인하세요.`;

    const imageUrl = tourDetail.firstimage || tourDetail.firstimage2;

    return {
      title: `${tourDetail.title} | My Trip`,
      description,
      openGraph: {
        title: `${tourDetail.title} | My Trip`,
        description,
        type: "website",
        url: pageUrl,
        siteName: "My Trip",
        locale: "ko_KR",
        images: imageUrl ? [{ url: imageUrl }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${tourDetail.title} | My Trip`,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch (error) {
    console.error("[PlaceDetail] generateMetadata error:", error);
    // 에러 발생 시 기본 메타데이터 반환
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || "https";
    const baseUrl = host
      ? `${protocol}://${host}`
      : process.env.NEXT_PUBLIC_APP_URL || "https://mytrip.example.com";
    const { contentId } = await params;
    const pageUrl = `${baseUrl}/places/${contentId}`;

    return {
      title: "관광지 상세 | My Trip",
      description: "관광지 상세 정보를 확인하세요.",
      openGraph: {
        title: "관광지 상세 | My Trip",
        description: "관광지 상세 정보를 확인하세요.",
        type: "website",
        url: pageUrl,
        siteName: "My Trip",
        locale: "ko_KR",
      },
      twitter: {
        card: "summary",
        title: "관광지 상세 | My Trip",
        description: "관광지 상세 정보를 확인하세요.",
      },
    };
  }
}

/**
 * contentId 유효성 검사 함수
 */
function isValidContentId(contentId: string): boolean {
  // contentId는 숫자 문자열이어야 함
  return /^\d+$/.test(contentId);
}

/**
 * 상세 정보 로딩 스켈레톤 컴포넌트
 */
function DetailInfoSkeleton() {
  return (
    <section className="flex flex-col gap-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="w-full aspect-video" />
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex flex-col gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </section>
  );
}

/**
 * 운영 정보 로딩 스켈레톤 컴포넌트
 */
function DetailIntroSkeleton() {
  return (
    <section className="flex flex-col gap-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="flex flex-col gap-4 p-6 pt-0">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * 이미지 갤러리 로딩 스켈레톤 컴포넌트
 */
function DetailGallerySkeleton() {
  return (
    <section className="flex flex-col gap-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="w-full aspect-video rounded-lg" />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * 지도 로딩 스켈레톤 컴포넌트
 */
function MapLoadingSkeleton() {
  return (
    <div
      className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse"
      style={{ minHeight: "400px" }}
      role="status"
      aria-label="지도 로딩 중"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          지도를 불러오는 중...
        </p>
      </div>
    </div>
  );
}

/**
 * 제목 및 액션 버튼 콘텐츠 컴포넌트
 */
async function TitleContent({ contentId }: { contentId: string }) {
  const tourDetail = await fetchTourDetail(contentId);
  if (!tourDetail) {
    return null;
  }

  const contentTypeLabel =
    CONTENT_TYPE_LABEL[
      tourDetail.contenttypeid as keyof typeof CONTENT_TYPE_LABEL
    ] || "기타";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          {tourDetail.title}
        </h1>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            🎯 {contentTypeLabel}
          </span>
          {tourDetail.addr1 && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              📍 {tourDetail.addr1.split(" ").slice(0, 2).join(" ")}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <BookmarkButton contentId={contentId} />
        <ShareButton />
      </div>
    </div>
  );
}

/**
 * 상세 정보 콘텐츠 컴포넌트 (Suspense 경계 내부)
 */
async function DetailContent({ contentId }: { contentId: string }) {
  console.group("[PlaceDetail] Fetching tour detail");
  console.log("Content ID:", contentId);

  const tourDetail = await fetchTourDetail(contentId);

  if (!tourDetail) {
    console.error("[PlaceDetail] Tour detail not found");
    console.groupEnd();
    return (
      <ErrorMessageWithRetry
        message="관광지 정보를 불러올 수 없습니다. 다시 시도해주세요."
        type="api"
      />
    );
  }

  console.log("[PlaceDetail] Tour detail loaded:", tourDetail.title);
  console.groupEnd();

  return <DetailInfo tourDetail={tourDetail} />;
}

/**
 * 운영 정보 콘텐츠 컴포넌트 (Suspense 경계 내부)
 */
async function IntroContent({
  contentId,
  contentTypeId,
}: {
  contentId: string;
  contentTypeId: string;
}) {
  return <DetailIntro contentId={contentId} contentTypeId={contentTypeId} />;
}

/**
 * 운영 정보 래퍼 컴포넌트 (tourDetail에서 contentTypeId 가져오기)
 */
async function IntroContentWrapper({ contentId }: { contentId: string }) {
  const tourDetail = await fetchTourDetail(contentId);
  if (!tourDetail || !tourDetail.contenttypeid) {
    return null;
  }
  return (
    <IntroContent
      contentId={contentId}
      contentTypeId={tourDetail.contenttypeid}
    />
  );
}

/**
 * 히어로 섹션 콘텐츠 컴포넌트 (Suspense 경계 내부)
 */
async function HeroContent({ contentId }: { contentId: string }) {
  const [tourDetail, images] = await Promise.all([
    fetchTourDetail(contentId),
    fetchTourImages(contentId),
  ]);
  if (!tourDetail) {
    return null;
  }
  return <DetailHero tourDetail={tourDetail} images={images} />;
}

/**
 * 빠른 정보 콘텐츠 컴포넌트 (Suspense 경계 내부)
 */
async function QuickInfoContent({ contentId }: { contentId: string }) {
  const tourDetail = await fetchTourDetail(contentId);
  if (!tourDetail || !tourDetail.contenttypeid) {
    return null;
  }
  const tourIntro = await fetchTourIntro(contentId, tourDetail.contenttypeid);
  return <DetailQuickInfo tourIntro={tourIntro} />;
}

/**
 * 이미지 갤러리 콘텐츠 컴포넌트 (Suspense 경계 내부)
 */
async function GalleryContent({ contentId }: { contentId: string }) {
  console.group("[PlaceDetail] Fetching tour images");
  console.log("Content ID:", contentId);

  const images = await fetchTourImages(contentId);

  console.log("[PlaceDetail] Tour images loaded:", images.length);
  console.groupEnd();

  return <DetailGallery images={images} />;
}

/**
 * 지도 콘텐츠 컴포넌트 (Suspense 경계 내부)
 */
async function MapContent({ contentId }: { contentId: string }) {
  console.group("[PlaceDetail] Fetching tour detail for map");
  console.log("Content ID:", contentId);

  const tourDetail = await fetchTourDetail(contentId);

  if (!tourDetail) {
    console.error("[PlaceDetail] Tour detail not found for map");
    console.groupEnd();
    return (
      <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        style={{ minHeight: "400px" }}>
        <div className="flex flex-col items-center gap-4 p-8 text-center max-w-md">
          <div className="text-6xl">⚠️</div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              지도를 불러올 수 없습니다
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              관광지 정보를 불러올 수 없습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log("[PlaceDetail] Tour detail loaded for map:", tourDetail.title);
  console.groupEnd();

  return <DetailMap tourDetail={tourDetail} />;
}

export default async function PlaceDetailPage({
  params,
}: PlaceDetailPageProps) {
  console.group("[PlaceDetail] Page render");

  try {
    // Next.js 15: params는 Promise이므로 await 필요
    const { contentId } = await params;
    console.log("Content ID:", contentId);

    // contentId 유효성 검사
    if (!contentId || !isValidContentId(contentId)) {
      console.error("[PlaceDetail] Invalid contentId:", contentId);
      console.groupEnd();
      notFound();
    }

    console.log("[PlaceDetail] Valid contentId, rendering page");
    console.groupEnd();

    return (
      <main className="min-h-[calc(100vh-80px)]">
        {/* 헤더 영역: 뒤로가기 버튼 + 페이지 제목 + 북마크 버튼 + 공유 버튼 */}
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
          <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 py-4">
            <div className="flex items-center gap-4">
              <BackButton />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                관광지 상세
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <BookmarkButton contentId={contentId} />
              <ShareButton />
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
          {/* 히어로 이미지 섹션 */}
          <section className="mb-8">
            <Suspense fallback={<DetailInfoSkeleton />}>
              <HeroContent contentId={contentId} />
            </Suspense>
          </section>

          {/* 제목 및 액션 버튼 */}
          <section className="mb-8">
            <Suspense fallback={<DetailInfoSkeleton />}>
              <TitleContent contentId={contentId} />
            </Suspense>
          </section>

          {/* 좌우 분할 레이아웃 (데스크톱) / 단일 컬럼 (모바일) */}
          <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8">
            {/* 좌측: 기본 정보, 개요, 운영 정보 */}
            <div className="flex flex-col gap-8">
              {/* 기본 정보 섹션 (이미지 제외) */}
              <Suspense fallback={<DetailInfoSkeleton />}>
                <DetailContent contentId={contentId} />
              </Suspense>

              {/* 운영 정보 섹션 */}
              <Suspense fallback={<DetailIntroSkeleton />}>
                <IntroContentWrapper contentId={contentId} />
              </Suspense>

              {/* 이미지 갤러리 섹션 */}
              <Suspense fallback={<DetailGallerySkeleton />}>
                <GalleryContent contentId={contentId} />
              </Suspense>
            </div>

            {/* 우측: 지도, 빠른 정보 카드 */}
            <div className="flex flex-col gap-6">
              {/* 빠른 정보 카드 */}
              <Suspense fallback={<DetailIntroSkeleton />}>
                <QuickInfoContent contentId={contentId} />
              </Suspense>

              {/* 지도 섹션 */}
              <div className="sticky top-24">
                <Suspense fallback={<MapLoadingSkeleton />}>
                  <MapContent contentId={contentId} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("[PlaceDetail] Page render error:", error);
    console.groupEnd();
    notFound();
  }
}

