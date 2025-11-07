# Vercel 빌드 시점 환경 변수 인식 문제 해결 가이드

## 문제 상황

환경 변수가 Vercel 대시보드에 정상적으로 설정되어 있지만, 빌드 시점에 인식하지 못하거나 읽지 못하는 경우:

```
Error: Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.
```

## 원인 분석

### 가능한 원인들

1. **빌드 타임 환경 변수 주입 문제**
   - Next.js 15의 정적 생성(prerendering) 시점에 환경 변수가 주입되지 않음
   - `next.config.ts`에서 환경 변수를 명시적으로 주입하지 않음

2. **정적 생성 시점 문제**
   - `not-found.tsx` 같은 정적 페이지가 빌드 시점에 prerender될 때 환경 변수 접근 불가
   - RootLayout이 정적 생성될 때 환경 변수가 아직 주입되지 않음

3. **Vercel 빌드 캐시 문제**
   - 이전 빌드 캐시로 인해 환경 변수가 업데이트되지 않음

4. **환경 변수 적용 범위 문제**
   - 특정 환경(Production/Preview)에만 설정되어 있음
   - 빌드가 다른 환경에서 실행됨

## 해결 방법

### 1단계: next.config.ts에 환경 변수 명시적 주입

`next.config.ts` 파일에 `env` 설정을 추가하여 빌드 타임에 환경 변수를 명시적으로 주입:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      // ... 기타 설정
    ],
  },
  // 빌드 타임에 환경 변수를 명시적으로 주입
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
};

export default nextConfig;
```

### 2단계: 빌드 캐시 클리어 및 재배포

1. **Vercel 대시보드에서 빌드 캐시 클리어**
   - Settings → General → "Clear Build Cache" 버튼 클릭
   - 또는 Vercel CLI 사용: `vercel --prod --force`

2. **재배포**
   - Deployments → 최신 배포 → ⋯ → Redeploy

### 3단계: 환경 변수 확인

Vercel 대시보드에서 다음을 확인:

1. **환경 변수 이름**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (정확히)
2. **환경 변수 값**: `pk_live_...` 또는 `pk_test_...` (따옴표 없이)
3. **환경 선택**: Production, Preview 모두 체크

### 4단계: 빌드 로그 확인

재배포 후 빌드 로그에서 다음을 확인:

1. **환경 변수 디버깅 로그**
   ```
   [Layout] Server-side environment check: {
     hasPublishableKey: true,
     keyPrefix: "pk_live_xxx",
     ...
   }
   ```

2. **에러 메시지**
   - 환경 변수가 여전히 없다면, Debug Info 섹션 확인
   - Available CLERK env vars 목록 확인

## 추가 해결 방법

### 방법 1: 환경 변수를 상수로 빌드 타임에 주입

`lib/env.ts` 파일 생성:

```typescript
// lib/env.ts
export const CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

if (!CLERK_PUBLISHABLE_KEY && typeof window === "undefined") {
  throw new Error("Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
}
```

`app/layout.tsx`에서 사용:

```typescript
import { CLERK_PUBLISHABLE_KEY } from "@/lib/env";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} localization={koKR}>
      {/* ... */}
    </ClerkProvider>
  );
}
```

### 방법 2: 동적 임포트 사용 (권장하지 않음)

정적 생성이 필요한 경우, ClerkProvider를 동적으로 임포트:

```typescript
import dynamic from "next/dynamic";

const ClerkProvider = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.ClerkProvider),
  { ssr: false }
);
```

하지만 이 방법은 SEO에 영향을 줄 수 있으므로 권장하지 않습니다.

## 체크리스트

- [ ] `next.config.ts`에 `env` 설정 추가
- [ ] Vercel 대시보드에서 환경 변수 확인
- [ ] Production, Preview 환경 모두 체크 확인
- [ ] 빌드 캐시 클리어
- [ ] 재배포 실행
- [ ] 빌드 로그에서 디버깅 정보 확인
- [ ] 에러 메시지의 Debug Info 확인

## 문제가 지속되는 경우

위의 모든 단계를 확인했는데도 문제가 지속되면:

1. **Vercel 지원팀에 문의**
   - 빌드 로그 전체 내용 제공
   - 환경 변수 설정 스크린샷 제공
   - `next.config.ts` 파일 내용 제공

2. **임시 해결책**
   - 환경 변수를 하드코딩 (보안상 권장하지 않음)
   - 또는 빌드 시점에 환경 변수를 확인하지 않도록 코드 수정

## 참고 자료

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Next.js next.config.js env](https://nextjs.org/docs/api-reference/next.config.js/environment-variables)

