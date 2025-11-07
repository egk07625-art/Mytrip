# TODO 18-19번 항목 구현 계획서

## 📋 개요

**대상 항목:**
- [ ] 기본 타입 정의 (`lib/types/tour.ts`, `lib/types/festival.ts`)
- [ ] 레이아웃 구조 업데이트 (`app/layout.tsx`)

**목표:**
- 한국관광공사 API 응답 데이터를 위한 타입 정의
- My Trip 서비스에 맞는 레이아웃 메타데이터 설정

**참고 문서:**
- PRD.md 5.1-5.3 데이터 구조
- guide.md 네이밍 규칙 및 Export 규칙

---

## 🎯 단계별 구현 계획

### 1단계: 타입 정의 디렉토리 구조 생성

**작업 내용:**
- `lib/types/` 디렉토리 생성
- 타입 파일 분리 전략 수립

**파일 구조:**
```
lib/types/
├── tour.ts          # 관광지 관련 타입 (목록, 상세, 운영정보)
├── festival.ts      # 축제/행사 관련 타입 (향후 확장용)
└── index.ts         # 타입 재내보내기 (선택사항)
```

**이유:**
- 관광지와 축제는 contentTypeId가 다르며 (12 vs 15), 향후 축제 전용 필드가 필요할 수 있음
- 모듈화를 통해 타입 의존성 관리 용이
- 확장성: 향후 다른 관광 타입 추가 시 유연하게 대응

---

### 2단계: 관광지 타입 정의 (`lib/types/tour.ts`)

**작업 내용:**
- PRD.md 5.1-5.3 기반 타입 정의
- API 응답 구조와 일치하는 타입 작성
- 공통 타입과 확장 타입 분리

**타입 목록:**

1. **TourItem** (목록용)
   - `areaBasedList2` API 응답 구조
   - 필수 필드: addr1, areacode, contentid, contenttypeid, title, mapx, mapy
   - 선택 필드: addr2, firstimage, firstimage2, tel, cat1, cat2, cat3, modifiedtime

2. **TourDetail** (상세 페이지 기본정보)
   - `detailCommon2` API 응답 구조
   - 필수 필드: contentid, contenttypeid, title, addr1, mapx, mapy
   - 선택 필드: addr2, zipcode, tel, homepage, overview, firstimage, firstimage2

3. **TourIntro** (상세 페이지 운영정보)
   - `detailIntro2` API 응답 구조
   - contentTypeId별로 필드가 다르므로 Union 타입 또는 공통 필드만 정의
   - 공통 필드: contentid, contenttypeid
   - 선택 필드: usetime, restdate, infocenter, parking, chkpet

4. **ContentTypeId** (관광 타입 상수)
   - 12: 관광지, 14: 문화시설, 15: 축제/행사, 25: 여행코스
   - 28: 레포츠, 32: 숙박, 38: 쇼핑, 39: 음식점

5. **API 응답 래퍼 타입**
   - `TourListResponse`, `TourDetailResponse`, `TourIntroResponse`
   - API 응답 구조: `{ response: { body: { items: { item: [] } } } }`

**구현 원칙:**
- 모든 필드를 명시적으로 타입 정의 (any 사용 금지)
- 선택 필드는 `?` 표기
- 주석으로 필드 용도 설명 (한국어)
- 확장 가능한 구조 (향후 필드 추가 용이)

---

### 3단계: 축제 타입 정의 (`lib/types/festival.ts`)

**작업 내용:**
- 현재는 축제 전용 필드가 없으므로 기본 구조만 정의
- 향후 확장을 위한 Placeholder 타입

**타입 목록:**

1. **FestivalItem** (향후 확장용)
   - TourItem을 기반으로 확장
   - 축제 전용 필드: startdate, enddate, eventplace 등 (향후 추가)

2. **FestivalDetail** (향후 확장용)
   - TourDetail을 기반으로 확장

**구현 원칙:**
- 현재는 TourItem을 재사용하거나 기본 구조만 정의
- 향후 축제 전용 API가 추가되면 확장
- 확장성 우선, 최소한의 구현

---

### 4단계: 레이아웃 메타데이터 업데이트 (`app/layout.tsx`)

**작업 내용:**
- 현재 메타데이터를 My Trip 서비스에 맞게 수정
- SEO 최적화를 위한 메타데이터 설정

**변경 사항:**

1. **기본 메타데이터:**
   ```typescript
   title: "My Trip - 전국 관광지 정보 서비스"
   description: "한국관광공사 공공 API를 활용한 전국 관광지 검색 및 상세 정보 서비스"
   ```

2. **Open Graph 메타데이터 추가 (선택사항):**
   - og:title, og:description, og:type
   - 향후 이미지 추가 가능

3. **기존 구조 유지:**
   - ClerkProvider, SyncUserProvider 구조 유지
   - Navbar 컴포넌트 유지
   - 폰트 설정 유지

**구현 원칙:**
- 기존 코드 최소 변경
- 메타데이터만 업데이트
- 향후 동적 메타데이터 생성 가능하도록 구조 유지

---

## 🔍 잠재 오류 분석

### 오류 1: API 응답 구조와 타입 불일치
**확률:** 70% (높음)
**원인:**
- API 응답 구조 변경
- 필드명 오타 또는 누락
- 중첩된 응답 구조 파싱 오류

**예방 조치:**
- 실제 API 응답을 로그로 확인 후 타입 정의
- API 응답 구조를 주석으로 상세히 기록
- 타입 정의 후 실제 API 호출 테스트 필수
- `zod` 같은 런타임 검증 라이브러리 고려 (향후)

**대응 방안:**
- 타입 정의 시 주석으로 실제 API 응답 예시 포함
- 타입 정의 후 실제 API 호출하여 검증
- 타입 에러 발생 시 즉시 수정

