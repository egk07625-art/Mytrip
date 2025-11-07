# Supabase 마이그레이션 적용 가이드

## 현재 상태

- ✅ `users` 테이블: 이미 존재
- ❌ `bookmarks` 테이블: 생성 필요
- ❌ Storage 버킷: 설정 필요

## 마이그레이션 적용 방법

Supabase Dashboard에서 다음 단계를 따라 마이그레이션을 적용하세요.

### 1. Supabase Dashboard 접속

1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭

### 2. bookmarks 테이블 생성

**SQL Editor**에서 **New query**를 클릭하고 아래 SQL을 복사하여 실행하세요:

```sql
-- =====================================================
-- bookmarks 테이블 (북마크 기능)
-- =====================================================
-- 사용자가 관광지를 북마크할 수 있는 기능
-- 각 사용자는 동일한 관광지를 한 번만 북마크 가능 (UNIQUE 제약)

CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content_id TEXT NOT NULL,  -- 한국관광공사 API의 contentid
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

    -- 동일 사용자가 같은 관광지를 중복 북마크하는 것을 방지
    CONSTRAINT unique_user_bookmark UNIQUE(user_id, content_id)
);

-- 테이블 소유자 설정
ALTER TABLE public.bookmarks OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_content_id ON public.bookmarks(content_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.bookmarks(created_at DESC);

-- Row Level Security (RLS) 비활성화
ALTER TABLE public.bookmarks DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.bookmarks TO anon;
GRANT ALL ON TABLE public.bookmarks TO authenticated;
GRANT ALL ON TABLE public.bookmarks TO service_role;

-- 테이블 설명
COMMENT ON TABLE public.bookmarks IS '사용자 북마크 정보 - 관광지 즐겨찾기';
COMMENT ON COLUMN public.bookmarks.user_id IS 'users 테이블의 사용자 ID';
COMMENT ON COLUMN public.bookmarks.content_id IS '한국관광공사 API contentid (예: 125266)';
```

**실행 후 확인**: `Success. No rows returned` 메시지가 표시되면 성공입니다.

### 3. Storage 버킷 설정

**SQL Editor**에서 **New query**를 클릭하고 아래 SQL을 복사하여 실행하세요:

```sql
-- Storage 버킷 생성 및 RLS 정책 설정
-- Clerk 인증된 사용자만 자신의 파일에 접근할 수 있도록 제한

-- 1. uploads 버킷 생성 (이미 존재하면 무시됨)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  false,  -- private bucket
  6291456,  -- 6MB 제한 (6 * 1024 * 1024)
  NULL  -- 모든 파일 타입 허용
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 6291456;

-- INSERT: 인증된 사용자만 자신의 폴더에 업로드 가능
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
);

-- SELECT: 인증된 사용자만 자신의 파일 조회 가능
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
);

-- DELETE: 인증된 사용자만 자신의 파일 삭제 가능
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
);

-- UPDATE: 인증된 사용자만 자신의 파일 업데이트 가능
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
)
WITH CHECK (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = (SELECT auth.jwt()->>'sub')
);
```

**참고**: 정책이 이미 존재하는 경우 에러가 발생할 수 있습니다. 이 경우 기존 정책을 삭제한 후 다시 실행하거나, `CREATE POLICY IF NOT EXISTS` 구문을 사용할 수 없으므로 수동으로 정책을 확인하세요.

### 4. 마이그레이션 검증

마이그레이션 적용 후 아래 SQL로 검증하세요:

```sql
-- 테이블 생성 확인
SELECT 
    table_name,
    CASE WHEN table_name = 'bookmarks' THEN '생성 완료' ELSE '이미 존재' END AS status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'bookmarks')
ORDER BY table_name;

-- bookmarks 테이블 구조 확인
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'bookmarks'
ORDER BY ordinal_position;

-- 인덱스 확인
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
AND tablename = 'bookmarks';

-- RLS 상태 확인
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename IN ('users', 'bookmarks');

-- Storage 버킷 확인
SELECT 
    id,
    name,
    public,
    file_size_limit
FROM storage.buckets
WHERE id = 'uploads';
```

## 예상 결과

### 테이블 생성 확인
- `users`: 이미 존재
- `bookmarks`: 생성 완료

### bookmarks 테이블 구조
- `id` (UUID, PRIMARY KEY)
- `user_id` (UUID, FOREIGN KEY → users.id)
- `content_id` (TEXT, NOT NULL)
- `created_at` (TIMESTAMPTZ, DEFAULT now())

### 인덱스
- `idx_bookmarks_user_id`
- `idx_bookmarks_content_id`
- `idx_bookmarks_created_at`

### RLS 상태
- `users`: 비활성화 (rowsecurity = false)
- `bookmarks`: 비활성화 (rowsecurity = false)

### Storage 버킷
- `uploads` 버킷 생성 완료
- 정책 4개 생성 완료 (INSERT, SELECT, DELETE, UPDATE)

## 문제 해결

### 정책이 이미 존재하는 경우
Storage 정책이 이미 존재하는 경우, 기존 정책을 삭제한 후 다시 실행하세요:

```sql
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
```

그 후 Storage 버킷 설정 SQL을 다시 실행하세요.

### 외래 키 제약 조건 오류
`users` 테이블이 존재하지 않는 경우, 먼저 `users` 테이블을 생성하세요:

```sql
-- users 테이블 생성 (이미 존재하면 무시됨)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.users OWNER TO postgres;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;
```

## 다음 단계

마이그레이션 적용이 완료되면:

1. ✅ `docs/TODO.md`의 Phase 4.1 항목 업데이트
2. 북마크 기능 구현 시작 (Phase 4.2)

