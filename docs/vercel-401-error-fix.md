# Vercel 배포 시 401 API 에러 해결 가이드

## 문제 상황

Vercel 배포 환경에서 401 API 에러가 발생하는 경우, 주요 원인은 다음과 같습니다:

1. **환경변수 미설정**: `TOUR_API_KEY` 또는 `NEXT_PUBLIC_TOUR_API_KEY`가 Vercel에 설정되지 않음
2. **환경변수 설정 후 재배포 미실시**: 환경변수 추가 후 재배포를 하지 않음
3. **Server Component에서 내부 API 호출 시 baseUrl 문제**: Vercel 환경에서 URL 결정 로직 문제

## 해결 방법

### 1. Vercel 환경변수 확인 및 설정

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 메뉴로 이동
4. 다음 환경변수 확인/설정:

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

### 2. 환경변수 설정 후 재배포

환경변수를 추가하거나 수정한 후에는 반드시 재배포해야 합니다:

1. Vercel 대시보드에서 **Deployments** 탭 선택
2. 최신 배포의 **⋯** (더보기) 메뉴 클릭
3. **Redeploy** 선택

또는 Git에 푸시하여 자동 재배포:

```bash
git commit --allow-empty -m "Trigger redeploy after env var update"
git push
```

### 3. 배포 URL 확인 (선택 사항)

Vercel 대시보드에서 배포 URL을 확인한 후, 다음 환경변수도 설정하는 것을 권장합니다:

```
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

이렇게 하면 Server Component에서 내부 API 호출 시 baseUrl 결정이 더 안정적입니다.

### 4. 코드 개선 사항 (2025년 1월 적용)

다음 개선 사항이 적용되었습니다:

#### `app/page.tsx` 개선
- Next.js 15의 `headers()`를 사용하여 요청 URL을 더 안정적으로 가져오기
- Vercel 배포 환경에서 host 헤더 사용
- 더 자세한 로깅 추가

#### `app/api/tour/route.ts` 개선
- 요청 URL 및 헤더 로깅 추가
- 환경변수 상태 상세 로깅
- Vercel 환경변수 확인 추가

## 디버깅 방법

### 1. Vercel 로그 확인

1. Vercel 대시보드 → **Deployments** → 최신 배포 클릭
2. **Functions** 탭에서 `/api/tour` 함수 로그 확인
3. 다음 정보 확인:
   - `TOUR_API_KEY exists`: true 여야 함
   - `API Key length`: 0이 아니어야 함
   - `Request URL`: 올바른 URL인지 확인

### 2. 브라우저 개발자 도구 확인

1. 배포된 사이트에서 F12 키로 개발자 도구 열기
2. **Console** 탭:
   - `[Home] Base URL`: 올바른 URL인지 확인
   - `[Home] API URL`: 올바른 API URL인지 확인
   - 에러 메시지 확인
3. **Network** 탭:
   - `/api/tour` 요청 상태 확인
   - 401 에러인 경우 응답 내용 확인

### 3. Chrome DevTools MCP 사용 (권장)

배포 URL을 제공하면 Chrome DevTools로 실제 상태를 확인할 수 있습니다:

1. 배포 URL 확인 (예: `https://your-project.vercel.app`)
2. Chrome DevTools MCP로 페이지 열기
3. 네트워크 요청 및 콘솔 로그 확인
4. 실제 에러 메시지 및 API 응답 확인

## 문제 해결 체크리스트

- [ ] Vercel 대시보드에서 `TOUR_API_KEY` 환경변수가 설정되어 있는가?
- [ ] 환경변수 값에 공백이나 따옴표가 없는가?
- [ ] 환경변수 추가 후 재배포했는가?
- [ ] Vercel 로그에서 API 키가 제대로 로드되는지 확인했는가?
- [ ] API 키가 유효한가? (공공데이터포털에서 확인)
- [ ] `NEXT_PUBLIC_APP_URL` 환경변수가 설정되어 있는가? (선택 사항)

## 추가 리소스

- [Vercel 환경변수 문서](https://vercel.com/docs/projects/environment-variables)
- [Next.js 환경변수 문서](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [공공데이터포털 API 키 발급](https://www.data.go.kr/)

