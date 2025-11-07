/**
 * @file tour.ts
 * @description 한국관광공사 API 관광지 관련 타입 정의
 *
 * 한국관광공사 공공 API 응답 데이터 구조를 TypeScript 타입으로 정의합니다.
 * PRD 문서의 데이터 구조 명세를 기반으로 작성되었습니다.
 */

/**
 * 관광지 목록 항목 (areaBasedList2 API 응답)
 */
export interface TourItem {
  addr1: string; // 주소
  addr2?: string; // 상세주소
  areacode: string; // 지역코드
  contentid: string; // 콘텐츠ID
  contenttypeid: string; // 콘텐츠타입ID
  title: string; // 제목
  mapx: string; // 경도 (KATEC 좌표계, 정수형)
  mapy: string; // 위도 (KATEC 좌표계, 정수형)
  firstimage?: string; // 대표이미지1
  firstimage2?: string; // 대표이미지2
  tel?: string; // 전화번호
  cat1?: string; // 대분류
  cat2?: string; // 중분류
  cat3?: string; // 소분류
  modifiedtime: string; // 수정일
}

/**
 * 관광지 상세 정보 (detailCommon2 API 응답)
 */
export interface TourDetail {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2?: string;
  zipcode?: string;
  tel?: string;
  homepage?: string;
  overview?: string; // 개요 (긴 설명)
  firstimage?: string;
  firstimage2?: string;
  mapx: string; // 경도 (KATEC 좌표계)
  mapy: string; // 위도 (KATEC 좌표계)
}

/**
 * 관광지 소개 정보 (detailIntro2 API 응답)
 * 타입별로 필드가 다르므로 선택적 필드로 정의
 */
export interface TourIntro {
  contentid: string;
  contenttypeid: string;
  usetime?: string; // 이용시간
  restdate?: string; // 휴무일
  infocenter?: string; // 문의처
  parking?: string; // 주차 가능
  chkpet?: string; // 반려동물 동반
  expguide?: string; // 체험 안내
  expagerange?: string; // 체험 가능 연령
  chkbabycarriage?: string; // 유모차 대여
  chkcreditcard?: string; // 신용카드 가능
  // 기타 타입별 필드들...
  [key: string]: string | undefined;
}

/**
 * 관광지 이미지 정보 (detailImage2 API 응답)
 */
export interface TourImage {
  contentid: string;
  originimgurl?: string; // 원본 이미지 URL
  smallimageurl?: string; // 썸네일 이미지 URL
  imgname?: string; // 이미지 이름
  serialnum?: string; // 이미지 순번
}

/**
 * 지역 코드 정보 (areaCode2 API 응답)
 */
export interface AreaCode {
  code: string; // 지역코드
  name: string; // 지역명
  rnum?: string; // 순번
}

/**
 * Content Type ID (관광 타입)
 */
export const CONTENT_TYPE = {
  TOURIST_SPOT: "12", // 관광지
  CULTURAL_FACILITY: "14", // 문화시설
  FESTIVAL: "15", // 축제/행사
  TRAVEL_COURSE: "25", // 여행코스
  LEISURE_SPORTS: "28", // 레포츠
  ACCOMMODATION: "32", // 숙박
  SHOPPING: "38", // 쇼핑
  RESTAURANT: "39", // 음식점
} as const;

export type ContentTypeId = (typeof CONTENT_TYPE)[keyof typeof CONTENT_TYPE];

/**
 * Content Type ID 라벨 매핑
 */
export const CONTENT_TYPE_LABEL: Record<ContentTypeId, string> = {
  "12": "관광지",
  "14": "문화시설",
  "15": "축제/행사",
  "25": "여행코스",
  "28": "레포츠",
  "32": "숙박",
  "38": "쇼핑",
  "39": "음식점",
};

/**
 * API 응답 공통 구조
 */
export interface ApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: T | T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

/**
 * 좌표 변환 유틸리티 타입
 * KATEC 좌표계를 WGS84로 변환하기 위한 헬퍼 함수의 타입
 */
export interface Coordinate {
  lng: number; // 경도 (WGS84)
  lat: number; // 위도 (WGS84)
}

/**
 * 정렬 옵션 타입
 */
export type SortOption = "latest" | "name";

/**
 * 정렬 옵션 라벨 매핑
 */
export const SORT_OPTION_LABEL: Record<SortOption, string> = {
  latest: "최신순",
  name: "이름순",
};


