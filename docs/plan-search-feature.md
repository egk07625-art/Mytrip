# 검색 기능 구현 계획 (Phase 2.4)

## 1. 개요 및 목표

### 1.1 목적
한국관광공사 공공 API의 `searchKeyword2` 엔드포인트를 활용하여 사용자가 키워드로 관광지를 검색할 수 있는 기능을 구현합니다.

### 1.2 핵심 요구사항
- 검색창 UI 컴포넌트 구현 (`components/tour-search.tsx`)
- 검색 API 연동 (`searchKeyword2`)
- 검색 결과 표시 (기존 `TourList` 컴포넌트 재사용)
- 검색 + 필터 조합 동작
- UX 개선 (로딩 상태, 에러 처리, 빈 결과 처리)

---

## 2. 확장성을 고려한 구조 설계

### 2.1 컴포넌트 계층 구조

```
app/page.tsx (Server Component)
├── TourSearch (Client Component) - 검색창 UI
├── TourFilters (Client Component) - 필터 UI (기존)
└── TourList (Server/Client Component) - 결과 표시 (기존)
```

### 2.2 상태 관리 전략

**URL 파라미터 기반 상태 관리** (기존 필터와 일관성 유지)
- 검색 키워드: `?keyword=서울`
- 필터 조합: `?keyword=서울&areaCode=1&contentTypeId=12`
- Server Component에서 `searchParams`로 읽어서 데이터 페칭
- Client Component에서 URL 업데이트로 상태 변경

**장점:**
- 서버 사이드 렌더링 지원
- 브라우저 뒤로가기/앞으로가기 지원
- URL 공유 가능
- SEO 친화적
- 필터 상태 관리와 일관성 유지

### 2.3 API 호출 구조

```typescript
// 검색 API 호출 함수
async function fetchTourSearch(
  keyword: string,
  areaCode?: string,
  contentTypeId?: string,
  numOfRows: number = 10,
  pageNo: number = 1
): Promise<{ tours: TourItem[]; error: string | null }>
```

**확장 고려사항:**
- 향후 검색 히스토리 기능 추가 가능
- 검색 자동완성 기능 추가 가능
- 검색 결과 정렬 옵션 추가 가능
- 검색 결과 페이지네이션 지원

---

## 3. 모듈화 전략

### 3.1 컴포넌트 분리

#### 3.1.1 `TourSearch` 컴포넌트
- **책임**: 검색창 UI 및 입력 처리
- **위치**: `components/tour-search.tsx`
- **타입**: Client Component (`"use client"`)
- **의존성**: 
  - `next/navigation` (useRouter, useSearchParams)
  - `@/components/ui/input` (shadcn/ui Input)
  - `lucide-react` (Search 아이콘)

#### 3.1.2 `fetchTourSearch` 함수
- **책임**: 검색 API 호출 로직
- **위치**: `app/page.tsx` (또는 `lib/api/tour-api-client.ts`로 분리 가능)
- **타입**: Server-side 함수
- **의존성**: 
  - 기존 `app/api/tour/route.ts` (searchKeyword 엔드포인트 활용)

#### 3.1.3 `TourList` 컴포넌트 (재사용)
- **책임**: 검색 결과 표시 (기존 컴포넌트 재사용)
- **위치**: `components/tour-list.tsx` (기존)
- **수정**: 검색 결과일 때 표시할 메시지 추가 (선택 사항)

### 3.2 데이터 흐름

```
사용자 입력
  ↓
TourSearch 컴포넌트 (Client)
  ↓
URL 파라미터 업데이트 (?keyword=서울)
  ↓
page.tsx (Server Component)
  ↓
fetchTourSearch 함수 호출
  ↓
/api/tour?endpoint=searchKeyword
  ↓
한국관광공사 API (searchKeyword2)
  ↓
TourList 컴포넌트에 결과 전달
  ↓
화면에 표시
```

---

## 4. 잠재 오류 분석 및 대응 방안

### 4.1 잠재 오류 1: API 응답 지연/타임아웃

**확률**: 높음 (약 30-40%)
- **원인**: 공공 API의 느린 응답 속도, 네트워크 지연
- **영향**: 사용자 경험 저하, 검색 버튼 중복 클릭 가능성

