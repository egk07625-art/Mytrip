# Vercel Clerk 환경 변수 설정 문제 해결 가이드

## 문제 상황

빌드 시 다음과 같은 에러가 발생하는 경우:

```
Error: Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY. Please set it in your environment variables.
```

이는 Vercel 빌드 시점에 환경 변수가 로드되지 않았을 때 발생합니다.

## 원인 분석

### 가능한 원인들

1. **환경 변수가 특정 환경에만 설정됨**
   - Production에만 설정되고 Preview/Development에는 없음
   - 또는 그 반대

2. **환경 변수 이름 오타**
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (정확한 이름)
   - 대소문자 구분, 공백 없어야 함

3. **환경 변수 값 문제**
   - 값에 따옴표나 공백 포함
   - 값이 비어있음

4. **환경 변수 저장 후 재배포 안 함**
   - 환경 변수 추가/수정 후 반드시 재배포 필요

## 해결 방법

### 1단계: Vercel 대시보드에서 환경 변수 확인

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 이동

### 2단계: 환경 변수 설정 확인

다음 항목들을 확인하세요:

#### ✅ 환경 변수 이름
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```
- 정확히 이 이름이어야 함 (대소문자 구분)
- 공백 없어야 함

#### ✅ 환경 변수 값
```
pk_live_xxxxxxxxxxxxxxxxxxxxx
```
또는
```
pk_test_xxxxxxxxxxxxxxxxxxxxx
```
- `pk_live_...` 또는 `pk_test_...`로 시작해야 함
- **따옴표 없이** 입력
- 앞뒤 공백 없어야 함

#### ✅ 환경(Environment) 선택
다음 세 가지 모두 체크되어 있어야 합니다:
- ✅ **Production** (프로덕션 배포용)
- ✅ **Preview** (프리뷰 배포용)
- ✅ **Development** (개발 환경용, 선택 사항)

**중요**: 빌드가 실패하는 경우, **모든 환경에 체크**되어 있는지 확인하세요!

### 3단계: 환경 변수 추가/수정

환경 변수가 없거나 잘못 설정된 경우:

1. **Key** 필드에 `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 입력
2. **Value** 필드에 Clerk Dashboard에서 복사한 Publishable Key 입력
   - 따옴표 없이 입력
   - 앞뒤 공백 제거
3. **Environment** 선택:
   - ✅ Production
   - ✅ Preview
   - ✅ Development (선택 사항)
4. **Save** 클릭

### 4단계: 재배포

환경 변수를 추가하거나 수정한 후 **반드시 재배포**해야 합니다:

#### 방법 1: Vercel 대시보드에서 재배포
1. **Deployments** 탭으로 이동
2. 최신 배포의 **⋯** (더보기) 메뉴 클릭
3. **Redeploy** 선택

#### 방법 2: Vercel CLI로 재배포
```bash
vercel --prod --force
```

### 5단계: 빌드 로그 확인

재배포 후 빌드 로그를 확인하세요:

1. Vercel 대시보드 → **Deployments** → 최신 배포 클릭
2. **Build Logs** 탭 확인
3. 환경 변수 관련 에러가 없는지 확인

## 체크리스트

다음 항목들을 모두 확인하세요:

- [ ] Vercel 대시보드에서 환경 변수가 설정되어 있는가?
- [ ] 환경 변수 이름이 정확한가? (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
- [ ] 환경 변수 값이 올바른가? (`pk_live_...` 또는 `pk_test_...`)
- [ ] 값에 따옴표나 공백이 없는가?
- [ ] Production 환경에 체크되어 있는가?
- [ ] Preview 환경에 체크되어 있는가?
- [ ] 환경 변수 저장 후 재배포했는가?
- [ ] 빌드 로그에서 환경 변수 관련 에러가 없는가?

## 추가 확인 사항

### Clerk Dashboard에서 키 확인

1. [Clerk Dashboard](https://dashboard.clerk.com) 접속
2. 프로젝트 선택
3. **API Keys** 메뉴로 이동
4. **Publishable Key** 복사
   - 프로덕션: `pk_live_...`
   - 개발: `pk_test_...`

### 로컬에서 테스트

로컬에서 빌드 테스트를 해보세요:

```bash
# 환경 변수 확인
Get-Content .env.local | Select-String "CLERK"

# 빌드 테스트
pnpm build
```

로컬에서 빌드가 성공하면, Vercel 환경 변수 설정 문제일 가능성이 높습니다.

## 문제가 지속되는 경우

위의 모든 단계를 확인했는데도 문제가 지속되면:

1. **Vercel 지원팀에 문의**
   - 빌드 로그와 환경 변수 설정 스크린샷 첨부
   - 에러 메시지 전체 내용 제공

2. **임시 해결책** (권장하지 않음)
   - 빌드 시점에 환경 변수가 없어도 동작하도록 코드 수정
   - 하지만 이는 보안상 좋지 않으므로 근본적인 해결책이 아닙니다

## 참고 자료

- [Vercel 환경 변수 문서](https://vercel.com/docs/projects/environment-variables)
- [Next.js 환경 변수 문서](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Clerk 환경 변수 설정](https://clerk.com/docs/quickstarts/nextjs)

