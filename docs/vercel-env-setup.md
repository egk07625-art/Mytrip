# Vercel 환경변수 설정 가이드

## 문제 상황

로컬에서는 정상 작동하지만 Vercel 배포 환경에서 다음과 같은 에러가 발생하는 경우:

```
API 키가 유효하지 않거나 인증에 실패했습니다. 
환경변수 TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY를 확인해주세요.
```

이는 **Vercel에 환경변수가 설정되지 않았기 때문**입니다.

## 해결 방법

### 1. Vercel 대시보드에서 환경변수 설정

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 메뉴로 이동
4. 아래 환경변수들을 추가:

#### 필수 환경변수 (한국관광공사 API)

```
TOUR_API_KEY=your_tour_api_key_here
```

또는

```
NEXT_PUBLIC_TOUR_API_KEY=your_tour_api_key_here
```

**참고**: 
- `TOUR_API_KEY`: 서버 전용 (권장, 보안상 더 안전)
- `NEXT_PUBLIC_TOUR_API_KEY`: 클라이언트에서도 접근 가능

#### 환경변수 추가 방법

1. **Key** 필드에 `TOUR_API_KEY` 입력
2. **Value** 필드에 실제 API 키 입력
3. **Environment** 선택:
   - ✅ Production (프로덕션 환경)
   - ✅ Preview (프리뷰 환경)
   - ✅ Development (개발 환경) - 선택 사항
4. **Save** 클릭

### 2. 앱 URL 설정 (필수 - Sitemap 생성에 필요)

Sitemap 생성 및 Server Component에서 내부 API 호출 시 baseUrl 결정을 위해 **반드시 설정**해야 합니다:

```
NEXT_PUBLIC_APP_URL=https://mytrip-eight.vercel.app
```

**중요 사항**: 
- 마지막에 슬래시(`/`) 없이 입력 (코드에서 자동으로 제거되지만, 설정 시에도 슬래시 없이 입력 권장)
- Vercel 자동 URL(`VERCEL_URL`)도 사용 가능하지만, 명시적으로 설정하는 것이 더 안정적입니다
- 빌드 로그에서 `[Sitemap] Base URL:` 로그를 확인하여 올바르게 설정되었는지 확인 가능합니다

**설정 방법**:
1. Vercel 대시보드 → 프로젝트 → **Settings** → **Environment Variables**
2. **Key**: `NEXT_PUBLIC_APP_URL`
3. **Value**: `https://mytrip-eight.vercel.app` (슬래시 없이)
4. **Environment**: Production, Preview, Development 모두 선택
5. **Save** 클릭 후 재배포

### 3. 추가 필수 환경변수

다음 환경변수들도 Vercel에 설정되어 있어야 합니다:

#### Clerk 인증 (프로덕션 키 필수!)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
```

**중요**: 
- 프로덕션 배포 시에는 반드시 **프로덕션 키**(`pk_live_...`, `sk_live_...`)를 사용해야 합니다
- 개발 키(`pk_test_...`, `sk_test_...`)를 사용하면 경고가 표시되고 사용 제한이 있습니다
- Clerk Dashboard에서 프로덕션 인스턴스의 키를 확인하세요

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

### 3. 환경변수 확인

환경변수 추가 후:

1. **저장** 버튼 클릭
2. **Deployments** 탭으로 이동
3. 최신 배포를 **Redeploy** (환경변수 변경 후 재배포 필요)

### 4. 재배포

환경변수를 추가하거나 수정한 후에는 반드시 재배포해야 합니다:

1. Vercel 대시보드에서 **Deployments** 탭 선택
2. 최신 배포의 **⋯** (더보기) 메뉴 클릭
3. **Redeploy** 선택

또는 Git에 푸시하여 자동 재배포:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

## 확인 방법

### 1. Vercel 로그 확인

1. Vercel 대시보드 → **Deployments** → 최신 배포 클릭
2. **Functions** 탭에서 `/api/tour` 함수 로그 확인
3. 환경변수가 제대로 로드되었는지 확인

### 2. 빌드 로그 확인

배포 시 빌드 로그에서 다음 로그를 확인하세요:

```
[Sitemap] Environment check:
  - NEXT_PUBLIC_APP_URL: https://mytrip-eight.vercel.app
  - VERCEL_URL: (not set) 또는 mytrip-jqrb62n5k-aidens-projects-5ce02444.vercel.app
[Sitemap] Using NEXT_PUBLIC_APP_URL: https://mytrip-eight.vercel.app
[Sitemap] Base URL: https://mytrip-eight.vercel.app
```

- `NEXT_PUBLIC_APP_URL`이 설정되어 있으면 해당 URL 사용
- 설정되지 않으면 `VERCEL_URL` 사용
- 둘 다 없으면 기본값 `https://mytrip-eight.vercel.app` 사용

## 주의사항

1. **환경변수 값 확인**: API 키 앞뒤에 공백이나 따옴표가 없어야 합니다
2. **대소문자 구분**: 환경변수 이름은 정확히 일치해야 합니다
3. **재배포 필수**: 환경변수 추가/수정 후 반드시 재배포해야 적용됩니다
4. **보안**: API 키는 절대 공개 저장소에 커밋하지 마세요

## 한국관광공사 API 키 발급

1. [공공데이터포털](https://www.data.go.kr/) 접속
2. "한국관광공사_국문 관광정보 서비스" 검색
3. 활용신청 후 서비스 키 발급
4. 발급받은 키를 Vercel 환경변수에 설정

## 문제 해결 체크리스트

- [ ] Vercel 대시보드에서 환경변수가 설정되어 있는가?
- [ ] 환경변수 이름이 정확한가? (`TOUR_API_KEY` 또는 `NEXT_PUBLIC_TOUR_API_KEY`)
- [ ] `NEXT_PUBLIC_APP_URL`이 설정되어 있는가?
- [ ] 환경변수 값에 공백이나 따옴표가 없는가?
- [ ] 환경변수 추가 후 재배포했는가?
- [ ] 빌드 로그에서 환경변수 관련 에러가 없는가?
- [ ] API 키가 유효한가? (공공데이터포털에서 확인)

## 추가 리소스

- [Vercel 환경변수 문서](https://vercel.com/docs/projects/environment-variables)
- [Next.js 환경변수 문서](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

