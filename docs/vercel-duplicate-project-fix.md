# Vercel 중복 프로젝트 문제 해결 가이드

## 문제 상황

같은 GitHub 저장소에 여러 Vercel 프로젝트가 연결되어 있어서, 커밋 푸시 시마다 모든 프로젝트가 배포를 시도하는 경우입니다.

## 원인

- 같은 저장소에 여러 프로젝트가 연결됨
- 각 프로젝트가 독립적으로 배포를 시도
- 환경 변수나 설정이 일부 프로젝트에만 설정되어 실패 발생

## 해결 방법

### 방법 1: 불필요한 프로젝트 삭제 (권장)

1. **Vercel 대시보드 접속**
   - [https://vercel.com/dashboard](https://vercel.com/dashboard)

2. **삭제할 프로젝트 선택**
   - `api-using` 프로젝트 클릭

3. **Settings로 이동**
   - 프로젝트 페이지에서 **Settings** 탭 클릭

4. **프로젝트 삭제**
   - 왼쪽 사이드바 맨 아래 **"Delete Project"** 또는 **"Danger Zone"** 섹션 찾기
   - **"Delete Project"** 버튼 클릭
   - 프로젝트 이름 입력하여 확인
   - **"Delete"** 클릭

### 방법 2: 프로젝트 유지 (필요한 경우)

프로젝트를 유지하려면:

1. **환경 변수 설정**
   - Settings → Environment Variables
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 등 필수 환경 변수 추가
   - Production, Preview 환경 모두 체크

2. **배포 설정 확인**
   - Settings → General
   - Build Command, Output Directory 등 확인

3. **GitHub 연결 확인**
   - Settings → Git
   - 올바른 브랜치가 연결되어 있는지 확인

## 권장 사항

- **하나의 프로젝트만 유지**: 같은 저장소에는 하나의 프로젝트만 연결하는 것이 좋습니다
- **프로덕션/스테이징 분리**: 필요하다면 다른 브랜치를 사용하여 분리
- **프로젝트 이름 명확화**: 프로젝트 이름을 명확하게 구분

## 주의사항

- 프로젝트 삭제는 되돌릴 수 없습니다
- 삭제 전에 필요한 설정이나 데이터를 백업하세요
- 삭제 후에도 GitHub 저장소는 그대로 유지됩니다

