# SEO 최적화 테스트 가이드

이 문서는 Phase 5에서 구현한 SEO 최적화 기능(sitemap, robots.txt)을 테스트하는 방법을 설명합니다.

## 테스트 항목

### 1. Sitemap 접근 확인

#### 방법 1: 브라우저에서 직접 접근
```
http://localhost:3000/sitemap.xml
```
또는 프로덕션 환경:
```
https://your-domain.com/sitemap.xml
```

#### 예상 결과
- XML 형식의 sitemap이 표시되어야 합니다
- 홈페이지 URL이 포함되어야 합니다
- 관광지 상세 페이지 URL들이 포함되어야 합니다 (최대 500개)

#### 확인 사항
- [ ] XML 형식이 올바른지 확인
- [ ] 홈페이지 URL이 포함되어 있는지 확인
- [ ] 관광지 상세 페이지 URL들이 포함되어 있는지 확인
- [ ] 각 URL에 lastModified, changeFrequency, priority가 설정되어 있는지 확인

### 2. Robots.txt 접근 확인

#### 방법 1: 브라우저에서 직접 접근
```
http://localhost:3000/robots.txt
```
또는 프로덕션 환경:
```
https://your-domain.com/robots.txt
```

#### 예상 결과
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /admin/

Sitemap: https://your-domain.com/sitemap.xml
```

#### 확인 사항
- [ ] User-agent 규칙이 올바르게 설정되어 있는지 확인
- [ ] Allow/Disallow 규칙이 올바른지 확인
- [ ] Sitemap URL이 포함되어 있는지 확인

### 3. 검색 엔진 크롤러 테스트 (선택적)

#### Google Search Console
1. Google Search Console에 사이트 등록
2. Sitemap 제출: `https://your-domain.com/sitemap.xml`
3. 크롤링 상태 확인

#### Bing Webmaster Tools
1. Bing Webmaster Tools에 사이트 등록
2. Sitemap 제출: `https://your-domain.com/sitemap.xml`
3. 크롤링 상태 확인

### 4. 명령줄에서 테스트

#### cURL 사용
```bash
# Sitemap 테스트
curl http://localhost:3000/sitemap.xml

# Robots.txt 테스트
curl http://localhost:3000/robots.txt
```

#### 예상 결과
- HTTP 200 상태 코드
- 올바른 Content-Type 헤더 (sitemap.xml: application/xml, robots.txt: text/plain)

## 문제 해결

### Sitemap이 비어있는 경우
- API 호출이 실패했을 수 있습니다
- 콘솔 로그 확인: `[Sitemap]`으로 시작하는 로그 확인
- 폴백 로직이 작동하여 홈페이지만 포함되었을 수 있습니다

### Robots.txt가 표시되지 않는 경우
- Next.js 빌드 확인: `pnpm build` 실행
- 개발 서버 재시작: `pnpm dev`
- 캐시 클리어: 브라우저 캐시 삭제

### Sitemap에 관광지 URL이 적은 경우
- API 호출이 일부 실패했을 수 있습니다
- 지역별로 최대 50개씩만 가져오도록 제한되어 있습니다
- 상위 10개 지역만 조회하도록 최적화되어 있습니다

## 성능 고려사항

- Sitemap 생성은 빌드 타임에 실행됩니다
- API 호출이 많을 수 있으므로 캐싱을 활용합니다 (24시간)
- 프로덕션 환경에서는 ISR(Incremental Static Regeneration)을 활용합니다

## 향후 개선 사항

- [ ] Sitemap 인덱스 파일 생성 (500개 이상 URL 시)
- [ ] 동적 sitemap 업데이트 (실시간)
- [ ] 더 많은 관광지 포함 (현재는 상위 10개 지역만)
- [ ] 이미지 sitemap 추가
- [ ] 뉴스 sitemap 추가 (필요 시)

