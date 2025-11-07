# My Trip 개발 TODO

> 개발 시 `docs/guide.md` 가이드라인을 반드시 준수합니다.

## 📊 진행 상황 요약

- **Phase 0**: ✅ 완료 (개발 환경 준비)
- **Phase 1**: ✅ 완료 (기본 구조 & 공통 설정)
- **Phase 2**: ✅ 완료 (홈페이지 - 관광지 목록)
- **Phase 3**: ✅ 완료 (상세페이지) - 3.2 기본 정보 섹션 완료, 3.4 공유 기능 완료, 3.5 추가 정보 섹션 완료
- **Phase 4**: ✅ 완료 (북마크 페이지) - 4.2 북마크 기능 구현 완료, 4.3 북마크 목록 페이지 완료
- **Phase 5**: ⏸️ 부분 완료 (최적화 & 배포)

**다음 단계**: Phase 5 최적화 & 배포 (지도 연동, SEO 최적화 등)

## Phase 0: 개발 환경 및 가이드라인 준비

- [x] `docs/guide.md` 가이드라인 숙지
- [x] 기존 컴포넌트 라이브러리 확인 (`/components/ui/`)
  - [x] shadcn/ui 컴포넌트 확인 (button, input, form, label, textarea, dialog, accordion, loading-spinner, skeleton)
  - [x] named export 패턴 확인
- [x] 개발 가이드라인 준수 계획 수립
  - [x] `docs/guide-compliance-plan.md` 작성 완료

## Phase 1: 기본 구조 & 공통 설정

- [x] 프로젝트 셋업
- [x] API 클라이언트 구현 (`app/api/tour/route.ts`)
- [x] 기본 타입 정의 (`lib/types/tour.ts`)
  - [x] `TourItem` (목록용)
  - [x] `TourDetail` (상세 페이지 기본정보)
  - [x] `TourIntro` (운영정보)
  - [x] `TourImage` (이미지 갤러리)
  - [x] `AreaCode` (지역코드)
  - [x] `ContentTypeId` 상수 및 타입 정의
  - [x] `ApiResponse` 래퍼 타입
  - [x] `Coordinate` 좌표 변환 타입
  - [ ] `lib/types/festival.ts` (향후 확장용, 현재는 tour.ts의 CONTENT_TYPE.FESTIVAL 사용)
- [x] 레이아웃 구조 업데이트 (`app/layout.tsx`)
- [x] 공통 컴포넌트 (로딩, 에러 처리)
  - [x] `components/loading-page.tsx`
  - [x] `components/error-boundary.tsx`
  - [x] `components/error-message.tsx`
- [x] 가이드라인 준수 체크리스트
  - [x] 검증 스크립트 작성 (`scripts/verify-guidelines.ts`)
  - [x] npm 스크립트 추가 (`pnpm verify:guidelines`)
  - [x] 컴포넌트 네이밍 규칙 준수 (PascalCase, 도메인+역할+변형)
  - [x] Export 규칙 준수 (단일 컴포넌트는 default, 다중은 named)
  - [x] Spacing-First 정책 준수 (gap 우선, margin 금지) - Navbar.tsx 수정 완료
  - [x] Tailwind CSS 우선 사용 (인라인 style 금지)
  - [x] 불필요한 추상화 금지 체크
  - [x] 문서 파일 생성 완료 (`docs/component-verification-report.md`, `docs/design/DESIGN.md`, `docs/env-setup.md`)
  - [ ] 테스트 페이지 margin 수정 (auth-test, storage-test) - 선택 사항

## Phase 2: 홈페이지 (`/`) - 관광지 목록

### 2.1 페이지 기본 구조

- [x] `app/page.tsx` 생성 (현재 템플릿 페이지로 존재)
- [x] My Trip 홈페이지로 전환 (관광지 목록 페이지) - 기본 레이아웃 구조 완료
  - [x] 페이지 제목 영역
  - [x] 필터/컨트롤 영역 (플레이스홀더)
  - [x] 메인 콘텐츠 영역 (리스트 + 지도 레이아웃)
- [x] 기본 UI 구조 확인 (헤더: Navbar, 메인 영역, 푸터: 없음)

