import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Clerk ?ъ슜?먮? Supabase users ?뚯씠釉붿뿉 ?숆린?뷀븯??API
 *
 * ?대씪?댁뼵?몄뿉??濡쒓렇??????API瑜??몄텧?섏뿬 ?ъ슜???뺣낫瑜?Supabase????ν빀?덈떎.
 * ?대? 議댁옱?섎뒗 寃쎌슦 ?낅뜲?댄듃?섍퀬, ?놁쑝硫??덈줈 ?앹꽦?⑸땲??
 */
export async function POST(request: NextRequest) {
  try {
    console.group("[Sync User] Request received");
    console.log("[Sync User] Request URL:", request.url);
    console.log("[Sync User] Request headers:", Object.fromEntries(request.headers.entries()));
    
    // Clerk ?섍꼍蹂???뺤씤
    console.log("[Sync User] Clerk env check:", {
      hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      hasSecretKey: !!process.env.CLERK_SECRET_KEY,
      publishableKeyPrefix: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 10) || "N/A",
      isProductionKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_live_"),
      nodeEnv: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
    });

    // Clerk ?몄쬆 ?뺤씤
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
      console.error("  4. Clerk domain mismatch (check Clerk Dashboard ??Settings ??Domains)");
      console.groupEnd();
      
      return NextResponse.json(
        { 
          error: "Unauthorized",
          message: "?몄쬆???꾩슂?⑸땲?? 濡쒓렇?????ㅼ떆 ?쒕룄?댁＜?몄슂.",
          details: {
            hasUserId: false,
            clerkConfigured: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY,
          },
        },
        { status: 401 }
      );
    }

    console.log("[Sync User] Fetching user from Clerk...");
    // Clerk?먯꽌 ?ъ슜???뺣낫 媛?몄삤湲?    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    if (!clerkUser) {
      console.error("[Sync User] User not found in Clerk:", userId);
      console.groupEnd();
      return NextResponse.json(
        { 
          error: "User not found",
          message: "Clerk?먯꽌 ?ъ슜???뺣낫瑜?李얠쓣 ???놁뒿?덈떎.",
        },
        { status: 404 }
      );
    }

    console.log("[Sync User] Syncing to Supabase...");
    // Supabase???ъ슜???뺣낫 ?숆린??    const supabase = getServiceRoleClient();

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
        }
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
          message: "?ъ슜???뺣낫 ?숆린?붿뿉 ?ㅽ뙣?덉뒿?덈떎.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log("[Sync User] Success:", { userId: data?.clerk_id, name: data?.name });
    console.groupEnd();

    return NextResponse.json({
      success: true,
      user: data,
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error("[Sync User] Unexpected error:", error);
    console.error("[Sync User] Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("[Sync User] Error message:", error instanceof Error ? error.message : String(error));
    console.error("[Sync User] Error stack:", error instanceof Error ? error.stack : "N/A");
    console.groupEnd();
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "?쒕쾭 ?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎. ?좎떆 ???ㅼ떆 ?쒕룄?댁＜?몄슂.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// OPTIONS ?붿껌 泥섎━ (CORS preflight)
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
