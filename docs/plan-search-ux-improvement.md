# 검색 UX 개선 계획 (TODO 2.4.5)

## 📋 개요

검색 기능의 사용자 경험을 개선하기 위한 로딩 상태 표시 및 중복 요청 방지 기능을 구현합니다.

**대상 항목:**
- 로딩 스피너 추가 (API 연동 시 구현)
- 검색 버튼 비활성화 로직 (중복 요청 방지, API 연동 시 구현)

**현재 상태:**
- ✅ 검색 API 연동 완료 (`fetchTourSearch` 함수)
- ✅ 검색창 UI 컴포넌트 완료 (`TourSearch`)
- ✅ `LoadingSpinner` 컴포넌트 존재
- ❌ 검색 중 로딩 상태 표시 없음
- ❌ 검색 버튼 중복 클릭 방지 없음

---

## 🎯 구현 목표

### 1. 로딩 스피너 추가
- 검색 실행 시 로딩 스피너 표시
- 검색 버튼 내부 또는 검색창 옆에 표시
- 검색 완료 시 자동으로 사라짐

### 2. 검색 버튼 비활성화 로직
- 검색 실행 중 버튼 비활성화 (중복 요청 방지)
- 검색 완료 시 버튼 활성화
- 검색어 유효성 검사 실패 시에도 버튼 활성화 유지

---

## 🏗️ 아키텍처 설계

### 확장성 고려사항

1. **로딩 상태 관리 모듈화**
   - `TourSearch` 컴포넌트 내부에서 로딩 상태 관리
   - 향후 다른 검색 컴포넌트에서도 재사용 가능한 패턴 적용

2. **상태 관리 전략**
   - `useState`로 로컬 로딩 상태 관리
   - `useTransition` 고려 (Server Component와의 동기화)
   - URL 파라미터 변경 감지로 로딩 상태 자동 해제

3. **재사용 가능한 패턴**
   - 로딩 상태와 버튼 비활성화 로직을 커스텀 훅으로 분리 가능
   - 향후 필터 변경 시에도 동일한 패턴 적용 가능

### 안정성 고려사항

1. **에러 처리**
   - API 에러 발생 시에도 로딩 상태 해제
   - 네트워크 에러 시 사용자에게 명확한 피드백

2. **상태 동기화**
   - URL 파라미터 변경과 로딩 상태 동기화
   - 브라우저 뒤로가기/앞으로가기 시 상태 일관성 유지

3. **메모리 누수 방지**
   - 컴포넌트 언마운트 시 타이머/비동기 작업 정리
   - `useEffect` cleanup 함수 활용

---

## 🚨 잠재 오류 분석

### 1. 로딩 상태가 해제되지 않는 문제
**확률: 중간 (30-40%)**

**원인:**
- API 응답이 오지 않거나 타임아웃 발생
- URL 파라미터 변경 감지 실패
- 컴포넌트 언마운트 후 상태 업데이트 시도

**대응 방안:**
- 타임아웃 설정 (예: 30초 후 자동 해제)
- `useEffect` cleanup으로 언마운트 시 상태 초기화
- URL 파라미터 변경 감지 로직 강화
- 에러 발생 시에도 로딩 상태 해제 보장

**구현 예시:**
```typescript
useEffect(() => {
  const timeout = setTimeout(() => {
    if (isLoading) {
      console.warn("[TourSearch] 로딩 타임아웃 - 상태 해제");
      setIsLoading(false);
    }
  }, 30000); // 30초 타임아웃

  return () => {
    clearTimeout(timeout);
    setIsLoading(false); // cleanup 시 상태 초기화
  };
}, [isLoading]);
```

### 2. 중복 요청이 발생하는 문제
**확률: 낮음 (10-15%)**

**원인:**
- 버튼 클릭과 엔터 키 입력이 동시에 발생
- 빠른 연속 클릭 (debounce 미적용)
- URL 파라미터 변경과 수동 검색이 동시에 발생

**대응 방안:**
- 검색 실행 중 플래그로 중복 요청 차단
- `useCallback`으로 함수 메모이제이션
- 검색 실행 전 현재 검색어와 동일한지 확인
- debounce 적용 (선택 사항, UX 고려)

**구현 예시:**
```typescript
const [isSearching, setIsSearching] = useState(false);

const handleSearch = useCallback((keyword: string) => {
  // 중복 요청 방지
  if (isSearching) {
    console.log("[TourSearch] 이미 검색 중입니다.");
    return;
  }

  // 동일한 검색어인 경우 스킵
  if (keyword.trim() === currentKeyword) {
    console.log("[TourSearch] 동일한 검색어입니다.");
    return;
  }

  setIsSearching(true);
  // ... 검색 로직
}, [isSearching, currentKeyword]);
```