### 2.2 관광지 목록 기능 (MVP 2.1)

- [x] `components/tour-card.tsx` (관광지 카드 - 기본 정보만)
  - [x] 네이밍 규칙 준수 (`TourCard` PascalCase)
  - [x] Spacing-First 정책 적용 (padding + gap)
  - [x] Tailwind CSS 사용 (인라인 style 금지)
  - [x] Next.js Image 컴포넌트 사용
  - [x] 반응형 디자인 및 다크 모드 지원
  - [x] 접근성 개선 (ARIA, alt 텍스트)
- [x] `components/tour-list.tsx` (목록 표시)
  - [x] 불필요한 래퍼 컴포넌트 없는지 확인
  - [x] 그리드 레이아웃으로 카드 배치
  - [x] 빈 상태 처리
- [x] API 연동하여 실제 데이터 표시
  - [x] `areaBasedList2` API 연동
  - [x] `contentTypeId` 필수 파라미터 추가
  - [x] API 에러 처리 개선
- [x] 페이지 확인 및 스타일링 조정
  - [x] 레이아웃 비율 조정 (지도 구현 전까지 전체 너비 사용)
  - [x] Navbar 프로필 위치 수정 (우측 정렬)
- [x] 코드 품질 체크
  - [x] TypeScript 타입 정의 완료
  - [x] ESLint 규칙 준수
  - [x] 반응형 디자인 검증

### 2.3 필터 기능 추가

- [x] `components/tour-filters.tsx` (지역/타입 필터 UI)
- [x] 필터 동작 연결 (상태 관리)
- [x] 필터링된 결과 표시
- [x] 페이지 확인 및 UX 개선
  - [x] 로딩 상태 개선: 필터 변경 시 리스트 스켈레톤 표시
  - [x] 접근성: 라벨/aria 속성 재점검 및 키보드 내비게이션 확인
  - [x] 반응형: 모바일/태블릿 그리드 간격 및 Select 폭 최적화
  - [x] 에러/빈 상태 메시지 카피 개선 및 재시도 동작 확인
  - [x] URL 파라미터 유지 검증: 검색(`keyword`)과 조합 시 상태 일관성 점검

### 2.4 검색 기능 추가 (MVP 2.3)

#### 2.4.1 검색창 UI 컴포넌트 구현

- [x] `components/tour-search.tsx` 생성
  - [x] shadcn/ui Input 컴포넌트 사용
  - [x] Search 아이콘 추가 (lucide-react)
  - [x] 엔터 키 이벤트 처리
  - [x] 검색 버튼 클릭 이벤트 처리
  - [x] URL 파라미터 업데이트 로직
  - [x] Spacing-First 정책 준수
  - [x] 반응형 디자인 (모바일/데스크톱)
  - [x] 다크 모드 지원
  - [x] 접근성 (ARIA 라벨)

#### 2.4.2 검색 API 연동

- [x] `app/page.tsx`에 `fetchTourSearch` 함수 추가
- [x] `searchParams`에서 `keyword` 파라미터 읽기
- [x] API 엔드포인트 호출 (`/api/tour?endpoint=searchKeyword`)
- [x] URL 파라미터 처리 (keyword, areaCode, contentTypeId)
- [x] 에러 처리 및 로깅
- [x] 검색 결과 타입 정의 (`TourItem[]`)
- [x] `page.tsx`에서 검색/목록 로직 분기

#### 2.4.3 검색 결과 표시

- [x] 검색 결과를 `TourList` 컴포넌트에 전달
- [x] 검색 결과 개수 표시 UI
- [x] 빈 결과 처리 메시지
- [x] 검색 중 로딩 상태 표시
- [x] 에러 메시지 표시

#### 2.4.4 검색 + 필터 조합 동작

- [x] `TourSearch` 컴포넌트에서 필터 파라미터 유지 로직
- [x] `TourFilters` 컴포넌트에서 검색 키워드 유지 로직
- [x] `fetchTourSearch`에 필터 파라미터 전달 (API 연동 시 구현)
- [x] 필터 "전체" 선택 시 검색 버그 수정 (검색 시 "전체" 선택하면 모든 지역 검색)
- [x] 검색 + 필터 조합 테스트 (API 연동 후)
- [x] URL 파라미터 동기화 확인

