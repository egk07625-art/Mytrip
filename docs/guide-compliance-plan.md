# 개발 가이드라인 준수 계획

## 📋 확인 완료 사항

### 1. 기존 컴포넌트 라이브러리 확인 (`/components/ui/`)

**확인된 shadcn/ui 컴포넌트:**
- `button.tsx` - 버튼 컴포넌트 (named export: `Button`, `buttonVariants`)
- `input.tsx` - 입력 필드 컴포넌트 (named export: `Input`)
- `form.tsx` - 폼 컴포넌트
- `label.tsx` - 라벨 컴포넌트
- `textarea.tsx` - 텍스트영역 컴포넌트
- `dialog.tsx` - 다이얼로그/모달 컴포넌트
- `accordion.tsx` - 아코디언 컴포넌트

**확인된 패턴:**
- ✅ shadcn/ui 표준 패턴 사용 (named export)
- ✅ `cn()` 유틸리티 함수 사용 (조건부 클래스명)
- ✅ Tailwind CSS 스타일링
- ✅ Radix UI 기반 (접근성 고려)

### 2. 프로젝트 구조 확인

**디렉토리 구조:**
- `app/` - Next.js App Router 라우팅 전용
- `components/` - 재사용 가능한 컴포넌트
  - `components/ui/` - shadcn/ui 컴포넌트 (수정 금지)
  - `components/providers/` - React Context Providers
- `lib/` - 유틸리티 및 설정
  - `lib/utils.ts` - 공통 유틸리티 (`cn` 함수)
  - `lib/supabase/` - Supabase 클라이언트 (환경별 분리)
- `hooks/` - 커스텀 React Hooks
- `supabase/` - 데이터베이스 마이그레이션

## ✅ 가이드라인 준수 체크리스트

### 네이밍 규칙
- [x] 컴포넌트: PascalCase (`TourCard`, `TourList`)
- [x] 파일명: kebab-case (`tour-card.tsx`, `tour-list.tsx`)
- [x] 훅: camelCase (`useTour`, `useTourList`)
- [x] 타입: PascalCase (`TourItem`, `TourDetail`)
- [x] 금지어 피하기: `Common`, `Base`, `Util`, `Index`, `Styled*`

### Export 규칙
- [x] 단일 컴포넌트: `export default function ComponentName()`
- [x] 다중 export: named export (`export { A, B }`)
- [x] UI 라이브러리: shadcn 패턴 유지 (`export { Button, buttonVariants }`)
- [x] 페이지 컴포넌트: 항상 `export default` (Next.js 요구사항)

### 스타일링 규칙
- [x] Tailwind CSS 우선 사용
- [x] 인라인 `style={{ }}` 사용 금지
- [x] Spacing-First 정책: `padding` + `gap` 사용, `margin` 금지
- [x] 배경 이미지: Next.js `Image` 컴포넌트 + 오버레이 div
- [x] 그라디언트: Tailwind 클래스 사용

### 추상화 규칙
- [x] 불필요한 래퍼 컴포넌트 금지
- [x] 로직이 있는 경우에만 추상화 허용
- [x] 3곳 이상 재사용 시에만 추상화 고려
- [x] 외부 라이브러리 래핑은 허용 (예: 네이버 지도)

### Next.js 15 규칙
- [x] 동적 라우트 파라미터: `await params` 사용
- [x] 이미지: Next.js `Image` 컴포넌트 사용
- [x] 메타데이터: `generateMetadata` 함수 사용

## 🎯 개발 시 적용할 원칙

### Phase 2: 홈페이지 개발 시
1. **컴포넌트 네이밍**
   - `TourCard` (PascalCase)
   - `TourList` (PascalCase)
   - `TourFilters` (PascalCase)
   - `TourSearch` (PascalCase)
   - `NaverMap` 또는 `TourMap` (PascalCase)

2. **스타일링**
   - 카드 레이아웃: `padding` + `gap` 사용
   - 그리드 레이아웃: `grid gap-4`
   - 반응형: 모바일 우선 (`gap-3 md:gap-4`)

3. **추상화 판단**
   - `TourCard`: 재사용이 명확하므로 컴포넌트로 분리
   - `TourList`: 리스트 렌더링 로직이 있으므로 컴포넌트로 분리
   - `NaverMap`: 외부 라이브러리 래핑이므로 추상화 허용

### Phase 3: 상세페이지 개발 시
1. **Next.js 15 동적 라우트**
   ```typescript
   export default async function PlacePage({ 
     params 
   }: { 
     params: Promise<{ contentId: string }> 
   }) {
     const { contentId } = await params;
     // ...
   }
   ```

2. **메타데이터 동적 생성**
   ```typescript
   export async function generateMetadata({ 
     params 
   }: { 
     params: Promise<{ contentId: string }> 
   }): Promise<Metadata> {
     const { contentId } = await params;
     // ...
   }
   ```

3. **이미지 처리**
   - 배경 이미지: `Image` 컴포넌트 + 오버레이 div
   - 일반 이미지: `Image` 컴포넌트 사용

## 📝 코드 리뷰 체크리스트

각 Phase 완료 시 다음 사항을 확인:

- [ ] 네이밍 규칙 준수
- [ ] Export 규칙 준수
- [ ] Spacing-First 정책 적용
- [ ] Tailwind CSS 우선 사용 (인라인 style 없음)
- [ ] 불필요한 추상화 없음
- [ ] Next.js 15 규칙 준수 (`await params`)
- [ ] TypeScript 타입 정의 완료
- [ ] 반응형 디자인 적용
- [ ] 접근성 고려 (ARIA 라벨)

## 🚀 다음 단계

Phase 1부터 시작하여 가이드라인을 실시간으로 적용하면서 개발을 진행합니다.

