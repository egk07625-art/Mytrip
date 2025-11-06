# My Trip 개발 TODO

> 개발 시 `docs/guide.md` 가이드라인을 반드시 준수합니다.

## Phase 0: 개발 환경 및 가이드라인 준비

- [x] `docs/guide.md` 가이드라인 숙지
- [x] 기존 컴포넌트 라이브러리 확인 (`/components/ui/`)
  - [x] shadcn/ui 컴포넌트 7개 확인 (button, input, form, label, textarea, dialog, accordion)
  - [x] named export 패턴 확인
- [x] 개발 가이드라인 준수 계획 수립
  - [x] `docs/guide-compliance-plan.md` 작성 완료

## Phase 1: 기본 구조 & 공통 설정

- [ ] 프로젝트 셋업
- [ ] API 클라이언트 구현 (`app/api/tour/route.ts`)
- [ ] 기본 타입 정의 (`lib/types/tour.ts`, `lib/types/festival.ts`)
- [ ] 레이아웃 구조 업데이트 (`app/layout.tsx`)
- [ ] 공통 컴포넌트 (로딩, 에러 처리)
- [ ] 가이드라인 준수 체크리스트
  - [ ] 컴포넌트 네이밍 규칙 준수 (PascalCase, 도메인+역할+변형)
  - [ ] Export 규칙 준수 (단일 컴포넌트는 default, 다중은 named)
  - [ ] Spacing-First 정책 준수 (gap 우선, margin 금지)
  - [ ] Tailwind CSS 우선 사용 (인라인 style 금지)
  - [ ] 불필요한 추상화 금지 체크

## Phase 2: 홈페이지 (`/`) - 관광지 목록

### 2.1 페이지 기본 구조

- [ ] `app/page.tsx` 생성 (빈 레이아웃)
- [ ] 기본 UI 구조 확인 (헤더, 메인 영역, 푸터)

### 2.2 관광지 목록 기능 (MVP 2.1)

- [ ] `components/tour-card.tsx` (관광지 카드 - 기본 정보만)
  - [ ] 네이밍 규칙 준수 (`TourCard` PascalCase)
  - [ ] Spacing-First 정책 적용 (padding + gap)
  - [ ] Tailwind CSS 사용 (인라인 style 금지)
- [ ] `components/tour-list.tsx` (목록 표시 - 하드코딩 데이터로 테스트)
  - [ ] 불필요한 래퍼 컴포넌트 없는지 확인
- [ ] API 연동하여 실제 데이터 표시
- [ ] 페이지 확인 및 스타일링 조정
- [ ] 코드 품질 체크
  - [ ] TypeScript 타입 정의 완료
  - [ ] ESLint 규칙 준수
  - [ ] 반응형 디자인 검증

### 2.3 필터 기능 추가

- [ ] `components/tour-filters.tsx` (지역/타입 필터 UI)
- [ ] 필터 동작 연결 (상태 관리)
- [ ] 필터링된 결과 표시
- [ ] 페이지 확인 및 UX 개선

### 2.4 검색 기능 추가 (MVP 2.3)

- [ ] `components/tour-search.tsx` (검색창 UI)
- [ ] 검색 API 연동 (`searchKeyword2`)
- [ ] 검색 결과 표시
- [ ] 검색 + 필터 조합 동작
- [ ] 페이지 확인 및 UX 개선

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

- [ ] `app/places/[contentId]/page.tsx` 생성
  - [ ] Next.js 15 동적 라우트 파라미터 처리 (`await params`)
  - [ ] 메타데이터 동적 생성 (`generateMetadata`)
- [ ] 기본 레이아웃 구조 (뒤로가기 버튼, 섹션 구분)
  - [ ] Spacing-First 정책 적용
- [ ] 라우팅 테스트 (홈에서 클릭 시 이동)

### 3.2 기본 정보 섹션 (MVP 2.4.1)