### 3. 로딩 상태와 실제 API 응답 불일치
**확률: 낮음 (5-10%)**

**원인:**
- Server Component의 비동기 렌더링 타이밍 이슈
- URL 파라미터 변경과 데이터 로딩 완료 시점 불일치
- 브라우저 캐싱으로 인한 즉시 응답

**대응 방안:**
- URL 파라미터 변경 감지로 로딩 상태 해제
- `useEffect`로 `currentKeyword` 변경 시 로딩 상태 해제
- Server Component의 데이터 로딩 완료를 명시적으로 감지 (선택 사항)

**구현 예시:**
```typescript
// URL 파라미터 변경 시 로딩 상태 해제
useEffect(() => {
  if (currentKeyword && isSearching) {
    // 검색이 완료되었음을 가정 (URL 파라미터가 변경되었으므로)
    setIsSearching(false);
  }
}, [currentKeyword, isSearching]);
```

---

## 📐 구현 계획

### Phase 1: 로딩 상태 관리 추가

#### 1.1 `TourSearch` 컴포넌트 수정

**변경 사항:**
- `isSearching` 상태 추가
- 검색 실행 시 `isSearching = true`
- URL 파라미터 변경 감지로 `isSearching = false`
- 타임아웃 설정으로 안전장치 추가

**파일:** `components/tour-search.tsx`

**주요 로직:**
```typescript
const [isSearching, setIsSearching] = useState(false);

// 검색 실행 함수 수정
const handleSearch = useCallback((keyword: string) => {
  if (isSearching) return; // 중복 요청 방지
  
  setIsSearching(true);
  // ... 기존 검색 로직
}, [isSearching, ...]);

// URL 파라미터 변경 감지
useEffect(() => {
  if (currentKeyword && isSearching) {
    setIsSearching(false);
  }
}, [currentKeyword, isSearching]);

// 타임아웃 안전장치
useEffect(() => {
  if (!isSearching) return;
  
  const timeout = setTimeout(() => {
    setIsSearching(false);
  }, 30000);
  
  return () => clearTimeout(timeout);
}, [isSearching]);
```

#### 1.2 로딩 스피너 UI 추가

**위치 옵션:**
1. 검색 버튼 내부 (아이콘 대체)
2. 검색 버튼 옆 (별도 표시)
3. 검색창 내부 (입력창 오른쪽)

**권장:** 검색 버튼 내부 (아이콘 대체) - 공간 효율적

**구현:**
```tsx
<Button
  onClick={handleSearchClick}
  disabled={isSearching || inputValue.trim().length < 2}
  className="shrink-0"
  aria-label={isSearching ? "검색 중..." : "검색 실행"}
>
  {isSearching ? (
    <LoadingSpinner size="sm" className="text-white" />
  ) : (
    <Search className="size-4" aria-hidden="true" />
  )}
  <span className="hidden sm:inline">
    {isSearching ? "검색 중..." : "검색"}
  </span>
</Button>
```

### Phase 2: 검색 버튼 비활성화 로직

#### 2.1 버튼 비활성화 조건

**비활성화 조건:**
1. 검색 실행 중 (`isSearching === true`)
2. 검색어 유효성 검사 실패 (`inputValue.trim().length < 2`)
3. 검색어가 비어있음 (`inputValue.trim().length === 0`)

**활성화 조건:**
- 검색 실행 중이 아님
- 검색어가 2자 이상

**구현:**
```tsx
const isButtonDisabled = 
  isSearching || 
  inputValue.trim().length < 2 ||
  inputValue.trim() === currentKeyword; // 동일한 검색어인 경우

<Button
  onClick={handleSearchClick}
  disabled={isButtonDisabled}
  // ...
>
```

#### 2.2 입력창 비활성화 (선택 사항)

**UX 개선:**
- 검색 실행 중 입력창도 비활성화하여 일관성 유지
- 검색 완료 후 자동 활성화

**구현:**
```tsx
<Input
  // ...
  disabled={isSearching}
  aria-busy={isSearching}
/>
```

### Phase 3: 통합 및 테스트

#### 3.1 통합 테스트 시나리오

1. **정상 검색 플로우**
   - 검색어 입력 → 검색 버튼 클릭 → 로딩 표시 → 결과 표시

