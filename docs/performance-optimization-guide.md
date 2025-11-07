# 성능 최적화 가이드

## 📊 현재 적용된 최적화

### 1. 이미지 최적화 ✅

#### Next.js Image 컴포넌트 사용
- ✅ 모든 이미지에 `next/image` 사용
- ✅ `fill` 속성으로 반응형 이미지
- ✅ `sizes` 속성으로 적절한 이미지 크기 로딩
- ✅ `priority` 속성으로 above-the-fold 이미지 최적화

**적용 위치**:
- `components/tour-card.tsx`: 관광지 카드 이미지
- `components/tour-detail/detail-info.tsx`: 상세페이지 대표 이미지
- `components/tour-detail/detail-gallery.tsx`: 이미지 갤러리

**예시**:
```tsx
<Image
  src={imageUrl}
  alt={alt}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  priority={isAboveFold}
/>
```

#### 이미지 도메인 설정
- ✅ `next.config.ts`에 외부 이미지 도메인 추가
- ✅ 한국관광공사 API 이미지 도메인 허용

### 2. 캐싱 전략 ✅

#### API 응답 캐싱
- ✅ `revalidate: 3600` (1시간) 설정
- ✅ ISR (Incremental Static Regeneration) 활용

**적용 위치**:
- `app/page.tsx`: 관광지 목록 API 호출
- `lib/api/tour-api-client.ts`: 모든 API 호출

**예시**:
```typescript
const response = await fetch(apiUrl.toString(), {
  next: {
    revalidate: 3600, // 1시간 캐싱
  },
});
```

### 3. 코드 분할 ✅

#### Next.js App Router 자동 코드 분할
- ✅ 라우트별 자동 코드 분할
- ✅ Suspense를 사용한 로딩 상태 처리

**적용 위치**:
- `app/places/[contentId]/page.tsx`: Suspense로 섹션별 로딩

### 4. 번들 최적화 ✅

#### Tree Shaking
- ✅ ES 모듈 사용
- ✅ Named import 사용

#### 동적 Import (필요 시)
- 향후 지도 컴포넌트 등 무거운 컴포넌트는 동적 import 고려

## 🎯 추가 최적화 권장 사항

### 1. 이미지 최적화 개선

#### WebP 포맷 사용
- Next.js Image 컴포넌트가 자동으로 WebP 변환 제공
- 외부 이미지는 원본 서버에서 WebP 제공 여부 확인

#### 이미지 Blur Placeholder
- 이미지 로딩 중 blur placeholder 표시
- `blurDataURL` 속성 활용

**예시**:
```tsx
<Image
  src={imageUrl}
  alt={alt}
  fill
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### 2. 리렌더링 최적화

#### React.memo 활용
- 자주 리렌더링되는 컴포넌트에 `React.memo` 적용
- Props가 자주 변경되지 않는 컴포넌트에 적용

**예시**:
```tsx
export default React.memo(function TourCard({ tour }: TourCardProps) {
  // ...
});
```

#### useMemo, useCallback 활용
- 복잡한 계산이나 함수를 메모이제이션
- 의존성 배열 관리 주의

### 3. 번들 크기 최적화

#### 번들 분석
```bash
# Next.js 번들 분석
ANALYZE=true pnpm build
```

#### 불필요한 의존성 제거
- 사용하지 않는 라이브러리 제거
- 필요한 기능만 import

### 4. 네트워크 최적화

#### HTTP/2 활용
- Vercel이 자동으로 HTTP/2 제공

#### 리소스 우선순위
- Critical CSS 인라인
- 폰트 preload

### 5. Core Web Vitals 최적화

#### LCP (Largest Contentful Paint)
- ✅ 이미지 `priority` 속성 사용
- ✅ 이미지 `sizes` 속성 최적화
- ✅ 폰트 최적화

#### FID (First Input Delay)
- ✅ JavaScript 번들 크기 최적화
- ✅ 코드 분할

#### CLS (Cumulative Layout Shift)
- ✅ 이미지 크기 명시 (`aspect-video` 등)
- ✅ 레이아웃 안정성 확보

## 📈 성능 측정

### Lighthouse 측정

#### 로컬 환경
```bash
# Chrome DevTools Lighthouse 사용
# 또는
npx lighthouse http://localhost:3000 --view
```

#### 프로덕션 환경
```bash
# Vercel 배포 후
npx lighthouse https://your-domain.vercel.app --view
```

### 목표 점수
- **Performance**: 80점 이상
- **Accessibility**: 90점 이상
- **Best Practices**: 90점 이상
- **SEO**: 90점 이상

### Web Vitals 측정

#### Next.js Analytics (선택 사항)
```bash
# @vercel/analytics 설치
pnpm add @vercel/analytics
```

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## 🔍 성능 모니터링

### 개발 환경
- Chrome DevTools Performance 탭
- React DevTools Profiler

### 프로덕션 환경
- Vercel Analytics
- Google Analytics (선택 사항)
- Sentry (에러 모니터링, 선택 사항)

## 📝 체크리스트

### 이미지 최적화
- [x] Next.js Image 컴포넌트 사용
- [x] `sizes` 속성 설정
- [x] `priority` 속성 적절히 사용
- [ ] Blur placeholder 적용 (선택 사항)
- [x] 외부 이미지 도메인 설정

### 캐싱
- [x] API 응답 캐싱 (revalidate)
- [x] ISR 활용
- [ ] CDN 캐싱 (Vercel 자동)

### 코드 최적화
- [x] 코드 분할 (App Router 자동)
- [ ] React.memo 적용 (필요 시)
- [ ] useMemo, useCallback 활용 (필요 시)
- [ ] 불필요한 의존성 제거

### 성능 측정
- [ ] Lighthouse 측정 (로컬)
- [ ] Lighthouse 측정 (프로덕션)
- [ ] Web Vitals 측정
- [ ] 목표 점수 달성 확인

## 🚀 다음 단계

1. **Lighthouse 측정 실행**
   - 로컬 및 프로덕션 환경에서 측정
   - 목표 점수 달성 여부 확인

2. **성능 개선 적용**
   - 측정 결과 기반으로 개선 사항 적용
   - 재측정 및 검증

3. **모니터링 설정**
   - 프로덕션 환경 모니터링 도구 설정
   - 성능 회귀 방지

