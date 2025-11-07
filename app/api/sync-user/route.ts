import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Clerk 사용자를 Supabase users 테이블에 동기화하는 API
 *
 * 로그인한 사용자가 이 API를 호출하여 사용자 정보를 Supabase에 저장합니다.
 * 이미 존재하는 경우 업데이트하며, 없으면 새로 생성합니다.
 */
export async function POST(request: NextRequest) {
  try {
    console.group("[Sync User] Request received");
    console.log("[Sync User] Request URL:", request.url);
    console.log(
      "[Sync User] Request headers:",
      Object.fromEntries(request.headers.entries()),
    );

    // Clerk 환경 변수 확인
    console.log("[Sync User] Clerk env check:", {
      hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      hasSecretKey: !!process.env.CLERK_SECRET_KEY,
      publishableKeyPrefix:
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 10) ||
        "N/A",
      isProductionKey:
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_live_"),
      nodeEnv: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
    });

    // Clerk 인증 확인
    const { userId } = await auth();
    console.log("[Sync User] Auth result:", {
      userId: userId || "null",
      hasUserId: !!userId,
    });

    if (!userId) {
      console.error("[Sync User] Unauthorized - no userId");
      console.error("[Sync User] Possible causes:");
      console.error("  1. User not logged in");
      console.error("  2. Clerk session expired");
      console.error("  3. Clerk environment variables not configured");
      console.error(
        "  4. Clerk domain mismatch (check Clerk Dashboard → Settings → Domains)",
      );
      console.groupEnd();

      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "인증이 필요합니다. 로그인 후 다시 시도해주세요.",
          details: {
            hasUserId: false,
            clerkConfigured:
              !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
              !!process.env.CLERK_SECRET_KEY,
          },
        },
        { status: 401 },
      );
    }

    console.log("[Sync User] Fetching user from Clerk...");
    // Clerk에서 사용자 정보 가져오기
    const client = await clerkClient();

    if (!client) {
      console.error("[Sync User] Clerk client initialization failed");
      console.error("[Sync User] Clerk env check:", {
        hasSecretKey: !!process.env.CLERK_SECRET_KEY,
        secretKeyPrefix:
          process.env.CLERK_SECRET_KEY?.substring(0, 10) || "N/A",
      });
      console.groupEnd();
      return NextResponse.json(
        {
          error: "Internal server error",
          message: "Clerk 클라이언트 초기화에 실패했습니다.",
          details: "CLERK_SECRET_KEY 환경 변수를 확인해주세요.",
        },
        { status: 500 },
      );
    }

    console.log("[Sync User] Clerk client initialized:", !!client);
    const clerkUser = await client.users.getUser(userId);

    if (!clerkUser) {
      console.error("[Sync User] User not found in Clerk:", userId);
      console.groupEnd();
      return NextResponse.json(
        {
          error: "User not found",
          message: "Clerk에서 사용자 정보를 찾을 수 없습니다.",
        },
        { status: 404 },
      );
    }

    console.log("[Sync User] Syncing to Supabase...");
    // Supabase에 사용자 정보 동기화
    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          clerk_id: clerkUser.id,
          name:
            clerkUser.fullName ||
            clerkUser.username ||
            clerkUser.emailAddresses[0]?.emailAddress ||
            "Unknown",
        },
        {
          onConflict: "clerk_id",
        },
      )
      .select()
      .single();

    if (error) {
      console.error("[Sync User] Supabase sync error:", error);
      console.error("[Sync User] Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      console.groupEnd();

      return NextResponse.json(
        {
          error: "Failed to sync user",
          message: "사용자 정보 동기화에 실패했습니다.",
          details: error.message,
        },
        { status: 500 },
      );
    }

    console.log("[Sync User] Success:", {
      userId: data?.clerk_id,
      name: data?.name,
    });
    console.groupEnd();

    return NextResponse.json(
      {
        success: true,
        user: data,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    );
  } catch (error) {
    console.error("[Sync User] Unexpected error:", error);
    console.error(
      "[Sync User] Error type:",
      error instanceof Error ? error.constructor.name : typeof error,
    );
    console.error(
      "[Sync User] Error message:",
      error instanceof Error ? error.message : String(error),
    );
    console.error(
      "[Sync User] Error stack:",
      error instanceof Error ? error.stack : "N/A",
    );
    console.groupEnd();

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// OPTIONS 요청 처리 (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
