# 환경변수 보안 검증 리포트

생성일: 2025. 11. 7. 오후 5:29:43

## 전체 요약

- 총 검증 항목: 8
- 통과: 1 (12.5%)
- 실패: 7 (87.5%)

## 실패한 항목 (7개)

### TOUR_API_KEY

**에러:** TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY 중 하나는 필수입니다

### NEXT_PUBLIC_TOUR_API_KEY

**에러:** TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY 중 하나는 필수입니다

### NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

**에러:** 필수 환경변수가 설정되지 않았습니다: Clerk 인증 Publishable Key

### CLERK_SECRET_KEY

**에러:** 필수 환경변수가 설정되지 않았습니다: Clerk 인증 Secret Key

### NEXT_PUBLIC_SUPABASE_URL

**에러:** 필수 환경변수가 설정되지 않았습니다: Supabase 프로젝트 URL

### NEXT_PUBLIC_SUPABASE_ANON_KEY

**에러:** 필수 환경변수가 설정되지 않았습니다: Supabase Anon Key

### SUPABASE_SERVICE_ROLE_KEY

**에러:** 필수 환경변수가 설정되지 않았습니다: Supabase Service Role Key

## 통과한 항목 (1개)

- **NEXT_PUBLIC_STORAGE_BUCKET**: ⚠️ 선택 사항 (설정 안 됨) - Supabase Storage 버킷 이름