2. **중복 요청 방지**
   - 검색 버튼 빠른 연속 클릭 → 첫 번째 요청만 실행

3. **에러 처리**
   - API 에러 발생 → 로딩 상태 해제 → 에러 메시지 표시

4. **타임아웃 처리**
   - 30초 이상 응답 없음 → 로딩 상태 자동 해제

5. **URL 파라미터 동기화**
   - 브라우저 뒤로가기 → 이전 검색어로 복원 → 로딩 상태 없음

#### 3.2 접근성 검증

- `aria-busy` 속성 추가
- `aria-label` 동적 업데이트
- 키보드 네비게이션 테스트
- 스크린 리더 테스트

---

## 🎨 UI/UX 디자인

### 로딩 스피너 위치

**권장: 검색 버튼 내부**
- 공간 효율적
- 사용자가 검색 버튼을 클릭했으므로 버튼 내부에 피드백 제공이 자연스러움
- 모바일에서도 깔끔함

**대안: 검색창 옆**
- 더 눈에 띄는 피드백
- 검색 버튼과 분리되어 독립적인 로딩 표시

### 버튼 상태 시각적 피드백

- **활성화:** 기본 버튼 스타일
- **비활성화:** `disabled` 상태 (회색, 클릭 불가)
- **로딩 중:** 스피너 표시 + 텍스트 변경 ("검색 중...")

---

## 📝 MVP 사용 룰

### 필수 기능 (MVP)
1. ✅ 검색 실행 시 로딩 스피너 표시
2. ✅ 검색 버튼 비활성화 (중복 요청 방지)
3. ✅ 검색 완료 시 자동 상태 해제

### 선택 기능 (향후 개선)
1. ⏸️ 입력창 비활성화 (검색 중)
2. ⏸️ debounce 적용 (연속 입력 시)
3. ⏸️ 검색 진행률 표시 (선택 사항)
4. ⏸️ 검색 취소 기능 (선택 사항)

### 구현 우선순위
1. **Phase 1**: 로딩 상태 관리 및 스피너 표시 (필수)
2. **Phase 2**: 버튼 비활성화 로직 (필수)
3. **Phase 3**: 통합 테스트 및 접근성 검증 (필수)
4. **향후**: 입력창 비활성화, debounce 등 (선택)

---

## 🔧 기술 스택

- **React Hooks**: `useState`, `useEffect`, `useCallback`
- **Next.js**: `useRouter`, `useSearchParams`
- **UI 컴포넌트**: `LoadingSpinner` (기존 컴포넌트 활용)
- **타입 안정성**: TypeScript strict mode

---

## ✅ 체크리스트

### 구현 전
- [ ] 계획 검토 및 승인
- [ ] 기존 코드 구조 확인
- [ ] 테스트 시나리오 작성

### 구현 중
- [ ] `TourSearch` 컴포넌트에 로딩 상태 추가
- [ ] 로딩 스피너 UI 추가
- [ ] 검색 버튼 비활성화 로직 구현
- [ ] 타임아웃 안전장치 추가
- [ ] 에러 처리 로직 추가
- [ ] 접근성 속성 추가

### 구현 후
- [ ] 정상 검색 플로우 테스트
- [ ] 중복 요청 방지 테스트
- [ ] 에러 처리 테스트
- [ ] 타임아웃 처리 테스트
- [ ] 접근성 테스트
- [ ] 모바일/데스크톱 반응형 테스트
- [ ] 다크 모드 테스트
- [ ] 코드 리뷰 및 리팩토링

---

## 📚 참고 자료

- [Next.js useTransition](https://nextjs.org/docs/app/api-reference/hooks/use-transition)
- [React useCallback](https://react.dev/reference/react/useCallback)
- [ARIA busy state](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)
- 기존 컴포넌트: `components/ui/loading-spinner.tsx`
- 기존 패턴: `components/tour-list-wrapper.tsx` (필터 로딩 상태 처리)

---

## 🎯 성공 기준

1. ✅ 검색 실행 시 로딩 스피너가 명확하게 표시됨
2. ✅ 검색 버튼이 중복 클릭 시 비활성화되어 중복 요청이 발생하지 않음
3. ✅ 검색 완료 또는 에러 발생 시 로딩 상태가 정상적으로 해제됨
4. ✅ 모든 에지 케이스에서도 안정적으로 동작함
5. ✅ 접근성 기준을 만족함 (ARIA 속성, 키보드 네비게이션)

---

**작성일:** 2025-01-27  
**작성자:** AI Assistant  
**상태:** 계획 완료, 구현 대기

