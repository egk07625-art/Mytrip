sequenceDiagram
    participant U as 사용자
    participant UI as UI 컴포넌트
    participant API as API Route
    participant Tour as 한국관광공사 API
    participant Clerk as Clerk 인증
    participant DB as Supabase DB
    
    Note over U,DB: 홈페이지 - 관광지 목록 조회
    U->>UI: 지역/타입 필터 선택
    UI->>API: GET /api/tour?areaCode=1&contentTypeId=12
    API->>Tour: areaBasedList2 호출
    Tour-->>API: 관광지 목록 반환
    API-->>UI: JSON 데이터 반환
    UI-->>U: 목록 + 지도 표시
    
    Note over U,DB: 검색 기능
    U->>UI: 키워드 입력 + 검색
    UI->>API: GET /api/tour/search?keyword=서울
    API->>Tour: searchKeyword2 호출
    Tour-->>API: 검색 결과 반환
    API-->>UI: JSON 데이터 반환
    UI-->>U: 검색 결과 표시
    
    Note over U,DB: 상세페이지 조회
    U->>UI: 관광지 클릭
    UI->>API: GET /api/tour/detail?contentId=125266
    API->>Tour: detailCommon2, detailIntro2, detailImage2 호출
    Tour-->>API: 상세 정보 반환
    API-->>UI: JSON 데이터 반환
    UI-->>U: 상세 정보 표시
    
    Note over U,DB: 북마크 추가
    U->>UI: 북마크 버튼 클릭
    UI->>Clerk: 인증 확인
    Clerk-->>UI: 인증 토큰
    UI->>DB: INSERT INTO bookmarks
    DB-->>UI: 성공
    UI-->>U: 북마크 완료 표시