- [ ] `components/tour-detail/detail-info.tsx`
- [ ] `detailCommon2` API 연동
- [ ] 관광지명, 이미지, 주소, 전화번호, 홈페이지, 개요 표시
- [ ] 주소 복사 기능
- [ ] 전화번호 클릭 시 전화 연결
- [ ] 페이지 확인 및 스타일링

### 3.3 지도 섹션 (MVP 2.4.4)

- [ ] `components/tour-detail/detail-map.tsx`
- [ ] 해당 관광지 위치 표시 (마커 1개)
- [ ] "길찾기" 버튼 (네이버 지도 연동)
- [ ] 페이지 확인

### 3.4 공유 기능 (MVP 2.4.5)

- [ ] `components/tour-detail/share-button.tsx`
  - [ ] 네이밍 규칙 준수 (`ShareButton` 또는 `TourShareButton`)
- [ ] URL 복사 기능 (클립보드 API)
- [ ] 복사 완료 토스트 메시지
- [ ] Open Graph 메타태그 동적 생성
  - [ ] Next.js 15 `generateMetadata` 함수 사용
- [ ] 페이지 확인 및 공유 테스트

### 3.5 추가 정보 섹션 (향후 구현)

- [ ] `components/tour-detail/detail-intro.tsx` (운영 정보)
- [ ] `detailIntro2` API 연동
- [ ] `components/tour-detail/detail-gallery.tsx` (이미지 갤러리)
- [ ] `detailImage2` API 연동
- [ ] 페이지 확인

## Phase 4: 북마크 페이지 (`/bookmarks`) - 선택 사항

### 4.1 Supabase 설정

- [x] `supabase/migrations/mytrip_schema.sql` 마이그레이션 파일 (완료)
- [x] `users` 테이블 생성 (Clerk 연동) (완료)
- [x] `bookmarks` 테이블 생성 (완료)
- [x] RLS 비활성화 (개발 환경) (완료)
- [ ] 마이그레이션 적용 확인

### 4.2 북마크 기능 구현

- [ ] `components/bookmarks/bookmark-button.tsx`
- [ ] 상세페이지에 북마크 버튼 추가
- [ ] Supabase DB 연동
- [ ] 인증된 사용자 확인
- [ ] 로그인하지 않은 경우 localStorage 임시 저장
- [ ] 상세페이지에서 북마크 동작 확인

### 4.3 북마크 목록 페이지

- [ ] `app/bookmarks/page.tsx` 생성
- [ ] `components/bookmarks/bookmark-list.tsx`
- [ ] 북마크한 관광지 목록 표시
- [ ] 정렬 옵션 (최신순, 이름순, 지역별)
- [ ] 일괄 삭제 기능
- [ ] 페이지 확인

## Phase 5: 최적화 & 배포

- [ ] 이미지 최적화 (`next.config.ts` 외부 도메인 설정)
  - [ ] Next.js `Image` 컴포넌트 사용 (일반 `img` 태그 금지)
  - [ ] 배경 이미지 처리 패턴 적용 (Image 컴포넌트 + 오버레이)
- [ ] 전역 에러 핸들링 개선
- [ ] 404 페이지 (`app/not-found.tsx`)
- [ ] SEO 최적화 (메타태그, sitemap, robots.txt)
- [ ] 성능 측정 (Lighthouse 점수 > 80)
- [ ] 환경변수 보안 검증
- [ ] Vercel 배포 및 테스트
- [ ] 최종 가이드라인 준수 체크리스트
  - [ ] 불필요한 추상화가 없는가?
  - [ ] Export 규칙을 준수했는가?
  - [ ] 네이밍 규칙을 따랐는가?
  - [ ] Spacing-First 정책 준수 (gap 우선, margin 금지)
  - [ ] Tailwind CSS 우선 사용
  - [ ] Next.js 15 동적 라우트 파라미터 처리 (`await params`)
  - [ ] TypeScript 타입 정의 완료
  - [ ] 반응형 디자인 검증
