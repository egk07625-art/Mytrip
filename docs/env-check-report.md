# .env 파일 점검 결과 및 Vercel 설정 가이드

## .env 파일 현재 상태

### ✅ 설정된 환경 변수

1. **Clerk 인증** (⚠️ 개발 키 사용 중)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: `pk_test_YXNzdXJlZC13ZXJld29sZi00Mi5jbGVyay5hY2NvdW50cy5kZXYk`
   - `CLERK_SECRET_KEY`: `sk_test_JeVpTciIPBlMPCfG0T4VQhluZER81tFSQh4vD4awQ3`
   - ⚠️ **문제**: 개발 키(`pk_test_...`)를 사용 중입니다. 프로덕션에서는 `pk_live_...`를 사용해야 합니다.

2. **Supabase** (✅ 정상)
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://ambsepeeqehrayesetli.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - `SUPABASE_SERVICE_ROLE_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - `NEXT_PUBLIC_STORAGE_BUCKET`: `uploads`

3. **한국관광공사 API** (✅ 정상)
   - `TOUR_API_KEY`: `7b1adeb9530efae1f74bd3b85b6b0899fa0346da2773b0e73c54ba0e3705d0ef`

4. **네이버 지도** (✅ 정상)
   - `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`: `9n5wf7gh0p`

### ❌ 누락된 환경 변수

- `NEXT_PUBLIC_APP_URL`: Server Component에서 내부 API 호출 시 필요

## Vercel에 설정해야 할 환경 변수

### 중요: 따옴표 제거!

`.env` 파일의 값들이 따옴표로 감싸져 있지만, **Vercel에서는 따옴표 없이** 입력해야 합니다.

### 1. Clerk 인증 (프로덕션 키로 변경 필요!)

**현재 값 (개발 키 - 프로덕션에서 사용 불가):**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YXNzdXJlZC13ZXJld29sZi00Mi5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_JeVpTciIPBlMPCfG0T4VQhluZER81tFSQh4vD4awQ3
```

**⚠️ 조치 필요:**
1. [Clerk Dashboard](https://dashboard.clerk.com/)에서 프로덕션 인스턴스 생성
2. 프로덕션 키(`pk_live_...`, `sk_live_...`) 확인
3. Vercel에 프로덕션 키 설정

**Vercel 설정 값 (예시):**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
```

### 2. Supabase (따옴표 제거)

**Vercel 설정 값:**
```
NEXT_PUBLIC_SUPABASE_URL=https://ambsepeeqehrayesetli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtYnNlcGVlcWVocmF5ZXNldGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDM0MDEsImV4cCI6MjA3NzkxOTQwMX0.ioeqJdvYXCSSe_SNDVZ0lBrAkzvXREJrDihvMv0-Dxw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtYnNlcGVlcWVocmF5ZXNldGxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM0MzQwMSwiZXhwIjoyMDc3OTE5NDAxfQ.n6yGn5I8oMRA8xFPFtfWPwFC1QRmNmbV4Hhh4kvZb_U
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

### 3. 한국관광공사 API

**Vercel 설정 값:**
```
TOUR_API_KEY=7b1adeb9530efae1f74bd3b85b6b0899fa0346da2773b0e73c54ba0e3705d0ef
```

### 4. 앱 URL (새로 추가 필요)

**Vercel 설정 값:**
```
NEXT_PUBLIC_APP_URL=https://mytrip-eight.vercel.app
```

**주의**: 마지막에 슬래시(`/`) 없이 입력

### 5. 네이버 지도 (필수)

**Vercel 설정 값:**
```
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=9n5wf7gh0p
```

**참고**: `next.config.ts`의 `env` 섹션에 명시적으로 추가되어 있어 빌드 타임에 주입됩니다.

## Vercel 설정 체크리스트

- [ ] Clerk 프로덕션 키 확인 및 설정 (`pk_live_...`, `sk_live_...`)
- [ ] 모든 환경 변수 값에서 따옴표 제거
- [ ] `NEXT_PUBLIC_APP_URL` 추가
- [ ] `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 추가 (지도 기능 사용 시 필수)
- [ ] Production 및 Preview 환경 모두에 체크
- [ ] 환경 변수 설정 후 재배포
- [ ] 빌드 캐시 클리어 (필요시)

## 다음 단계

1. **Clerk 프로덕션 키 발급** (가장 중요!)
   - Clerk Dashboard → 프로덕션 인스턴스 생성
   - 프로덕션 키 확인

2. **Vercel 환경 변수 설정**
   - 위의 값들을 Vercel 대시보드에 설정
   - **따옴표 없이** 입력

3. **재배포**
   - 환경 변수 설정 후 반드시 재배포
   - 빌드 캐시 클리어 권장

## 참고

- `.env` 파일은 로컬 개발용입니다
- Vercel 배포 환경에서는 Vercel 대시보드의 환경 변수를 사용합니다
- `next.config.ts`에 모든 환경 변수가 명시적으로 추가되어 있어 빌드 타임에 주입됩니다

