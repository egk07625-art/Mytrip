# 문제 해결 가이드

## Clerk 개발 키 경고 메시지

### 문제
콘솔에 다음과 같은 경고가 표시됩니다:
```
Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production.
```

### 원인
- 개발 환경에서 Clerk 개발 키를 사용 중일 때 나타나는 정상적인 경고입니다.
- 프로덕션 배포 시에는 Clerk 프로덕션 키를 사용해야 합니다.

### 해결 방법

#### 개발 환경 (현재)
- 이 경고는 **무시해도 됩니다**. 개발 중에는 정상적인 동작입니다.
- 개발 환경에서는 Clerk 개발 인스턴스 사용 제한이 있지만, 로컬 개발에는 문제없습니다.

#### 프로덕션 배포 시
1. Clerk Dashboard에서 프로덕션 인스턴스 생성
2. 프로덕션 키를 환경 변수에 설정
3. Vercel 등 배포 환경에서 환경 변수 업데이트

```bash
# .env.production 또는 배포 환경 설정
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

## 체크리스트

### 1. 환경 변수 확인
다음 명령어로 환경 변수가 설정되어 있는지 확인:

```bash
# PowerShell
Get-Content .env.local | Select-String "CLERK"
```

필수 환경 변수:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TOUR_API_KEY` 또는 `NEXT_PUBLIC_TOUR_API_KEY`

### 2. 브라우저 콘솔 확인
개발자 도구(F12) → Console 탭에서:
- ✅ Clerk 개발 키 경고: 정상 (무시 가능)
- ❌ 빨간색 에러 메시지: 확인 필요
- ❌ 네트워크 요청 실패: API 키 확인 필요

### 3. 네트워크 탭 확인
개발자 도구(F12) → Network 탭에서:
- `/api/sync-user` 요청이 실패하는지 확인
- `/api/tour` 요청이 실패하는지 확인
- 실패 시 응답 내용 확인

### 4. 주요 기능 확인

#### 로그인 기능
- [ ] "로그인" 버튼 클릭 시 Clerk 모달이 열리는지
- [ ] 로그인 후 사용자 프로필 아이콘이 표시되는지

#### 사용자 동기화
- [ ] 로그인 후 `/api/sync-user` 요청이 자동으로 실행되는지
- [ ] Supabase `users` 테이블에 사용자가 생성되는지

#### API 호출
- [ ] 관광지 목록 API가 정상 작동하는지
- [ ] API 키가 올바르게 설정되어 있는지

## 자주 발생하는 문제

### 문제 1: Clerk 로그인 모달이 열리지 않음
**원인**: Clerk 환경 변수가 설정되지 않았거나 잘못됨
**해결**: `.env.local` 파일에 올바른 Clerk 키가 설정되어 있는지 확인

### 문제 2: 사용자 동기화 실패
**원인**: Supabase 연결 실패 또는 RLS 정책 문제
**해결**: 
- Supabase 환경 변수 확인
- Supabase 마이그레이션 적용 확인
- 개발 환경에서는 RLS 비활성화 권장

### 문제 3: API 요청 실패
**원인**: API 키 누락 또는 잘못된 키
**해결**: 
- `TOUR_API_KEY` 또는 `NEXT_PUBLIC_TOUR_API_KEY` 확인
- 공공데이터포털에서 발급받은 키가 올바른지 확인

## 디버깅 팁

### 1. 서버 로그 확인
터미널에서 Next.js 개발 서버 로그를 확인:
```bash
pnpm dev
```

### 2. 클라이언트 로그 확인
브라우저 콘솔에서 확인:
- `console.log` 또는 `console.error` 메시지
- 네트워크 요청/응답 상태

### 3. 환경 변수 확인
서버 재시작 후에도 환경 변수가 적용되지 않으면:
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. Next.js 서버를 재시작 (`pnpm dev`)
3. 브라우저를 완전히 새로고침 (Ctrl+Shift+R)

## 참고 자료

- [Clerk 배포 가이드](https://clerk.com/docs/deployments/overview)
- [Next.js 환경 변수](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)

