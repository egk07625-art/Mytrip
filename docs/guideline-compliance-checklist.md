# 가이드라인 준수 체크리스트

> 개발 시 `docs/guide.md` 가이드라인을 반드시 준수합니다.

## 📋 체크리스트 사용 방법

새로운 컴포넌트를 작성하거나 기존 컴포넌트를 수정할 때, 아래 체크리스트를 확인하여 가이드라인 준수 여부를 검증하세요.

---

## 1. 컴포넌트 네이밍 규칙

### ✅ 체크리스트
- [ ] 컴포넌트 이름이 **PascalCase**를 사용하는가?
- [ ] 네이밍 패턴이 `[Domain][Role][Variant|State]`를 따르는가?
- [ ] 금지어(`Common`, `Base`, `Util`, `Index`, `Test/Tmp`, `Styled*`)를 사용하지 않았는가?
- [ ] 파일명이 **kebab-case**를 사용하는가?

### ✅ 좋은 예시
```typescript
// components/tour-card.tsx
export default function TourCard({ tour }: TourCardProps) {
  // ...
}

// components/tour-list.tsx
export default function TourList({ tours }: TourListProps) {
  // ...
}

// components/tour-detail/detail-info.tsx
export default function TourDetailInfo({ detail }: TourDetailInfoProps) {
  // ...
}
```

### ❌ 나쁜 예시
```typescript
// ❌ 금지: Common, Base 접두사
export default function CommonCard() { }
export default function BaseButton() { }

// ❌ 금지: Util, Index 접두사
export default function UtilComponent() { }
export default function Index() { }

// ❌ 금지: camelCase 컴포넌트명
export default function tourCard() { }

// ❌ 금지: PascalCase 파일명
// TourCard.tsx (X)
// tour-card.tsx (O)
```

---

## 2. Export 규칙

### ✅ 체크리스트
- [ ] 단일 컴포넌트는 `export default`를 사용하는가?
- [ ] 다중 export는 `named export`를 사용하는가?
- [ ] UI 라이브러리 컴포넌트는 shadcn 패턴을 유지하는가?
- [ ] 페이지 컴포넌트는 항상 `export default`를 사용하는가?

### ✅ 좋은 예시
```typescript
// ✅ 단일 컴포넌트 → default export
// components/tour-card.tsx
export default function TourCard({ tour }: TourCardProps) {
  return <div>...</div>
}

// ✅ 다중 export → named export
// hooks/use-tour.ts
export function useTour() { }
export function useTourList() { }
export type Tour = { ... }

// ✅ UI 라이브러리 → shadcn 패턴
// components/ui/button.tsx
export { Button, buttonVariants }

// ✅ 페이지 컴포넌트 → default export
// app/page.tsx
export default function Home() {
  return <div>...</div>
}
```

### ❌ 나쁜 예시
```typescript
// ❌ 단일 컴포넌트를 named export (X)
export function TourCard() { }

// ❌ 다중 export를 default export (X)
export default { useTour, useTourList }

// ❌ 불명확한 배럴 export
// components/index.ts
export * from './tour-card'
export * from './tour-list'
```

---

## 3. Spacing-First 정책

### ✅ 체크리스트
- [ ] 외곽 여백은 최상단 래퍼의 `padding`을 사용하는가?
- [ ] 형제 요소 간 간격은 부모의 `gap`을 사용하는가?
- [ ] `margin` (mt, mb, mx, my)을 사용하지 않았는가?
- [ ] 반응형 spacing을 적용했는가?

### ✅ 좋은 예시
```tsx
// ✅ padding + gap 사용
<div className="p-6 md:p-8">
  <div className="flex flex-col gap-4">
    <Card />
    <Card />
    <Card />
  </div>
</div>

// ✅ 세로 스택
<div className="flex flex-col gap-4">
  <Item />
  <Item />
</div>

// ✅ 가로 정렬
<div className="flex gap-4">
  <Button />
  <Button />
</div>

// ✅ 그리드
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Card />
  <Card />
</div>
```

### ❌ 나쁜 예시
```tsx
// ❌ margin 사용 (금지)
<div>
  <Card />
  <Card className="mt-4" />
  <Card className="mt-4" />
</div>

// ❌ 형제 요소 간격을 margin으로 처리
<div>
  <Item className="mb-4" />
  <Item className="mb-4" />
</div>
```

---

## 4. Tailwind CSS 사용

### ✅ 체크리스트
- [ ] Tailwind CSS 유틸리티 클래스를 우선 사용하는가?
- [ ] 인라인 `style={{ }}`을 사용하지 않았는가?
- [ ] `styled-jsx`를 사용하지 않았는가?
- [ ] 하드코딩된 hex 컬러를 사용하지 않았는가?

### ✅ 좋은 예시
```tsx
// ✅ Tailwind 클래스 사용
<div className="p-6 rounded-lg bg-card text-card-foreground shadow-sm">
  <h2 className="text-2xl font-bold">제목</h2>
</div>

// ✅ 배경 이미지 처리 (Image 컴포넌트 + 오버레이)
<div className="relative">
  <Image src={image} alt="" fill className="object-cover" />
  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
</div>

// ✅ 그라디언트 처리
<div className="bg-gradient-to-b from-transparent via-black/84 to-black" />
```

