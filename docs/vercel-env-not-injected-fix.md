# Vercel 환경 변수가 빌드 시점에 주입되지 않는 문제 해결

## 문제 상황

빌드 로그에서:
```
- VERCEL_ENV: production
- Total env vars: 154
- CLERK env vars found: none
```

환경 변수가 Vercel 대시보드에 설정되어 있지만, 빌드 시점에 주입되지 않는 경우입니다.

## 원인

1. **환경 변수가 Production 환경에 체크되지 않음**
2. **환경 변수 이름 오타** (대소문자, 공백)
3. **다른 프로젝트에 설정됨**
4. **저장 후 재배포 누락**

## 해결 방법

### 1단계: Vercel 대시보드에서 환경 변수 확인

1. **올바른 프로젝트 선택 확인**
   - 현재 배포 중인 프로젝트가 맞는지 확인
   - 프로젝트 이름 확인 (예: `mytrip`)

2. **환경 변수 목록 확인**
   - Settings → Environment Variables
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`가 목록에 있는지 확인

3. **환경 변수 상세 확인**
   - 환경 변수를 클릭하거나 Edit 버튼 클릭
   - 다음을 확인:
     - **Key**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (정확히)
     - **Value**: `pk_live_...` 또는 `pk_test_...` (따옴표 없이)
     - **Environment**: 
       - ☑ **Production** ← 반드시 체크!
       - ☑ **Preview** ← 반드시 체크!
       - ☐ Development (선택 사항)

### 2단계: 환경 변수 재설정 (권장)

환경 변수가 있더라도, 삭제 후 다시 추가하는 것이 가장 확실합니다:

1. **기존 환경 변수 삭제**
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 찾기
   - ⋯ 메뉴 → Delete 클릭
   - 확인

2. **새로 추가**
   - "+ Add New" 또는 "Create" 버튼 클릭
   - **Key**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 입력
     - 정확히 입력 (대소문자 구분)
     - 공백 없이
   - **Value**: Clerk Dashboard에서 복사한 Publishable Key 입력
     - `pk_live_...` 또는 `pk_test_...`
     - 따옴표 없이
     - 앞뒤 공백 제거
   - **Environment**:
     - ☑ **Production** 체크
     - ☑ **Preview** 체크
     - ☐ Development (선택 사항)
   - **Save** 클릭

### 3단계: 빌드 캐시 클리어

1. **Vercel 대시보드에서**
   - Settings → General
   - "Clear Build Cache" 버튼 클릭
   - 확인

2. **또는 CLI 사용**
   ```bash
   vercel --prod --force
   ```

### 4단계: 재배포

1. **Deployments 탭으로 이동**
2. **최신 배포 찾기**
3. **⋯ 메뉴 → Redeploy 클릭**
4. **빌드 완료 대기**

### 5단계: 빌드 로그 확인

재배포 후 빌드 로그에서 다음을 확인:

```
[Layout] Server-side environment check: {
  hasPublishableKey: true,  ← true여야 함
  keyPrefix: "pk_live_xxx",  ← 값이 있어야 함
  clerkEnvKeys: ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"],  ← 목록에 있어야 함
  ...
}
```

## 체크리스트

- [ ] 올바른 프로젝트를 선택했는가?
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 환경 변수가 존재하는가?
- [ ] 환경 변수 이름이 정확한가? (대소문자, 공백 없음)
- [ ] 환경 변수 값이 올바른가? (따옴표 없이)
- [ ] **Production 환경에 체크되어 있는가?** ← 가장 중요!
- [ ] **Preview 환경에 체크되어 있는가?**
- [ ] 환경 변수 저장 후 재배포했는가?
- [ ] 빌드 캐시를 클리어했는가?

## 문제가 지속되는 경우

### 방법 1: Vercel CLI로 환경 변수 확인

```bash
# Vercel CLI 설치 (없는 경우)
npm i -g vercel

# 프로젝트 디렉토리에서
vercel env ls

# Production 환경 변수 확인
vercel env ls production

# 환경 변수 추가 (CLI로)
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# 값 입력 프롬프트에서 Clerk 키 입력
```

### 방법 2: Vercel 지원팀에 문의

다음 정보를 포함하여 문의:
- 프로젝트 이름
- 빌드 로그 (전체)
- 환경 변수 설정 스크린샷
- `VERCEL_ENV: production`인데도 환경 변수가 주입되지 않는다는 점

## 참고

- Vercel은 환경 변수를 빌드 시점에 주입합니다
- `NEXT_PUBLIC_` 접두사가 있는 환경 변수는 클라이언트 번들에도 포함됩니다
- 환경 변수 변경 후 반드시 재배포해야 적용됩니다
- 빌드 캐시를 클리어하면 이전 빌드의 환경 변수가 사용되지 않습니다