**대응 방안:**
1. **로딩 상태 표시**
   - 검색 중 로딩 스피너 표시
   - 검색 버튼 비활성화 (중복 요청 방지)
   - 검색창 입력 비활성화 (선택 사항)

2. **타임아웃 설정**
   ```typescript
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
   
   try {
     const response = await fetch(url, { signal: controller.signal });
   } catch (error) {
     if (error.name === 'AbortError') {
       // 타임아웃 에러 처리
     }
   } finally {
     clearTimeout(timeoutId);
   }
   ```

3. **에러 메시지 표시**
   - "검색 중 시간이 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요."
   - 재시도 버튼 제공

### 4.2 잠재 오류 2: 빈 검색어 또는 특수문자 처리

**확률**: 중간 (약 20-30%)
- **원인**: 사용자가 빈 검색어로 검색, 특수문자 포함, 공백만 입력
- **영향**: API 에러 또는 빈 결과 반환

**대응 방안:**
1. **클라이언트 사이드 유효성 검사**
   ```typescript
   const handleSearch = (keyword: string) => {
     // 공백 제거 및 검증
     const trimmedKeyword = keyword.trim();
     
     if (!trimmedKeyword) {
       // 빈 검색어 처리
       return;
     }
     
     if (trimmedKeyword.length < 2) {
       // 최소 길이 검증 (2자 이상)
       return;
     }
     
     // URL 인코딩
     const encodedKeyword = encodeURIComponent(trimmedKeyword);
     // 검색 실행
   };
   ```

2. **서버 사이드 검증**
   - API 호출 전 필수 파라미터 검증
   - 빈 검색어인 경우 에러 반환

3. **사용자 안내**
   - "검색어를 2자 이상 입력해주세요."
   - 실시간 입력 유효성 피드백

### 4.3 잠재 오류 3: 검색 + 필터 조합 시 상태 동기화 문제

**확률**: 중간 (약 15-25%)
- **원인**: 검색과 필터를 동시에 사용할 때 URL 파라미터 관리 복잡성
- **영향**: 필터 변경 시 검색 키워드 유실, 검색 시 필터 초기화

**대응 방안:**
1. **URL 파라미터 통합 관리**
   ```typescript
   // TourSearch 컴포넌트에서 검색 실행 시
   const handleSearch = (keyword: string) => {
     const params = new URLSearchParams(searchParams.toString());
     
     if (keyword) {
       params.set('keyword', keyword);
     } else {
       params.delete('keyword');
     }
     
     // 기존 필터 유지
     // areaCode, contentTypeId는 그대로 유지
     
     router.push(`/?${params.toString()}`);
   };
   ```

2. **필터 변경 시 검색 키워드 유지**
   ```typescript
   // TourFilters 컴포넌트에서 필터 변경 시
   const handleAreaCodeChange = (value: string) => {
     const params = new URLSearchParams(searchParams.toString());
     
     // 검색 키워드 유지
     const keyword = searchParams.get('keyword');
     if (keyword) {
       params.set('keyword', keyword);
     }
     
     // 필터 업데이트
     if (value === 'all') {
       params.delete('areaCode');
     } else {
       params.set('areaCode', value);
     }
     
     router.push(`/?${params.toString()}`);
   };
   ```

3. **검색/필터 초기화 버튼 제공**
   - "검색 초기화" 버튼 (검색 키워드만 제거)
   - "모든 필터 초기화" 버튼 (검색 + 필터 모두 제거)

4. **로깅 추가**
   - 검색/필터 변경 시 URL 파라미터 로깅
   - 디버깅 용이성 향상

---

## 5. MVP 사용 룰

### 5.1 필수 기능 (MVP)
1. ✅ 검색창 UI (`TourSearch` 컴포넌트)
2. ✅ 검색 API 연동 (`searchKeyword2`)
3. ✅ 검색 결과 표시 (기존 `TourList` 재사용)
4. ✅ 검색 + 필터 조합 동작
5. ✅ 로딩 상태 표시
6. ✅ 에러 처리
7. ✅ 빈 결과 처리

