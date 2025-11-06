graph TB
    subgraph "사용자 인터페이스"
        A[홈페이지 /]
        B[상세페이지 /places/:id]
        C[북마크 페이지 /bookmarks]
    end
    
    subgraph "홈페이지 구성요소"
        A1[검색창<br/>tour-search]
        A2[필터<br/>tour-filters]
        A3[관광지 목록<br/>tour-list]
        A4[네이버 지도<br/>naver-map]
        A --> A1
        A --> A2
        A --> A3
        A --> A4
    end
    
    subgraph "상세페이지 구성요소"
        B1[기본정보<br/>detail-info]
        B2[운영정보<br/>detail-intro]
        B3[이미지 갤러리<br/>detail-gallery]
        B4[지도<br/>detail-map]
        B5[공유 버튼<br/>share-button]
        B6[북마크 버튼<br/>bookmark-button]
        B --> B1
        B --> B2
        B --> B3
        B --> B4
        B --> B5
        B --> B6
    end
    
    subgraph "외부 API"
        D[한국관광공사 API]
        D1[areaCode2<br/>지역코드]
        D2[areaBasedList2<br/>지역기반 조회]
        D3[searchKeyword2<br/>키워드 검색]
        D4[detailCommon2<br/>공통정보]
        D5[detailIntro2<br/>소개정보]
        D6[detailImage2<br/>이미지]
        D --> D1
        D --> D2
        D --> D3
        D --> D4
        D --> D5
        D --> D6
    end
    
    subgraph "인증 & 데이터베이스"
        E[Clerk 인증]
        F[Supabase DB]
        F1[bookmarks 테이블]
        F --> F1
    end
    
    subgraph "지도 서비스"
        G[Naver Maps API v3]
    end
    
    A1 --> D3
    A2 --> D1
    A2 --> D2
    A3 --> D2
    A4 --> G
    
    B1 --> D4
    B2 --> D5
    B3 --> D6
    B4 --> G
    B6 --> E
    B6 --> F1
    
    C --> E
    C --> F1
    
    style A fill:#e1f5ff
    style B fill:#e1f5ff
    style C fill:#e1f5ff
    style D fill:#fff4e1
    style E fill:#f0e1ff
    style F fill:#f0e1ff
    style G fill:#e1ffe1