#### 2.4.5 UX 개선 및 테스트

- [x] 로딩 스피너 추가 (API 연동 시 구현)
- [x] 검색 버튼 비활성화 로직 (중복 요청 방지, API 연동 시 구현)
- [x] 검색어 유효성 검사 (최소 2자)
- [x] 에러 메시지 개선 (유효성 검사 안내 메시지)
- [x] 모바일/데스크톱 반응형 테스트
- [x] 다크 모드 테스트
- [x] 접근성 테스트 (ARIA 라벨, role, aria-describedby 등)

**참고 문서**: `docs/plan-search-feature.md` - 상세 구현 계획

### 2.5 지도 연동 (MVP 2.2)

- [ ] `components/naver-map.tsx` (기본 지도 표시)
  - [ ] 네이밍 규칙 준수 (`NaverMap` 또는 `TourMap`)
  - [ ] 외부 라이브러리 래핑 (추상화 허용)
- [ ] 관광지 마커 표시
- [ ] 마커 클릭 시 인포윈도우
- [ ] 리스트-지도 연동 (클릭/호버)
- [ ] 반응형 레이아웃 (데스크톱: 분할, 모바일: 탭)
  - [ ] Spacing-First 정책 적용
- [ ] 페이지 확인 및 인터랙션 테스트

### 2.6 정렬 & 페이지네이션

- [ ] 정렬 옵션 추가 (최신순, 이름순)
- [ ] 페이지네이션 또는 무한 스크롤
- [ ] 로딩 상태 개선 (Skeleton UI)
- [ ] 최종 페이지 확인

## Phase 3: 상세페이지 (`/places/[contentId]`)

### 3.1 페이지 기본 구조

- [x] `app/places/[contentId]/page.tsx` 생성
  - [x] Next.js 15 동적 라우트 파라미터 처리 (`await params`)
  - [x] 메타데이터 동적 생성 (`generateMetadata`)
- [x] 기본 레이아웃 구조 (뒤로가기 버튼, 섹션 구분)
  - [x] Spacing-First 정책 적용
- [x] 라우팅 테스트 (홈에서 클릭 시 이동)

### 3.2 기본 정보 섹션 (MVP 2.4.1)

- [x] `components/tour-detail/detail-info.tsx`
  - [x] Client Component로 구현 (클립보드 API 사용)
  - [x] 관광지명, 이미지, 주소, 전화번호, 홈페이지, 개요 표시
  - [x] 관광 타입 뱃지 표시
  - [x] Spacing-First 정책 준수
  - [x] 반응형 디자인 및 다크 모드 지원
- [x] `detailCommon2` API 연동
  - [x] `lib/api/tour-api-client.ts`에 `fetchTourDetail` 함수 추가
  - [x] `app/places/[contentId]/page.tsx`에서 API 호출
  - [x] Suspense를 사용한 로딩 상태 처리 (스켈레톤 UI)
  - [x] 에러 상태 처리 (재시도 버튼 포함)
- [x] 관광지명, 이미지, 주소, 전화번호, 홈페이지, 개요 표시
  - [x] Next.js Image 컴포넌트를 사용한 이미지 최적화
  - [x] 이미지 없을 경우 플레이스홀더 처리
  - [x] 개요 줄바꿈 처리 (whitespace-pre-line)
- [x] 주소 복사 기능
  - [x] 클립보드 API 사용 (`navigator.clipboard.writeText()`)
  - [x] 복사 완료 시 버튼 상태 변경 (2초간 "복사됨" 표시)
  - [x] HTTPS 환경 폴백 처리
- [x] 전화번호 클릭 시 전화 연결
  - [x] `tel:` 프로토콜 링크 구현
  - [x] 모바일에서 전화 앱 자동 실행
- [x] 페이지 확인 및 스타일링
  - [x] 동적 메타데이터 생성 (Open Graph 포함)
  - [x] 로딩 스켈레톤 UI 구현
  - [x] 에러 메시지 및 재시도 기능
  - [x] 반응형 디자인 검증

