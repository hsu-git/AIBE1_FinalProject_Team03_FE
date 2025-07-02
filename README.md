# `AIBE1_FinalProject_Team03_FE` (프론트엔드 레포지토리) (v.2.)

_(2025-07-01 업데이트)_

---

> 이 레포지토리는 Ticketmon 프로젝트의 프론트엔드 애플리케이션 코드를 관리합니다. 백엔드 레포지토리(AIBE1_FinalProject_Team03_BE)와 분리되어, 프론트엔드 팀이 독립적으로 개발 및 배포를 진행할 수 있도록 구성되었습니다.
>
> [❗[프론트엔드 폴더 구조 & 개발 가이드 문서 보러가기]](./ARCHITECTURE_GUIDE.md)

---

## 🚀 1. 개발 환경 설정 가이드

### 1.1. 필수 설치 도구

- Node.js: v18.x 이상 권장
- npm: v9.x 이상 권장 (Node.js 설치 시 함께 설치됨)
- Git: 최신 버전
- Docker Desktop: 백엔드 인프라(Redis, LocalStack, Nginx) 실행 및 로컬 환경 테스트를 위해 필요합니다.

<br>

### 1.2. 프로젝트 시작하기

**1. 프론트엔드 레포지토리 클론:**

```bash
    git clone https://github.com/AIBE-3Team/AIBE1_FinalProject_Team03_FE.git
    cd AIBE1_FinalProject_Team03_FE
```

---

**2. 의존성 설치:**

- 프로젝트에 필요한 모든 의존성을 설치합니다. (`package.json` 기반: `react-router-dom`, `axios`, `lucide-react`, `@tosspayments/payment-sdk` 등 포함)

⚡️ 중요: 변경사항을 pull 받은 후에는 반드시 npm install을 다시 실행해야 합니다!

```bash
    npm install
    # 프로젝트에 필요한 모든 의존성을 설치합니다. (package.json 기반)
    # react-router-dom (클라이언트 라우팅), axios (API 통신) 등 포함

    # 만약 이전에 설치하지 않았다면 개별적으로 설치:
    # npm install react-router-dom
    # npm install axios
```

(이 명령은 package.json에 정의된 모든 패키지를 설치합니다.)

---

**3. Tailwind CSS (v3) 설정 확인:**

