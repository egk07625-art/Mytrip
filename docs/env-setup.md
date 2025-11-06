# 환경변수 설정 가이드

## 필수 환경변수

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 환경변수를 설정하세요.

```bash
# 한국관광공사 API
# 공공데이터포털(data.go.kr)에서 발급받은 서비스 키
NEXT_PUBLIC_TOUR_API_KEY=your_tour_api_key

# 서버 사이드에서 사용할 경우 (NEXT_PUBLIC_ 접두사 없이)
TOUR_API_KEY=your_tour_api_key

# 네이버 지도 (NCP)
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_naver_map_client_id

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

## 환경변수 가이드

### 한국관광공사 API 키 발급

1. [공공데이터포털](https://www.data.go.kr/) 접속
2. "한국관광공사\_국문 관광정보 서비스" 검색
3. 활용신청 후 서비스 키 발급
4. 발급받은 키를 `NEXT_PUBLIC_TOUR_API_KEY`에 설정

**참고**:

- `NEXT_PUBLIC_` 접두사가 있으면 클라이언트에서 접근 가능
- 서버 사이드 전용이면 접두사 없이 사용 (`TOUR_API_KEY`)

### 네이버 지도 API 키 발급

1. [네이버 클라우드 플랫폼](https://www.ncloud.com/) 접속
2. Maps API 신청
3. Web Dynamic Map 서비스 활성화
4. Client ID를 `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`에 설정

## 환경변수 검증

프로젝트 실행 전 다음 명령어로 환경변수 확인:

```bash
# .env.local 파일 확인
cat .env.local

# 또는 PowerShell (Windows)
Get-Content .env.local
```

## 주의사항

- `.env.local` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다
- 실제 API 키는 절대 공개 저장소에 커밋하지 마세요
- 배포 환경(Vercel 등)에서는 프로젝트 설정에서 환경변수를 별도로 설정해야 합니다

## Vercel 배포 시 환경변수 설정

로컬에서는 정상 작동하지만 Vercel 배포 환경에서 API 에러가 발생하는 경우, Vercel에 환경변수가 설정되지 않았을 가능성이 높습니다.

**자세한 설정 방법**: [Vercel 환경변수 설정 가이드](./vercel-env-setup.md)

**빠른 설정**:

1. Vercel 대시보드 → 프로젝트 선택 → **Settings** → **Environment Variables**
2. `TOUR_API_KEY` 또는 `NEXT_PUBLIC_TOUR_API_KEY` 추가
3. 실제 API 키 값 입력
4. **Save** 후 **재배포** (환경변수 변경 후 필수!)