### 3.3 지도 섹션 (MVP 2.4.4)

- [ ] `components/tour-detail/detail-map.tsx`
- [ ] 해당 관광지 위치 표시 (마커 1개)
- [ ] "길찾기" 버튼 (네이버 지도 연동)
- [ ] 페이지 확인

### 3.4 공유 기능 (MVP 2.4.5)

- [x] `components/tour-detail/share-button.tsx`
  - [x] 네이밍 규칙 준수 (`ShareButton` default export)
- [x] URL 복사 기능 (클립보드 API)
- [x] 복사 완료 토스트 메시지 (Sonner toast 사용)
- [x] Open Graph 메타태그 동적 생성
  - [x] Next.js 15 `generateMetadata` 함수 사용
- [x] 페이지 확인 및 공유 테스트
  - [x] 클립보드 API 폴백 처리 (HTTPS 환경)
  - [x] 접근성 (ARIA 라벨, 키보드 네비게이션)
  - [x] Spacing-First 정책 준수
  - [x] 다크 모드 지원

### 3.5 추가 정보 섹션 (MVP 2.4.2, 2.4.3)

- [x] `components/tour-detail/detail-intro.tsx` (운영 정보)
  - [x] Server Component로 구현
  - [x] 이용시간, 휴무일, 주차, 문의처 등 운영 정보 표시
  - [x] 빈 값 필드는 표시하지 않음
  - [x] Spacing-First 정책 준수
  - [x] 다크 모드 지원
- [x] `detailIntro2` API 연동
  - [x] `lib/api/tour-api-client.ts`에 `fetchTourIntro` 함수 추가
  - [x] contentTypeId 파라미터 포함
  - [x] 에러 처리 및 로깅
- [x] `components/tour-detail/detail-gallery.tsx` (이미지 갤러리)
  - [x] Client Component로 구현 (모달 인터랙션)
  - [x] 반응형 그리드 레이아웃 (모바일 1열, 태블릿 2열, 데스크톱 3열)
  - [x] 이미지 클릭 시 전체화면 모달
  - [x] 모달 내 슬라이드 기능 (이전/다음 버튼)
  - [x] Next.js Image 컴포넌트 사용
  - [x] Spacing-First 정책 준수
  - [x] 다크 모드 지원
- [x] `detailImage2` API 연동
  - [x] `lib/api/tour-api-client.ts`에 `fetchTourImages` 함수 추가
  - [x] 배열 반환 (빈 배열 폴백)
  - [x] 에러 처리 및 로깅
- [x] 페이지 통합 (`app/places/[contentId]/page.tsx`)
  - [x] DetailIntro와 DetailGallery 섹션 추가
  - [x] Suspense로 감싸서 독립적으로 로딩
  - [x] 로딩 스켈레톤 UI 구현 (DetailIntroSkeleton, DetailGallerySkeleton)
  - [x] 에러 처리 및 빈 상태 처리
- [x] 페이지 확인 및 스타일링
  - [x] 섹션 순서 확인 (기본 정보 → 운영 정보 → 이미지 갤러리)
  - [x] 반응형 디자인 검증

## Phase 4: 북마크 페이지 (`/bookmarks`) - 선택 사항

### 4.1 Supabase 설정

- [x] `supabase/migrations/mytrip_schema.sql` 마이그레이션 파일 (완료)
- [x] `users` 테이블 생성 (Clerk 연동) (완료)
- [x] `bookmarks` 테이블 생성 (완료)
- [x] RLS 비활성화 (개발 환경) (완료)
- [ ] 마이그레이션 적용 확인 (Supabase 프로젝트에서 실행 필요)
  - [ ] `docs/supabase-migration-guide.md` 참고하여 Supabase Dashboard에서 SQL 실행
  - [ ] `bookmarks` 테이블 생성 확인
  - [ ] Storage 버킷 설정 확인

### 4.2 북마크 기능 구현

- [x] `components/bookmarks/bookmark-button.tsx`
- [x] 상세페이지에 북마크 버튼 추가
- [x] Supabase DB 연동
- [x] 인증된 사용자 확인
- [x] 로그인하지 않은 경우 localStorage 임시 저장
- [x] 상세페이지에서 북마크 동작 확인