### ❌ 나쁜 예시
```tsx
// ❌ 인라인 style 사용
<div style={{ padding: '24px', backgroundColor: '#ffffff' }}>
  ...
</div>

// ❌ 배경 이미지를 인라인 style로
<div style={{ backgroundImage: `url('${image}')` }} />

// ❌ 하드코딩된 hex 컬러
<div className="bg-[#ffffff] text-[#000000]">
  ...
</div>

// ❌ styled-jsx 사용
<style jsx>{`
  .container {
    padding: 24px;
  }
`}</style>
```

---

## 5. 불필요한 추상화 금지

### ✅ 체크리스트
- [ ] 단순 스타일링만 하는 래퍼 컴포넌트를 만들지 않았는가?
- [ ] 컴포넌트 2-3개만 있는 폴더의 배럴 익스포트를 만들지 않았는가?
- [ ] `div + className`만 있는 의미 없는 컨테이너 컴포넌트를 만들지 않았는가?
- [ ] 추상화가 필요한 경우, 로직/재사용/복잡성 기준을 충족하는가?

### ✅ 추상화 허용 기준
1. **로직이 포함된 경우**: 상태 관리, 데이터 변환, 이벤트 처리
2. **재사용이 명확한 경우**: 3곳 이상에서 동일한 패턴으로 사용
3. **복잡한 조건부 렌더링**: 10줄 이상의 복잡한 조건 분기
4. **외부 라이브러리 래핑**: API 호출, 서드파티 컴포넌트 통합

### ✅ 좋은 예시
```tsx
// ✅ 로직이 있는 경우 (추상화 허용)
function useTourData(tourId: string) {
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchTour(tourId).then(setTour).finally(() => setLoading(false));
  }, [tourId]);
  
  return { tour, loading };
}

// ✅ 외부 라이브러리 래핑 (추상화 허용)
export default function NaverMap({ markers }: NaverMapProps) {
  // 네이버 지도 API 래핑 로직
  return <div id="map" />;
}

// ✅ 직접 스타일링 (불필요한 추상화 없음)
<div className="p-6 rounded-xl bg-white">
  <TourDetail />
</div>
```

### ❌ 나쁜 예시
```tsx
// ❌ 단순 스타일링 래퍼 (불필요한 추상화)
function CardWrapper({ children }: { children: ReactNode }) {
  return <div className="p-6 rounded-xl bg-white">{children}</div>
}

// ❌ 의미 없는 컨테이너
function Container({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-5">{children}</div>
}

// ❌ 불필요한 배럴 익스포트 (컴포넌트 2-3개만)
// components/tour/index.ts
export * from './tour-card'
export * from './tour-list'
```

---

## 6. TypeScript 타입 정의

### ✅ 체크리스트
- [ ] 모든 props에 타입을 정의했는가?
- [ ] 인터페이스는 PascalCase를 사용하는가?
- [ ] 타입은 `type`보다 `interface`를 우선 사용하는가?
- [ ] `any` 타입을 사용하지 않았는가?

### ✅ 좋은 예시
```typescript
interface TourCardProps {
  tour: Tour
  onSelect?: (tour: Tour) => void
  className?: string
}

export default function TourCard({ tour, onSelect, className }: TourCardProps) {
  // ...
}
```

---

## 7. 접근성 (Accessibility)

### ✅ 체크리스트
- [ ] 적절한 ARIA 속성을 사용하는가?
- [ ] 키보드 네비게이션이 가능한가?
- [ ] `sr-only` 클래스를 사용하여 스크린 리더용 텍스트를 추가했는가?

### ✅ 좋은 예시
```tsx
<button
  aria-label="로딩 중"
  role="status"
>
  <LoadingSpinner />
  <span className="sr-only">로딩 중...</span>
</button>

<div role="alert" aria-live="polite">
  <ErrorMessage message="에러 발생" />
</div>
```

---

## 8. 반응형 디자인

### ✅ 체크리스트
- [ ] 모바일 우선 (Mobile First) 방식으로 작성했는가?
- [ ] `md:`, `lg:` 등의 브레이크포인트를 적절히 사용하는가?
- [ ] 모든 주요 화면 크기에서 테스트했는가?

### ✅ 좋은 예시
```tsx
<div className="p-4 md:p-6 lg:p-8">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <Card />
    <Card />
    <Card />
  </div>
</div>
```

---

## 📝 빠른 체크리스트 요약

컴포넌트 작성 시 다음을 빠르게 확인하세요:

- [ ] 네이밍: PascalCase 컴포넌트명, kebab-case 파일명
- [ ] Export: 단일은 default, 다중은 named
- [ ] Spacing: padding + gap 사용, margin 금지
- [ ] 스타일: Tailwind 우선, 인라인 style 금지
- [ ] 추상화: 불필요한 래퍼 컴포넌트 만들지 않기
- [ ] 타입: 모든 props 타입 정의
- [ ] 접근성: ARIA 속성, 키보드 네비게이션
- [ ] 반응형: 모바일 우선, 브레이크포인트 활용

---

## 🔗 관련 문서

- [개발 가이드라인](./guide.md)
- [프로젝트 README](../README.md)
- [TODO 목록](./TODO.md)