---

### 오류 2: 타입 파일 Import 경로 오류
**확률:** 30% (중간)
**원인:**
- `lib/types/` 디렉토리 생성 전 import 시도
- 상대 경로 오타
- TypeScript 경로 설정(`tsconfig.json`) 미확인

**예방 조치:**
- 디렉토리 생성 후 타입 파일 작성
- import 경로는 `@/lib/types/tour` 형식 사용 (절대 경로)
- `tsconfig.json`의 `paths` 설정 확인

**대응 방안:**
- 타입 파일 생성 전 `tsconfig.json` 확인
- import 시 IDE 자동완성 활용
- 빌드 시 타입 에러 즉시 확인

---

### 오류 3: 레이아웃 메타데이터 형식 오류
**확률:** 20% (낮음)
**원인:**
- Next.js Metadata 타입 불일치
- 한글 문자가 깨지는 경우 (UTF-8 인코딩)
- 메타데이터 형식 오류로 빌드 실패

**예방 조치:**
- Next.js 15 Metadata API 문서 참조
- 기존 메타데이터 형식 그대로 유지
- 빌드 전 테스트

**대응 방안:**
- 기존 메타데이터 형식 참조하여 동일 패턴 유지
- 빌드 에러 발생 시 Next.js 문서 확인
- 한글 문자는 정상적으로 처리됨 (기존 코드 확인)

---

## 📐 확장성 고려사항

### 타입 확장 전략
1. **Union 타입 활용:**
   - contentTypeId별로 다른 필드 구조를 Union 타입으로 표현
   - 예: `TourIntro = TourIntro12 | TourIntro14 | TourIntro15 | ...`

2. **Generic 타입 도입:**
   - API 응답 래퍼를 Generic으로 정의하여 재사용
   - 예: `ApiResponse<T>`

3. **타입 유틸리티 활용:**
   - `Pick`, `Omit`, `Partial` 등 TypeScript 유틸리티 타입 활용
   - 공통 필드 추출 및 재사용

### 향후 추가 가능한 타입
- `BookmarkItem`: 북마크 데이터 타입
- `AreaCode`: 지역 코드 타입
- `SearchParams`: 검색 파라미터 타입
- `FilterState`: 필터 상태 타입

---

## 🏗 모듈화 전략

### 타입 파일 분리 원칙
1. **도메인별 분리:**
   - `tour.ts`: 관광지 관련 (목록, 상세, 운영정보)
   - `festival.ts`: 축제/행사 관련 (향후 확장)
   - `bookmark.ts`: 북마크 관련 (향후 추가)

2. **사용 목적별 분리:**
   - API 응답 타입: `TourItem`, `TourDetail`
   - 내부 상태 타입: `FilterState`, `SearchParams` (향후)
   - 유틸리티 타입: `ContentTypeId`, `AreaCode`

3. **재사용성 고려:**
   - 공통 타입은 별도 파일로 분리 (`common.ts` 또는 `index.ts`)
   - 타입 재내보내기(`re-export`) 활용

---

## ✅ MVP 사용 룰

### 타입 정의 우선순위
1. **필수 (1단계):**
   - `TourItem` (목록 표시용)
   - `TourDetail` (상세 페이지 기본정보)
   - `ContentTypeId` (관광 타입 상수)

2. **선택 (2단계):**
   - `TourIntro` (운영정보 - 상세 페이지에서 사용)
   - API 응답 래퍼 타입

3. **향후 (3단계):**
   - `FestivalItem`, `FestivalDetail` (축제 전용 필드 추가 시)
   - 북마크 관련 타입

### 레이아웃 업데이트 우선순위
1. **필수 (1단계):**
   - 기본 메타데이터 (title, description) 업데이트

2. **선택 (2단계):**
   - Open Graph 메타데이터 추가
   - Favicon 추가

---

## 📝 구현 체크리스트

### 타입 정의
- [ ] `lib/types/` 디렉토리 생성
- [ ] `lib/types/tour.ts` 파일 생성 및 타입 정의
  - [ ] `TourItem` 타입 정의
  - [ ] `TourDetail` 타입 정의
  - [ ] `TourIntro` 타입 정의 (기본 구조)
  - [ ] `ContentTypeId` 상수 정의
  - [ ] API 응답 래퍼 타입 정의 (선택사항)
- [ ] `lib/types/festival.ts` 파일 생성 (기본 구조만)
- [ ] 타입 파일 import 테스트
- [ ] TypeScript 컴파일 에러 확인

### 레이아웃 업데이트
- [ ] `app/layout.tsx` 메타데이터 업데이트
  - [ ] `title` 수정
  - [ ] `description` 수정
  - [ ] Open Graph 메타데이터 추가 (선택사항)
- [ ] 빌드 테스트 (`pnpm build`)
- [ ] 개발 서버 테스트 (`pnpm dev`)

---

## 🚀 실행 순서

1. **타입 정의 우선** (안정성 확보)
   - 타입 정의 후 컴포넌트에서 사용 가능
   - 타입 에러 조기 발견

2. **레이아웃 업데이트** (빠른 시각적 피드백)
   - 메타데이터 변경으로 즉시 확인 가능

3. **검증 및 테스트**
   - TypeScript 컴파일 에러 확인
   - 빌드 테스트
   - 실제 API 호출 시 타입 검증

---

## 📚 참고 자료

- PRD.md 5.1-5.3: 데이터 구조 명세
- guide.md: 네이밍 규칙 및 Export 규칙
- Next.js 15 Metadata API: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html

---

**작성일:** 2025-01-XX
**작성자:** AI Assistant
**검토 필요:** 사용자 승인 후 진행