### 4.3 북마크 목록 페이지

#### 4.3.1 북마크 목록 조회 API 함수 추가

- [x] `lib/api/bookmark-api-client.ts`에 `getBookmarks` 함수 추가
  - [x] 인증된 사용자의 북마크 목록 조회 (content_id, created_at 포함)
  - [x] 비인증 사용자의 경우 localStorage에서 북마크 목록 조회
  - [x] 북마크 목록을 created_at 기준 내림차순으로 정렬하여 반환
  - [x] 에러 처리 및 로깅

#### 4.3.2 북마크 목록 페이지 생성

- [x] `app/bookmarks/page.tsx` 생성
  - [x] Server Component로 구현
  - [x] 인증 상태 확인 (Clerk)
  - [x] 북마크 목록 조회 및 관광지 상세 정보 병렬 조회
  - [x] 정렬 옵션 처리 (URL 파라미터 기반)
  - [x] 빈 상태 처리 (북마크 없음)
  - [x] 로딩 및 에러 상태 처리
  - [x] Spacing-First 정책 준수
  - [x] 반응형 디자인 및 다크 모드 지원

#### 4.3.3 북마크 리스트 컴포넌트 생성

- [x] `components/bookmarks/bookmark-list.tsx` 생성
  - [x] Client Component로 구현
  - [x] 북마크 목록 표시 (TourCard 재사용)
  - [x] 체크박스 선택 기능 (일괄 삭제용)
  - [x] 정렬 옵션 UI (최신순, 이름순, 지역별)
  - [x] 일괄 삭제 버튼 및 기능
  - [x] 빈 상태 UI
  - [x] Spacing-First 정책 준수
  - [x] 반응형 디자인 및 다크 모드 지원
  - [x] 접근성 (ARIA 라벨, 키보드 네비게이션)

#### 4.3.4 정렬 기능 구현

- [x] 정렬 옵션 구현
  - [x] 최신순: `created_at` 내림차순 (기본값)
  - [x] 이름순: `title` 오름차순 (가나다순)
  - [x] 지역별: `addr1` 기준 정렬 (간단한 지역코드 추출 로직 사용)
- [x] URL 파라미터로 정렬 옵션 전달 (`?sort=latest|name|region`)
- [x] 클라이언트 사이드 정렬 (서버에서 가져온 데이터 정렬)

#### 4.3.5 일괄 삭제 기능 구현

- [x] 체크박스로 여러 북마크 선택
- [x] "전체 선택" / "전체 해제" 기능
- [x] 선택된 북마크 일괄 삭제
- [x] 삭제 후 목록 자동 갱신
- [x] 삭제 확인 다이얼로그 (Dialog 컴포넌트 사용)

#### 4.3.6 관광지 정보 조회 최적화

- [x] `fetchTourDetail` 함수를 사용하여 각 content_id에 대해 병렬로 API 호출
- [x] Promise.allSettled를 사용하여 병렬 처리 (일부 실패해도 나머지 표시)
- [x] 실패한 항목은 에러 처리하되 나머지 항목은 표시
- [x] 로딩 상태는 스켈레톤 UI로 표시

#### 4.3.7 페이지 확인 및 테스트

- [x] 북마크 목록 표시 확인
  - [x] 인증된 사용자: DB에서 북마크 목록 조회
  - [x] 비인증 사용자: localStorage에서 북마크 목록 조회
- [x] 정렬 기능 확인 (최신순, 이름순, 지역별)
- [x] 일괄 삭제 기능 확인
- [x] 빈 상태 처리 확인
- [x] 에러 처리 확인 (관광지 정보 조회 실패 시)
- [x] 반응형 디자인 확인 (모바일, 태블릿, 데스크톱)
- [x] 다크 모드 지원 확인
- [x] 접근성 확인 (ARIA 라벨, 키보드 네비게이션)

## Phase 5: 최적화 & 배포

> **상세 계획**: `docs/plan-phase5-optimization.md` 참고