Tailwind CSS v3가 프로젝트에 이미 기본적으로 설정되어 있습니다. 별도의 추가 설치 없이 바로 유틸리티 클래스를 사용하여 UI를 구성할 수 있습니다. ([`tailwind.config.js`](https://www.google.com/search?q=./tailwind.config.js), [`postcss.config.js`](https://www.google.com/search?q=./postcss.config.js), [`src/index.css`](https://www.google.com/search?q=./src/index.css) 참조)

---

**4. 환경 변수 설정:**

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 환경 변수를 설정합니다. `VITE_` 접두사를 사용하는 것이 중요합니다.

```
    # .env 파일 내용 (환경에 따라 변경될 수 있습니다)

    # 백엔드 API의 기본 URL 설정
    # 로컬 개발 환경: IDE에서 실행 중인 백엔드 서버 주소 (Nginx 프록시를 통해 접근)
    # 운영 환경: 실제 배포된 백엔드 API 도메인 (예: [https://api.ticketmon.com/api](https://api.ticketmon.com/api))
    VITE_APP_API_URL=http://localhost:8080/api

    # WebSocket 연결을 위한 URL 설정 (대기열 등 실시간 통신용)
    # 로컬 개발 환경: IDE에서 실행 중인 백엔드 WebSocket 서버 주소 (Nginx 프록시를 통해 접근)
    # 운영 환경: 실제 배포된 WebSocket 서버 도메인 (예: wss://[ws.ticketmon.com/ws/waitqueue](https://ws.ticketmon.com/ws/waitqueue))
    # 참고: ws:// 대신 wss://는 HTTPS와 마찬가지로 보안 소켓 연결을 의미합니다.
    VITE_APP_WS_URL=ws://localhost:8080/ws/waitqueue
```

- .env 파일은 .gitignore에 의해 Git 추적에서 제외되므로 절대 커밋하지 않습니다.

---

**5. 백엔드 앱 및 인프라 실행 (백엔드 레포지토리 AIBE1_FinalProject_Team03_BE 필요)**

- **백엔드 앱 (Spring Boot) 실행**: IntelliJ IDEA에서 백엔드 레포지토리(AIBE1_FinalProject_Team03_BE)를 열고 TicketmonGoApplication.java를 실행합니다. (http://localhost:8080에서 시작)

- **Docker 컨테이너 (Redis, LocalStack, Nginx) 실행**: AIBE1_FinalProject_Team03_BE 레포지토리 루트에서 다음 명령어를 실행합니다.

    ```bash
      docker-compose up --build
    ```

    - Redis, LocalStack, Nginx 컨테이너가 실행됩니다. Nginx는 `http://localhost`를 통해 프론트엔드 앱을 서빙합니다.
    - _참고: Redis는 현재 Aiven 서비스를 사용하도록 설정되어 있습니다.(팀 논의 후 결정 완료)_

---

**6. 프론트엔드 로컬 개발 서버 실행:**

이 레포지토리(AIBE1_FinalProject_Team03_FE)의 루트 디렉토리에서 다음 명령어를 실행합니다.

```bash
    npm run dev
```

- 개발 서버가 `http://localhost:5173` (기본값) 또는 다른 사용 가능한 포트에서 시작됩니다.

- 웹 브라우저로 `http://localhost` 로 접속하여 프론트엔드 앱이 Nginx를 통해 정상적으로 표시되는지 확인합니다.

<br>

### 1.3. 로컬 환경 테스트 방법 ✅

모든 앱과 컨테이너가 실행 중인 상태에서 다음을 확인하세요:

1. **웹 브라우저로 접속**: http://localhost 로 접속하여 프론트엔드 앱이 Nginx를 통해 정상적으로 표시되는지 확인합니다. (react-router-dom을 통해 페이지 전환 테스트)

2. **개발자 도구 확인 (F12)**:
    - **Network 탭**: 백엔드 API 호출(예: `/api/concerts`)이 200 OK 응답을 받는지 확인합니다.
    - **WebSocket 연결**: Network 탭의 WS 필터에서 `ws://localhost:8080/ws/waitqueue` WebSocket 연결 상태를 확인합니다. (현재 백엔드 대기열 진입 API 이슈로 연결 실패가 정상일 수 있습니다. 백엔드 팀과 확인 필요)
    - **Console 탭**: CORS 관련 오류나 기타 JavaScript 오류가 없는지 확인합니다.

3. **백엔드 API 직접 테스트 (Swagger UI)**: `http://localhost:8080/swagger-ui.html` 로 접속하여 백엔드 API가 정상 작동하는지 확인합니다. (로그인된 상태여야 인증이 적용된 API 접근 가능)

<br>

## ✨ 2. 주요 기능 및 사용법

### 2.1. 사용자 기능

- **회원가입 및 로그인**: 사용자 계정을 생성하고 로그인하여 서비스를 이용합니다.

- **콘서트 탐색**: 다양한 콘서트 정보를 검색하고 상세 내용을 확인합니다.

- **콘서트 예약**: 원하는 콘서트의 좌석을 선택하고 예약합니다.

- **마이페이지**: 개인 프로필 정보를 확인하고 수정하며, 예매 내역을 조회합니다.

### 2.2. 판매자 기능 (Seller Page)

판매자 페이지는 판매자 권한 신청 및 콘서트 등록/관리를 위한 전용 영역입니다.

- **접근 방법**:
    - 로그인 후, 헤더의 `판매자 페이지` 링크 를 클릭하여 접근할 수 있습니다.

    - 또는 브라우저에서 `http://localhost:5173/seller` 경로로 직접 접근할 수 있습니다.

- **페이지 구성**:
    - `SellerLayout.jsx` 컴포넌트를 통해 사이드바(`SellerSidebar.jsx`)와 메인 콘텐츠 영역으로 구성됩니다.

    - **사이드바 탭**:
        - **홈 (판매자 대시보드)**: 판매자 페이지의 기본 화면으로, 콘서트 및 신청 상태를 관리할 수 있는 대시보드(추후 구현)입니다. (`SellerHomePage.jsx` 내용) 모든 로그인 유저 접근 가능.

        - **판매자 권한 신청**: 일반 사용자(`ROLE_USER`)가 판매자 권한을 신청할 수 있는 페이지입니다. (판매자 권한이 없는 로그인 유저에게만 표시)

        - **판매자 권한 상태**: 현재 사용자의 판매자 권한 상태를 확인할 수 있는 페이지입니다. (모든 로그인 유저 접근 가능)

        - **콘서트 관리** (토글 메뉴): 판매자(`ROLE_SELLER`)에게만 표시되는 메뉴로, 하위 메뉴를 포함합니다.
            - `콘서트 등록`: 새로운 콘서트 정보를 등록하는 페이지입니다.

            - `콘서트 관리`: 등록된 콘서트 목록을 확인하고 수정/삭제 등 관리하는 페이지입니다.

- **역할 기반 접근 제어**:
    - `AuthContext` 를 통해 사용자 `user.role` (예: `ROLE_USER`, `ROLE_SELLER`, `ROLE_ADMIN`)에 따라 사이드바 메뉴 및 특정 페이지 접근이 제어됩니다.

    - 헤더의 `Admin Dashboard` 링크는 `ROLE_ADMIN` 인 사용자에게만 표시됩니다.

    - `Profile` 링크는 왼쪽 메인 내비게이션에 위치합니다.

### 2.3. 관리자 기능 (Admin Dashboard)

관리자 권한(`ROLE_ADMIN`)을 가진 사용자만 접근할 수 있는 대시보드입니다.

- **접근 방법**: 로그인 후 헤더의 `Admin Dashboard` 링크를 클릭하여 접근합니다.

[//]: # '- **주요 기능**: (백엔드 및 다른 팀원 작업에 따라 구체화 필요)'
[//]: # '  - 시스템 상태 모니터링 (`SystemStatus.jsx`)'
[//]: # '  - 좌석 캐시 관리 (`SeatManagement.jsx`)'
[//]: # '  - 콘서트 관리 (승인/거부 등) (`ConcertManagement.jsx`)'
[//]: # '  - AI 요약 수동 재생성 (`adminService.js`) 등'
[//]: # '## 🛠️ 2. 기술 스택 및 주요 도구'
[//]: #
[//]: # '- 프레임워크: React (v19.x)'
[//]: # '- 번들러/빌드 도구: Vite (v6.x)'
[//]: # '  - Vite는 React 코드 자체의 작성 방식에는 영향을 주지 않고, 더 빠르고 효율적인 개발 환경 및 빌드를 제공합니다. React 코드 구현에 집중하시면 됩니다.'
[//]: # '- 패키지 관리자: npm'
[//]: # '- 클라이언트 측 HTTP 통신: axios (API 연동 편의성 증대)'
[//]: # '- 클라이언트 측 라우팅: react-router-dom (SPA 페이지 전환 관리)'
[//]: # '- 코드 품질 도구: ESLint'
[//]: # '- 스타일링: Tailwind CSS (v3), CSS Modules (또는 일반 CSS)'

<br>

## 📦 3. 프로젝트 구조 (최신 개편 반영)

- `src/shared/components/layout/SellerLayout.jsx`: 판매자 페이지의 공통 레이아웃(사이드바 포함)을 정의합니다.

- `src/features/seller/components/SellerSidebar.jsx`: 판매자 페이지 사이드바 메뉴를 정의하며, `public` 폴더의 SVG 아이콘 을 `<img>` 태그로 사용합니다.

- `src/pages/seller/SellerHomePage.jsx`: 판매자 페이지의 기본 대시보드 콘텐츠를 정의합니다. (Stitch AI 디자인 메인 화면)

- `src/pages/seller/SellerStatusPage.jsx`: 판매자 권한 상태를 보여주는 페이지입니다. (`src/pages/admin`에서 `src/pages/seller` 로 이동됨)

- `src/App.jsx`: 애플리케이션의 메인 라우팅을 정의하며, `SellerLayout.jsx` 를 활용하여 판매자 페이지 그룹을 구성합니다.

- `src/shared/components/layout/Header.jsx`: 전역 헤더 컴포넌트로, 역할에 따른 링크 (`Profile`, `Admin Dashboard`, `판매자 페이지`)의 위치와 표시 여부를 제어합니다.

- `src/context/AuthContext.jsx`: 사용자 인증 및 권한(`role`, `roles`) 정보를 전역으로 관리하며, `ROLE_` 접두사를 포함한 역할을 정확히 판단합니다.

(`src/features`, `src/shared` 등 나머지 폴더 구조는 [❗[프론트엔드 폴더 구조 & 개발 가이드 문서 보러가기]](./ARCHITECTURE_GUIDE.md) 에 상세히 설명되어 있습니다.)

<br>

## 🔄 4. 브랜치 전략 및 Git Workflow

- 기본 브랜치: `main`

- 개발 브랜치: `dev`

- 기능 개발 브랜치: `feat/[기능_이름]`

- Git Workflow: (자세한 내용은 [❗[프론트엔드 폴더 구조 & 개발 가이드 문서 보러가기]](./ARCHITECTURE_GUIDE.md) 참고)
    1. `dev` 브랜치에서 최신 변경 사항을 풀(pull) 받습니다.

    2. 새로운 기능 개발을 위해 `feat/[기능_이름]` 브랜치를 생성하고 전환합니다.

    3. 코드 변경 후 로컬에서 충분히 테스트합니다.

    4. 변경 사항을 커밋합니다. (커밋 메시지 가이드를 따릅니다.)

    5. 작업한 브랜치를 원격(remote)에 푸시합니다.

    6. `feat/[기능_이름]` 브랜치에서 `dev` 브랜치로 Pull Request (PR)를 생성합니다.

    7. 코드 리뷰를 거쳐 PR이 승인되면 `dev` 브랜치에 병합됩니다.

<br>

## 📚 5. 기존 테스트 코드 이관 안내 (추후 진행 예정)

- 현재 백엔드 레포지토리에는 프론트엔드 동작 확인을 위한 테스트 코드들이 남아있습니다.
- 이 코드들은 향후 프론트엔드 레포지토리로 이관할 예정입니다.
- 이전된 후에는 이 README.md를 통해 해당 코드들의 위치 및 활용 방안을 안내해 드리겠습니다.

<br>

## ⚠️ 6. 중요한 참고 사항 (인증 및 배포 전략)

**백엔드 API 인증(로그인/JWT) 관련**:

- 백엔드 SecurityConfig에 `anyRequest().authenticated()` 등 실질적인 접근 권한 규칙이 적용되었습니다.
- API 호출 시 유효한 JWT 토큰이 필요합니다.
- 로컬 테스트 시: 로그인 후, 브라우저가 자동으로 보내는 쿠키를 통해 인증을 수행할 수 있습니다. Swagger UI를 통한 테스트도 이 방식으로 진행하면 됩니다.

**프론트엔드 배포 전략 (AWS 비용 최소화)**:

- CI/CD 단계에서 Vite로 빌드된 프론트엔드 정적 파일은 AWS S3에 직접 배포되지 않고, GitHub Actions의 '아티팩트'로만 저장됩니다. 이는 AWS 비용 발생을 AWS 마이그레이션 시점까지 최소화하기 위함입니다.

- 로컬 개발 환경에서는 `docker-compose.yml`에 추가된 Nginx 컨테이너가 프론트엔드의 `dist` 폴더를 서빙하게 됩니다.

- 실제 AWS로 마이그레이션할 때 GitHub Actions를 통해 AWS S3와 CloudFront로 자동 배포가 이루어질 것입니다.
