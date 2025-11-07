import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/navbar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Trip - 전국 관광지 정보",
  description: "한국관광공사 공공 API를 활용한 전국 관광지 검색 및 정보 서비스",
  keywords: ["관광지", "여행", "한국관광", "관광정보", "여행코스"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 빌드 타임과 런타임 모두에서 환경 변수 접근 시도
  // next.config.ts의 env 설정을 통해 주입된 환경 변수도 확인
  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    (typeof window !== "undefined" ? (window as any).__NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY__ : undefined);

  // 빌드 시점 환경 변수 디버깅 (개발 환경에서만 출력)
  // 프로덕션에서는 보안상 상세 로그를 출력하지 않음
  if (typeof window === "undefined" && process.env.NODE_ENV === "development") {
    // 서버 사이드 (빌드 타임 포함) - 개발 환경에서만
    const allEnvKeys = Object.keys(process.env);
    const clerkEnvKeys = allEnvKeys.filter((key) => key.includes("CLERK"));
    
    console.log("[Layout] ========== ENVIRONMENT CHECK ==========");
    console.log("[Layout] Server-side environment check:", {
      hasPublishableKey: !!publishableKey,
      keyPrefix: publishableKey?.substring(0, 10) || "NOT_SET",
      keyLength: publishableKey?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,
      vercelEnv: process.env.VERCEL_ENV || "N/A",
      allEnvKeysCount: allEnvKeys.length,
      clerkEnvKeys: clerkEnvKeys,
      allClerkEnvVars: clerkEnvKeys.map((key) => ({
        key,
        hasValue: !!process.env[key],
        valueLength: process.env[key]?.length || 0,
      })),
    });
    console.log("[Layout] ========================================");
  }

  if (!publishableKey) {
    // 빌드 시점에 더 자세한 정보 제공
    const allEnvKeys = Object.keys(process.env);
    const clerkEnvKeys = allEnvKeys.filter((key) => key.includes("CLERK"));
    
    const errorMessage = [
      "❌ Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      "",
      "📋 Debug Info:",
      `  - NODE_ENV: ${process.env.NODE_ENV || "undefined"}`,
      `  - VERCEL: ${process.env.VERCEL ? "true" : "false"}`,
      `  - VERCEL_ENV: ${process.env.VERCEL_ENV || "undefined"}`,
      `  - Total env vars: ${allEnvKeys.length}`,
      `  - CLERK env vars found: ${clerkEnvKeys.length > 0 ? clerkEnvKeys.join(", ") : "none"}`,
      ...(clerkEnvKeys.length > 0
        ? clerkEnvKeys.map(
            (key) =>
              `  - ${key}: ${process.env[key] ? `exists (length: ${process.env[key]?.length})` : "undefined"}`
          )
        : []),
      "",
      "🔧 Solution:",
      "  1. Go to Vercel Dashboard → Settings → Environment Variables",
      "  2. Verify NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY exists",
      "  3. Check Production AND Preview environments are selected",
      "  4. Ensure value has no quotes or spaces",
      "  5. Clear build cache and redeploy",
      "",
      "💡 If env var exists but still not found:",
      "  - Check if it's set for the correct environment (Production/Preview)",
      "  - Try deleting and re-adding the environment variable",
      "  - Use Vercel CLI: vercel --prod --force",
    ].join("\n");

    // 에러를 throw하기 전에 로그 출력 (프로덕션에서도 출력)
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  return (
    <ClerkProvider publishableKey={publishableKey} localization={koKR}>
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SyncUserProvider>
            <Navbar />
            {children}
            <Toaster />
          </SyncUserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