### 5.2 선택 기능 (향후 확장)
- ❌ 검색 자동완성
- ❌ 검색 히스토리
- ❌ 검색 결과 정렬 옵션
- ❌ 검색 결과 페이지네이션 (기본 10개만 표시)
- ❌ 검색어 하이라이트

### 5.3 구현 우선순위
1. **1단계**: 검색창 UI + 기본 검색 기능
2. **2단계**: 검색 결과 표시 + 에러 처리
3. **3단계**: 검색 + 필터 조합 동작
4. **4단계**: UX 개선 (로딩, 빈 결과, 메시지)

---

## 6. 구현 단계별 계획

### 6.1 단계 1: 검색창 UI 컴포넌트 구현

**작업 내용:**
- `components/tour-search.tsx` 생성
- shadcn/ui Input 컴포넌트 사용
- Search 아이콘 추가 (lucide-react)
- 검색 버튼 또는 엔터 키 처리
- URL 파라미터 기반 상태 관리

**체크리스트:**
- [ ] `components/tour-search.tsx` 생성
- [ ] Input 컴포넌트 스타일링 (Tailwind CSS)
- [ ] 검색 아이콘 추가
- [ ] 엔터 키 이벤트 처리
- [ ] 검색 버튼 클릭 이벤트 처리
- [ ] URL 파라미터 업데이트 로직
- [ ] Spacing-First 정책 준수
- [ ] 반응형 디자인 (모바일/데스크톱)
- [ ] 다크 모드 지원
- [ ] 접근성 (ARIA 라벨)

**예상 소요 시간:** 1-2시간

### 6.2 단계 2: 검색 API 연동

**작업 내용:**
- `app/page.tsx`에 `fetchTourSearch` 함수 추가
- `searchParams`에서 `keyword` 파라미터 읽기
- 검색 키워드가 있을 때 `fetchTourSearch` 호출
- 검색 키워드가 없을 때 기존 `fetchTourList` 호출

**체크리스트:**
- [ ] `fetchTourSearch` 함수 구현
- [ ] API 엔드포인트 호출 (`/api/tour?endpoint=searchKeyword`)
- [ ] URL 파라미터 처리 (keyword, areaCode, contentTypeId)
- [ ] 에러 처리 및 로깅
- [ ] 검색 결과 타입 정의 (`TourItem[]`)
- [ ] `page.tsx`에서 검색/목록 로직 분기

**예상 소요 시간:** 1-2시간

### 6.3 단계 3: 검색 결과 표시

**작업 내용:**
- 검색 결과를 `TourList` 컴포넌트에 전달
- 검색 결과 개수 표시
- 빈 결과 처리 (검색 결과 없음 메시지)
- 검색 키워드 하이라이트 (선택 사항)

**체크리스트:**
- [ ] 검색 결과를 `TourList`에 전달
- [ ] 검색 결과 개수 표시 UI
- [ ] 빈 결과 처리 메시지
- [ ] 검색 중 로딩 상태 표시
- [ ] 에러 메시지 표시

**예상 소요 시간:** 1시간

### 6.4 단계 4: 검색 + 필터 조합 동작

**작업 내용:**
- `TourSearch` 컴포넌트에서 필터 파라미터 유지
- `TourFilters` 컴포넌트에서 검색 키워드 유지
- URL 파라미터 통합 관리
- 검색/필터 초기화 버튼 (선택 사항)

**체크리스트:**
- [ ] `TourSearch`에서 필터 파라미터 유지 로직
- [ ] `TourFilters`에서 검색 키워드 유지 로직
- [ ] `fetchTourSearch`에 필터 파라미터 전달
- [ ] 검색 + 필터 조합 테스트
- [ ] URL 파라미터 동기화 확인

**예상 소요 시간:** 1-2시간

### 6.5 단계 5: UX 개선 및 테스트

**작업 내용:**
- 로딩 스피너 추가
- 검색 버튼 비활성화 (중복 요청 방지)
- 검색어 유효성 검사 (최소 2자)
- 에러 메시지 개선
- 반응형 디자인 최종 확인

