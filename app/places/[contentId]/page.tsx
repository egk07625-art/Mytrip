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
 * - @/lib/api/tour-api-client: fetchTourDetail 함수
 * - @/components/loading-page: LoadingPage 컴포넌트
 * - @/components/error-message-with-retry: ErrorMessageWithRetry 컴포넌트
 * - Tailwind CSS v4
 *
 * @see {@link /docs/PRD.md#2.4-상세페이지} - 상세페이지 요구사항
 * @see {@link /docs/TODO.md#3.2-기본-정보-섹션} - 구현 계획
 */

import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import BackButton from "@/components/back-button";
import DetailInfo from "@/components/tour-detail/detail-info";
import ErrorMessageWithRetry from "@/components/error-message-with-retry";
import { fetchTourDetail } from "@/lib/api/tour-api-client";
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

    // contentId 유효성 검사
    if (!contentId || isNaN(Number(contentId))) {
      return {
        title: "관광지 상세 | My Trip",
        description: "관광지 상세 정보를 확인하세요.",
      };
    }

    // API에서 관광지 정보 가져오기
    const tourDetail = await fetchTourDetail(contentId);

    if (!tourDetail) {
      return {
        title: `관광지 상세 #${contentId} | My Trip`,
        description: `관광지 상세 정보를 확인하세요. (ID: ${contentId})`,
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
        images: imageUrl ? [{ url: imageUrl }] : [],
      },
    };
  } catch (error) {
    console.error("[PlaceDetail] generateMetadata error:", error);
    // 에러 발생 시 기본 메타데이터 반환
    return {
      title: "관광지 상세 | My Trip",
      description: "관광지 상세 정보를 확인하세요.",
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
        {/* 헤더 영역: 뒤로가기 버튼 + 페이지 제목 */}
        <header className="w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="w-full max-w-7xl mx-auto flex items-center gap-4 px-4 py-4">
            <BackButton />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              관광지 상세
            </h1>
          </div>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col gap-8">
            {/* 기본 정보 섹션 */}
            <Suspense fallback={<DetailInfoSkeleton />}>
              <DetailContent contentId={contentId} />
            </Suspense>

            {/* 향후 추가될 섹션들 */}
            {/* 
            <section>
              <DetailMap contentId={contentId} />
            </section>
            <section>
              <DetailGallery contentId={contentId} />
            </section>
            <section>
              <DetailIntro contentId={contentId} />
            </section>
            */}
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

