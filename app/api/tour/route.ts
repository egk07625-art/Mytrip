/**
 * @file route.ts
 * @description 한국관광공사 API 프록시 엔드포인트
 *
 * 클라이언트에서 한국관광공사 API를 호출할 수 있도록 프록시 역할을 수행합니다.
 * 서버 사이드에서만 API 키를 사용하여 보안을 유지합니다.
 *
 * 지원하는 엔드포인트:
 * - GET /api/tour?endpoint=areaCode
 * - GET /api/tour?endpoint=areaBasedList
 * - GET /api/tour?endpoint=searchKeyword
 * - GET /api/tour?endpoint=detailCommon
 * - GET /api/tour?endpoint=detailIntro
 * - GET /api/tour?endpoint=detailImage
 */

import { NextRequest, NextResponse } from "next/server";

const TOUR_API_BASE_URL = "https://apis.data.go.kr/B551011/KorService2";

/**
 * 환경변수에서 API 키 가져오기
 */
function getTourApiKey(): string {
  const apiKey =
    process.env.TOUR_API_KEY || process.env.NEXT_PUBLIC_TOUR_API_KEY;

  if (!apiKey) {
    throw new Error("TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY가 설정되지 않았습니다.");
  }

  // 공백 제거 (환경변수에 공백이 포함될 수 있음)
  return apiKey.trim();
}

/**
 * 공통 파라미터 생성
 */
function getCommonParams() {
  return {
    serviceKey: getTourApiKey(),
    MobileOS: "ETC",
    MobileApp: "MyTrip",
    _type: "json",
  };
}

/**
 * API 엔드포인트별 URL 및 파라미터 매핑
 */
const ENDPOINT_CONFIG = {
  areaCode: {
    path: "/areaCode2",
    requiredParams: ["serviceKey", "MobileOS", "MobileApp"],
  },
  areaBasedList: {
    path: "/areaBasedList2",
    requiredParams: ["serviceKey", "MobileOS", "MobileApp", "areaCode", "contentTypeId"],
  },
  searchKeyword: {
    path: "/searchKeyword2",
    requiredParams: ["serviceKey", "MobileOS", "MobileApp", "keyword"],
  },
  detailCommon: {
    path: "/detailCommon2",
    requiredParams: ["serviceKey", "MobileOS", "MobileApp", "contentId"],
  },
  detailIntro: {
    path: "/detailIntro2",
    requiredParams: [
      "serviceKey",
      "MobileOS",
      "MobileApp",
      "contentId",
      "contentTypeId",
    ],
  },
  detailImage: {
    path: "/detailImage2",
    requiredParams: ["serviceKey", "MobileOS", "MobileApp", "contentId"],
  },
} as const;

type EndpointType = keyof typeof ENDPOINT_CONFIG;

/**
 * API 요청 처리
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const endpoint = searchParams.get("endpoint") as EndpointType | null;

    // 엔드포인트 검증
    if (!endpoint || !ENDPOINT_CONFIG[endpoint]) {
      return NextResponse.json(
        {
          error: "Invalid endpoint",
          message: `지원하는 엔드포인트: ${Object.keys(ENDPOINT_CONFIG).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const config = ENDPOINT_CONFIG[endpoint];
    const commonParams = getCommonParams();

    // 쿼리 파라미터 수집 (공통 파라미터 먼저 추가)
    const apiParams = new URLSearchParams({
      ...commonParams,
    });

    // 필수 파라미터 검증 및 추가 (commonParams에 포함된 것은 제외)
    const commonParamKeys = Object.keys(commonParams);
    for (const param of config.requiredParams) {
      // commonParams에 이미 포함된 파라미터는 건너뛰기
      if (commonParamKeys.includes(param)) {
        continue;
      }

      const value = searchParams.get(param);
      if (!value) {
        return NextResponse.json(
          {
            error: "Missing required parameter",
            message: `필수 파라미터가 누락되었습니다: ${param}`,
            required: config.requiredParams,
          },
          { status: 400 }
        );
      }
      apiParams.append(param, value);
    }

    // 선택적 파라미터 추가 (numOfRows, pageNo 등)
    const optionalParams = ["numOfRows", "pageNo", "sigunguCode"];
    for (const param of optionalParams) {
      const value = searchParams.get(param);
      if (value) {
        apiParams.append(param, value);
      }
    }

    // API 호출
    // 공공데이터포털 API는 serviceKey를 URL 인코딩해서 전달해야 함
    // URLSearchParams가 자동으로 인코딩하지만, 일부 특수문자 처리 확인
    const apiUrl = `${TOUR_API_BASE_URL}${config.path}?${apiParams.toString()}`;

    console.group(`[Tour API] ${endpoint}`);
    console.log("URL (masked):", apiUrl.replace(getTourApiKey(), "***"));
    console.log("Params (masked):", Object.fromEntries(
      Array.from(apiParams.entries()).map(([key, value]) => 
        [key, key === 'serviceKey' ? '***' : value]
      )
    ));
    console.log("API Key exists:", !!getTourApiKey());
    console.log("API Key length:", getTourApiKey().length);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 3600, // 1시간 캐싱
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      console.error("Request URL (masked):", apiUrl.replace(getTourApiKey(), "***"));
      console.error("API Key exists:", !!getTourApiKey());
      console.error("API Key length:", getTourApiKey().length);
      console.groupEnd();

      // 401 에러인 경우 더 자세한 정보 제공
      if (response.status === 401) {
        return NextResponse.json(
          {
            error: "Authentication failed",
            message: "API 키가 유효하지 않거나 인증에 실패했습니다. 환경변수 TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY를 확인해주세요.",
            status: response.status,
            details: errorText.substring(0, 500), // 에러 메시지 처음 500자만
          },
          { status: response.status }
        );
      }

      return NextResponse.json(
        {
          error: "Tour API request failed",
          message: `API 요청 실패: ${response.status} ${response.statusText}`,
          details: errorText.substring(0, 500),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // API 응답 구조 검증
    if (data.response?.header?.resultCode !== "0000") {
      const resultMsg = data.response?.header?.resultMsg || "Unknown error";
      console.error("API Error Response:", resultMsg);
      console.groupEnd();

      return NextResponse.json(
        {
          error: "Tour API error",
          message: resultMsg,
          resultCode: data.response?.header?.resultCode,
        },
        { status: 400 }
      );
    }

    console.log("Success:", data.response?.body?.totalCount || 0, "items");
    console.groupEnd();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[Tour API] Error:", error);

    // 환경변수 에러인 경우
    if (error instanceof Error && error.message.includes("TOUR_API_KEY")) {
      return NextResponse.json(
        {
          error: "Configuration error",
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