**체크리스트:**
- [ ] 로딩 스피너 추가
- [ ] 검색 버튼 비활성화 로직
- [ ] 검색어 유효성 검사
- [ ] 에러 메시지 개선
- [ ] 모바일/데스크톱 반응형 테스트
- [ ] 다크 모드 테스트
- [ ] 접근성 테스트

**예상 소요 시간:** 1-2시간

---

## 7. 기술 스택 및 의존성

### 7.1 기존 컴포넌트 재사용
- ✅ `TourList` - 검색 결과 표시
- ✅ `TourFilters` - 필터 UI (검색 키워드 유지 로직 추가)
- ✅ `TourCard` - 개별 관광지 카드

### 7.2 새로운 컴포넌트
- `TourSearch` - 검색창 UI

### 7.3 필요한 shadcn/ui 컴포넌트
- `Input` - 검색 입력창 (이미 설치되어 있을 가능성 높음)
- 확인 필요: `pnpx shadcn@latest add input` (필요 시)

### 7.4 라이브러리
- `next/navigation` - useRouter, useSearchParams (기존 사용)
- `lucide-react` - Search 아이콘 (기존 사용)

### 7.5 API
- `/api/tour?endpoint=searchKeyword` - 기존 API 라우트 활용
- 한국관광공사 API `searchKeyword2` - 이미 설정됨

---

## 8. 파일 구조

### 8.1 새로 생성할 파일
```
components/
└── tour-search.tsx          # 검색창 컴포넌트 (신규)
```

### 8.2 수정할 파일
```
app/
└── page.tsx                 # fetchTourSearch 함수 추가, 검색 로직 통합

components/
└── tour-filters.tsx          # 검색 키워드 유지 로직 추가 (선택 사항)
```

### 8.3 타입 정의 (기존 재사용)
```
lib/types/tour.ts            # TourItem, ApiResponse (기존)
```

---

## 9. 성공 기준

### 9.1 기능적 요구사항
- ✅ 검색창에 키워드 입력 후 검색 가능
- ✅ 엔터 키 또는 검색 버튼으로 검색 실행
- ✅ 검색 결과가 목록으로 표시됨
- ✅ 검색 + 필터 조합이 정상 동작
- ✅ 검색 결과 없음 시 안내 메시지 표시
- ✅ 에러 발생 시 에러 메시지 표시

### 9.2 기술적 요구사항
- ✅ Spacing-First 정책 준수 (gap 사용, margin 금지)
- ✅ Tailwind CSS만 사용 (인라인 style 금지)
- ✅ 반응형 디자인 (모바일/데스크톱)
- ✅ 다크 모드 지원
- ✅ 접근성 (ARIA 라벨)
- ✅ TypeScript 타입 정의 완료
- ✅ 에러 처리 및 로깅 완료

### 9.3 UX 요구사항
- ✅ 로딩 상태 표시
- ✅ 검색 버튼 중복 클릭 방지
- ✅ 검색어 최소 길이 검증 (2자 이상)
- ✅ 명확한 에러 메시지
- ✅ 빈 결과에 대한 친화적인 안내

---

## 10. 예상 소요 시간

- **단계 1**: 검색창 UI 컴포넌트 구현 - 1-2시간
- **단계 2**: 검색 API 연동 - 1-2시간
- **단계 3**: 검색 결과 표시 - 1시간
- **단계 4**: 검색 + 필터 조합 동작 - 1-2시간
- **단계 5**: UX 개선 및 테스트 - 1-2시간

**총 예상 소요 시간**: 5-9시간

---

## 11. 다음 단계 (Phase 2.5)

검색 기능 구현 완료 후:
- Phase 2.5: 지도 연동 (검색 결과를 지도에 마커로 표시)
- Phase 2.6: 정렬 & 페이지네이션 (검색 결과 정렬 옵션 추가)

---

## 12. 참고 자료

- PRD 문서: `docs/PRD.md` - 2.3 키워드 검색 섹션
- API 문서: 한국관광공사 API `searchKeyword2` 엔드포인트
- 기존 구현: `app/page.tsx` (필터 기능 참고)
- 기존 컴포넌트: `components/tour-filters.tsx` (URL 파라미터 관리 패턴 참고)

