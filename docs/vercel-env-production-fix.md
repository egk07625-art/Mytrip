# Vercel 프로덕션 환경 변수 설정 가이드

## 문제 상황

Vercel 배포 환경에서 다음과 같은 문제가 발생하는 경우:

1. **Clerk 개발 키 경고**:
   ```
   Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production.
   ```

2. **401 API 오류**: API 요청 시 인증 실패

3. **환경 변수 미로드**: `.env` 파일의 환경 변수가 Vercel에서 읽히지 않음

## 원인 분석

Vercel 배포 환경에서는 **로컬 `.env` 파일이 사용되지 않습니다**. 모든 환경 변수를 Vercel 대시보드에서 별도로 설정해야 합니다.

또한 `next.config.ts`의 `env` 설정에 필요한 환경 변수를 명시적으로 추가해야 빌드 타임에 환경 변수가 제대로 주입됩니다.

## 해결 방법

### 1단계: Vercel 대시보드에서 환경 변수 설정

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 메뉴로 이동
4. 다음 환경 변수들을 **모두 추가**:

#### 필수 환경 변수 목록

```bash
# Clerk 인증 (프로덕션 키 사용 필수!)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx

# 앱 URL (Server Component에서 내부 API 호출 시 사용)
NEXT_PUBLIC_APP_URL=https://mytrip-eight.vercel.app

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STORAGE_BUCKET=uploads

# 한국관광공사 API
TOUR_API_KEY=your_tour_api_key
# 또는
NEXT_PUBLIC_TOUR_API_KEY=your_tour_api_key
```

### 2단계: 환경 변수 설정 시 주의사항

#### ✅ 올바른 설정 방법

1. **환경 변수 이름**: 정확히 일치해야 함 (대소문자 구분)
2. **환경 변수 값**: 
   - **따옴표 없이** 입력 (`"pk_live_..."` ❌ → `pk_live_...` ✅)
   - 앞뒤 공백 없어야 함
   - 값 전체를 복사하여 붙여넣기
3. **환경(Environment) 선택**: 
   - ✅ **Production** (프로덕션 배포용) - **필수**
   - ✅ **Preview** (프리뷰 배포용) - **필수**
   - ✅ **Development** (개발 환경용) - 선택 사항

#### ❌ 잘못된 설정 예시

```bash
# 따옴표 포함 (잘못됨)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."

# 공백 포함 (잘못됨)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY= pk_live_...

# 개발 키 사용 (프로덕션에서 잘못됨)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### 3단계: Clerk 프로덕션 키 확인

1. [Clerk Dashboard](https://dashboard.clerk.com/) 접속
2. 프로젝트 선택
3. **API Keys** 메뉴로 이동
4. **Production** 인스턴스의 키 확인:
   - `Publishable key`: `pk_live_...`로 시작해야 함
   - `Secret key`: `sk_live_...`로 시작해야 함

**중요**: 개발 인스턴스(`pk_test_...`)의 키를 프로덕션에 사용하면 안 됩니다!

### 4단계: 환경 변수 추가 후 재배포

환경 변수를 추가하거나 수정한 후에는 **반드시 재배포**해야 합니다:

#### 방법 1: Vercel 대시보드에서 재배포

1. **Deployments** 탭으로 이동
2. 최신 배포의 **⋯** (더보기) 메뉴 클릭
3. **Redeploy** 선택
4. **Use existing Build Cache** 체크 해제 (환경 변수 변경 시 권장)
5. **Redeploy** 클릭

#### 방법 2: Git 푸시로 자동 재배포

```bash
git commit --allow-empty -m "Trigger redeploy after env var update"
git push
```

### 5단계: 빌드 캐시 클리어 (필요시)

환경 변수가 여전히 로드되지 않는 경우:

1. Vercel 대시보드 → **Settings** → **General**
2. **Clear Build Cache** 클릭
3. 재배포

## 검증 방법

### 1. Vercel 빌드 로그 확인

1. Vercel 대시보드 → **Deployments** → 최신 배포 클릭
2. **Build Logs** 탭에서 다음 확인:
   - `[Layout] Server-side environment check` 로그 확인
   - `isProductionKey: true` 여야 함
   - `keyPrefix: "pk_live_"` 여야 함

### 2. 브라우저 콘솔 확인

배포된 사이트에서 F12 키로 개발자 도구 열기:

- **Console** 탭:
  - Clerk 개발 키 경고가 사라졌는지 확인
  - `[Layout]` 관련 에러가 없는지 확인
- **Network** 탭:
  - `/api/tour` 요청이 200 OK인지 확인
  - `/api/sync-user` 요청이 200 OK인지 확인

### 3. Chrome DevTools MCP 사용 (권장)

배포 URL을 제공하면 Chrome DevTools로 실제 상태를 확인할 수 있습니다:

1. 배포 URL 확인 (예: `https://mytrip-eight.vercel.app`)
2. Chrome DevTools MCP로 페이지 열기
3. 네트워크 요청 및 콘솔 로그 확인
4. 실제 에러 메시지 및 API 응답 확인

## 문제 해결 체크리스트

- [ ] Vercel 대시보드에서 모든 필수 환경 변수가 설정되어 있는가?
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`가 프로덕션 키(`pk_live_...`)인가?
- [ ] 환경 변수 값에 따옴표나 공백이 없는가?
- [ ] Production과 Preview 환경 모두에 체크되어 있는가?
- [ ] 환경 변수 추가 후 재배포했는가?
- [ ] 빌드 캐시를 클리어했는가? (필요시)
- [ ] Vercel 빌드 로그에서 환경 변수가 제대로 로드되는지 확인했는가?
- [ ] `NEXT_PUBLIC_APP_URL`이 올바른 배포 URL로 설정되어 있는가?

## 추가 리소스

- [Vercel 환경변수 문서](https://vercel.com/docs/projects/environment-variables)
- [Next.js 환경변수 문서](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Clerk 배포 가이드](https://clerk.com/docs/deployments/overview)
- [Clerk 프로덕션 키 발급](https://dashboard.clerk.com/)

## 코드 변경 사항

다음 파일들이 업데이트되었습니다:

- `next.config.ts`: 모든 필수 환경 변수를 `env` 설정에 추가
- `app/layout.tsx`: 프로덕션 환경에서 개발 키 사용 감지 로직 추가

이제 Vercel 빌드 시 환경 변수가 제대로 주입됩니다.