- [x] 이미지 최적화 (`next.config.ts` 외부 도메인 설정)
  - [x] 한국관광공사 API 이미지 도메인 추가 (`api.cdn.visitkorea.or.kr`, `tong.visitkorea.or.kr`)
  - [x] Next.js `Image` 컴포넌트 사용 (일반 `img` 태그 금지) - 구현 시 적용
  - [x] 배경 이미지 처리 패턴 적용 (Image 컴포넌트 + 오버레이)
- [x] 전역 에러 핸들링 개선
  - [x] `app/error.tsx` (서버/클라이언트 에러 처리)
  - [x] `app/global-error.tsx` (루트 레이아웃 에러 처리)
  - [x] `components/error-boundary.tsx` (React Error Boundary)
  - [x] `components/error-message.tsx` (에러 메시지 컴포넌트)
- [x] 404 페이지 (`app/not-found.tsx`)
- [x] SEO 최적화 (메타태그, sitemap, robots.txt)
  - [x] 기본 메타데이터 (`app/layout.tsx`)
  - [x] 동적 메타데이터 (상세페이지 `generateMetadata`)
  - [x] 동적 sitemap 생성 (`app/sitemap.ts`)
  - [x] 동적 robots.txt 생성 (`app/robots.ts`)
- [ ] 성능 측정 (Lighthouse 점수 > 80)
  - [x] 성능 최적화 가이드 작성 (`docs/performance-optimization-guide.md`)
  - [x] 이미지 최적화 적용 확인 (Next.js Image 컴포넌트 사용)
  - [x] 캐싱 전략 적용 확인 (revalidate: 3600)
  - [ ] Lighthouse 측정 실행 (로컬 및 프로덕션)
- [ ] 환경변수 보안 검증 (TOUR_API_KEY 확인)
  - [x] API 클라이언트에서 환경변수 처리 구현
  - [x] 환경변수 설정 가이드 작성 (`docs/env-setup.md`)
  - [x] 환경변수 검증 스크립트 작성 (`scripts/verify-env.ts`)
  - [x] npm 스크립트 추가 (`pnpm verify:env`)
- [ ] Vercel 배포 및 테스트
  - [x] Server Component에서 내부 API 호출 시 baseUrl 결정 로직 개선
  - [x] Next.js 15 headers() API를 사용하여 동적 URL 결정
  - [x] 디버깅 로그 강화 (요청 URL, 헤더, 환경변수 확인)
  - [x] Vercel 401 에러 해결 가이드 작성 (`docs/vercel-401-error-fix.md`)
  - [x] Vercel 빌드 타임 환경 변수 주입 개선 (`next.config.ts` env 설정)
  - [x] Clerk 환경 변수 디버깅 로그 강화 (`app/layout.tsx`)
  - [x] Vercel 환경 변수 문제 해결 가이드 작성
    - [x] `docs/vercel-clerk-env-fix.md`
    - [x] `docs/vercel-env-build-time-fix.md`
    - [x] `docs/vercel-env-not-injected-fix.md`
  - [x] API 라우트에 CORS 헤더 추가 (`/api/tour`, `/api/sync-user`)
  - [x] OPTIONS 핸들러 추가 (CORS preflight 지원)
  - [x] sync-user API 디버깅 로그 강화 (환경변수 체크, 에러 상세 정보)
- [ ] 최종 가이드라인 준수 체크리스트
  - [x] 가이드라인 검증 스크립트 작성 (`scripts/verify-guidelines.ts`)
  - [x] npm 스크립트 추가 (`pnpm verify:guidelines`)
  - [x] 통합 검증 스크립트 추가 (`pnpm verify:all`)
  - [ ] 불필요한 추상화 검증 실행
  - [ ] Export 규칙 검증 실행
  - [ ] 네이밍 규칙 검증 실행
  - [ ] Spacing-First 정책 검증 실행
  - [ ] Tailwind CSS 사용 검증 실행
  - [x] Next.js 15 동적 라우트 파라미터 처리 (`await params`)
  - [x] TypeScript 타입 검증 스크립트 추가 (`pnpm type-check`)
  - [ ] TypeScript 타입 검증 실행
  - [ ] 반응형 디자인 검증 (수동 테스트)
