# 📢 프론트엔드 폴더 구조 개편 및 인증 모듈 통합 완료 공지 (v.2.)

_(2025-07-01 업데이트)_

---

> 프론트엔드 프로젝트의 대규모 폴더 구조 개편 및 인증 모듈 통합 작업이 성공적으로 완료되어 `dev` 브랜치에 머지되었습니다! 🎉 <br><br>
> 지난 작업은 프로젝트의 **유지보수성, 확장성, 그리고 코드 응집력을 크게 향상**시키는 것을 목표로 진행되었으며,<br>
> 현재는 **로그인, 콘서트, 판매자 페이지 등의 기능 구현 및 새로운 레이아웃이 도입**되었습니다.

---

## 🛠️ 1. 주요 변경 사항 요약:

- **`Feature Slices` 패턴 도입**: `src/features` 디렉토리를 통해 기능(도메인)별로 관련된 모든 코드(컴포넌트, 훅, 서비스, 타입 등)를 한곳에 모았습니다.
    - **새로운 `seller` 도메인 추가**: `src/features/seller` 디렉토리가 추가되었으며, 판매자 관련 모든 컴포넌트 (`SellerSidebar.jsx`), 페이지 (`SellerHomePage.jsx`, `SellerApplyPage.jsx`, `SellerStatusPage.jsx` (이동됨), `ConcertRegisterPage.jsx`, `SellerConcertManagementPage.jsx`), 훅, 서비스 등이 이 기능 단위 안에 응집되어 관리됩니다.
- **`src/shared` 디렉토리 재정의**: 공통적으로 사용되는 유틸리티, UI 컴포넌트 등을 명확히 분리하여 재사용성을 높였습니다.
    - **`SellerLayout.jsx` 도입**: `src/shared/components/layout/SellerLayout.jsx` 가 추가되었으며, 판매자 페이지 전체에 적용되는 고유한 레이아웃(사이드바 포함)을 제공합니다. 이제 모든 판매자 관련 페이지는 `SellerLayout` 을 통해 렌더링됩니다.
- **인증 모듈 통합**:
    - 기존 `src/services/auth.js`의 모든 인증 관련 기능이 `src/features/auth/services/authService.js`로 완전히 통합되었으며, **`apiClient` 사용 표준**을 따르도록 재정비되었습니다. (기존 `src/services/auth.js`는 삭제됨)
    - `AuthContext.jsx` 및 관련 파일들(`Header.jsx`, `SellerSidebar.jsx`, `SellerHomePage.jsx`, `SellerStatusPage.jsx` 등)에서 사용자 역할(`user.role` 또는 `user.roles`)을 판단할 때, 백엔드에서 넘어오는 `ROLE_USER`, `ROLE_SELLER`, `ROLE_ADMIN` 과 같은 `ROLE_` 접두사를 포함하는 형식으로 처리하도록 표준화되었습니다.
- **전반적인 설정 및 라우팅 업데이트**: `package.json`, `App.jsx` 라우팅 등 프로젝트 전반의 파일들이 새로운 구조에 맞춰 최신화되었습니다.

<br>

---

## 📚 2. 새 폴더 구조 사용 가이드 및 개발 유의사항

> **지난 폴더 구조 개편은 팀원들이 더 쉽게 협업하고, 코드를 찾고, 새로운 기능을 추가할 수 있도록 돕기 위함이었습니다. 아래 가이드라인을 참고하여 개발을 진행해주세요!**

### 2.1. 전체 폴더 구조 개요

프로젝트의 최신 폴더 구조는 다음과 같습니다.

```
.
├── public/               # 빌드 시 그대로 복사될 정적 파일 (파비콘, robots.txt, SVG 아이콘 등)
│   └── vite.svg          # Vite 로고 이미지 (예시)
│   └── vector-00.svg     # 판매자 페이지 아이콘 등 (추가된 SVG 파일)
│   └── vector-01.svg     # (기타 추가된 SVG 아이콘)
│   └── vector-02.svg
│   └── vector-03.svg
│   └── vector-04.svg
├── src/                  # 애플리케이션의 모든 원본 소스 코드
│   ├── assets/           # 이미지, 아이콘 등 정적 자원 (import를 통해 사용)
│   │   └── react.svg     # React 로고 이미지 (예시)
│   ├── context/          # React Context API를 사용하여 전역 상태를 관리하는 파일
│   │   ├── AuthContext.jsx
│   │   └── BookingProcessContext.jsx
│   ├── features/         # 도메인 또는 기능별로 관련된 모든 코드를 모아둔 폴더 (Feature Slices)
│   │   ├── admin/        # 관리자 기능
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── auth/         # 인증 기능
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── booking/      # 예매 기능
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── concert/      # 콘서트 관련 기능
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── seller/       # 판매자 관련 기능 (새로 추가된 도메인)
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   └── user/         # 사용자 관련 기능
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       └── types/
│   ├── pages/            # 각 라우트(경로)에 매핑될 최상위 페이지 컴포넌트들을 모아두는 폴더
│   │   ├── admin/        # 관리자 페이지 (일부 페이지는 seller로 이동)
│   │   │   ├── ConcertManagement.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SeatManagement.jsx
│   │   │   └── SystemStatus.jsx
│   │   ├── auth/         # 인증 관련 페이지
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── SocialCallback.jsx
│   │   ├── booking/      # 예매 관련 페이지
│   │   │   ├── Payment.jsx
│   │   │   └── SeatSelectionPage.jsx
│   │   ├── concert/      # 콘서트 관련 페이지
│   │   │   ├── ConcertDetailPage.jsx
│   │   │   └── ConcertListPage.jsx
│   │   ├── home/         # 홈 페이지
│   │   │   └── Home.jsx
│   │   ├── mypage/       # 마이페이지
│   │   │   ├── BookingHistory.jsx
│   │   │   ├── PaymentHistory.jsx
│   │   │   └── Profile.jsx
│   │   └── seller/       # 판매자 페이지 (신규 추가)
│   │       ├── SellerHomePage.jsx
│   │       ├── SellerApplyPage.jsx
│   │       ├── SellerConcertManagementPage.jsx
│   │       ├── ConcertRegisterPage.jsx
│   │       └── SellerStatusPage.jsx # src/pages/admin 에서 이동
│   │
│   └── NotFoundPage.jsx  # 404 에러 페이지
│   ├── services/         # (기존) 애플리케이션 전반에 걸쳐 사용되는 공통 서비스 정의 (API 클라이언트 설정 등) -> features로 대부분 이동됨
│   │   ├── api.js
│   │   └── config.js
│   ├── shared/           # 여러 도메인/기능에서 공통으로 사용되는 유틸리티, UI 컴포넌트, 훅, 스토어 등
│   │   ├── components/
│   │   │   ├── layout/   # 공통 레이아웃 (헤더, 푸터, 사이드바, 판매자 레이아웃 등)
│   │   │   ├── ui/       # 범용 UI 요소 (버튼, 입력 필드 등)
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── types/
│   │   └── utils/
│   ├── styles/           # 전역 및 공통 스타일 파일
│   │   ├── components.css
│   │   ├── globals.css
│   │   └── variables.css
│   ├── App.css           # 메인 앱 컴포넌트의 스타일 정의
│   ├── App.jsx           # 애플리케이션의 메인 컴포넌트 (라우팅 정의, 주요 레이아웃 구성)
│   ├── index.css         # 전역 스타일 정의 (기본 HTML 요소 스타일링, reset CSS 등)
│   └── main.jsx          # React 앱의 진입점 (ReactDOM 렌더링 시작, BrowserRouter 설정)
├── .env                  # 환경 변수 파일 (API URL, WS URL 등. Git 추적 제외)
├── .gitignore            # Git 추적 제외 파일 목록 (빌드 결과물, 환경 변수 등)
├── eslint.config.js      # ESLint 설정 파일 (코드 품질 및 스타일 가이드라인)
├── index.html            # 웹 페이지의 기본 HTML 파일 (React 앱이 마운트될 root 요소 포함)
├── package.json          # 프로젝트 정보 및 의존성 관리 (설치된 라이브러리 목록)
├── package-lock.json     # 설치된 패키지의 정확한 버전 및 종속성 트리 정보
├── README.md             # 현재 이 문서 (프로젝트 설명, 개발 가이드)
├── postcss.config.js     # PostCSS 설정 파일 (Tailwind CSS 통합)
├── tailwind.config.js    # Tailwind CSS 설정 파일
└── vite.config.js        # Vite 설정 파일 (빌드 옵션, 개발 서버 설정 등)
```

<br>

### 2.2. `src` 디렉토리의 역할 및 파일 생성 규칙

> **`src` 폴더는 모든 원본 소스 코드가 위치하는 곳입니다.**

- **`src/pages/`**:
    - **역할**: 각 라우트(URL 경로)에 직접 매핑되는 최상위 컴포넌트(페이지)들을 모아둡니다.
    - **파일 생성**: `pages/[도메인명]/[페이지명].jsx` 형태로 생성합니다.
        - 예: `src/pages/auth/Login.jsx`, `src/pages/concert/ConcertList.jsx`
        - **(예시)판매자 페이지 관련**: `src/pages/seller/` 아래에 `SellerHomePage.jsx` (판매자 대시보드 홈), `SellerApplyPage.jsx` (판매자 권한 신청), `SellerStatusPage.jsx` (판매자 권한 상태), `ConcertRegisterPage.jsx` (콘서트 등록), `SellerConcertManagementPage.jsx` (콘서트 관리) 등이 포함됩니다.
    - **유의사항**: 페이지 컴포넌트 자체는 가급적 UI 로직(데이터 페칭, 상태 관리)을 직접 구현하기보다, `features` 폴더의 하위 컴포넌트나 훅을 조합하여 페이지를 구성하는 역할을 합니다.

<br>

- **`src/features/[도메인명]/`**: (예: `auth`, `concert`, `user`, `admin`, `booking`, `seller`)
    - **역할**: 특정 도메인(기능)과 관련된 모든 코드(컴포넌트, 훅, 서비스, 타입 정의)를 응집시켜 관리합니다. 이 폴더는 해당 기능의 '작은 애플리케이션'이라고 생각할 수 있습니다.
    - **내부 구조**: 각 `features` 폴더 안에는 다음과 같은 하위 디렉토리를 포함할 수 있습니다.
        - `components/`: 해당 도메인에서만 사용되는 UI 컴포넌트. (예: `src/features/seller/components/SellerSidebar.jsx`)
        - `hooks/`: 해당 도메인에 특화된 커스텀 훅 (예: `useConcertData.js`, `useLogin.js`).
        - `services/`: 해당 도메인과 관련된 API 통신 로직을 정의한 파일 (예: `concertService.js`, `authService.js`). **여기에 `apiClient`를 임포트하여 사용합니다.**
        - `types/`: 해당 도메인에 특화된 데이터 타입 정의.
    - **유의사항**: 새로운 기능을 개발할 때는 해당 기능이 속하는 도메인(`features/[도메인명]`) 아래에 파일을 생성하는 것을 최우선으로 고려해주세요.

<br>

- **`src/shared/`**:
    - **역할**: 프로젝트의 여러 도메인(`features`)에서 **공통적으로 재사용**되는 유틸리티, UI 컴포넌트, 훅, 전역 스토어 등을 모아둡니다.
    - **내부 구조**:
        - `components/layout/`: 앱 전체에 적용되는 공통 레이아웃 컴포넌트 (예: `Header`, `Footer`, `MainLayout`, `SellerLayout.jsx`).
        - `components/ui/`: 범용적으로 재사용 가능한 UI 요소 (예: `Button`, `InputField`, `Modal`).
        - `hooks/`: 여러 도메인에서 재사용될 수 있는 범용 커스텀 훅 (예: `useLocalStorage.js`, `useDebounce.js`).
        - `stores/`: Zustand와 같은 전역 상태 관리 스토어 (예: `authStore.js`, `cartStore.js`).
        - `types/`: 앱 전체에서 사용되는 공통 타입 정의.
        - `utils/`: 범용 유틸리티 함수 (예: `apiClient.js`, `validation.js`, `helpers.js`).
    - **유의사항**: `shared` 폴더의 코드는 어떤 `features` 폴더에도 의존해서는 안 됩니다. 즉, `shared`는 `features`에 있는 파일을 임포트할 수 없습니다.

<br>

- **`src/context/`**:
    - **역할**: React Context API를 사용하여 전역 상태를 관리하는 Provider 컴포넌트들을 모아둡니다.
    - **파일 생성**: `[Context명]Context.jsx` 형태로 생성합니다.
        - 예: `src/context/AuthContext.jsx`

<br>

- **`src/assets/`**:
    - **역할**: 이미지, 아이콘, 폰트 등 정적 자원들을 모아둡니다.
    - **유의사항**: CSS 파일에서 `url()`로 직접 참조하거나, JS/JSX 파일에서 `import`하여 사용합니다. `public` 폴더에 직접적으로 배포되는 `vector-xx.svg` 같은 아이콘들도 이와 관련된 정적 자원으로 관리됩니다.

<br>

- **`src/styles/`**:
    - **역할**: 전역 및 공통 스타일 파일들을 모아둡니다.
    - **내부 구조**: `variables.css` (CSS 변수), `globals.css` (전역 CSS), `components.css` (공통 컴포넌트 스타일).
    - **유의사항**: Tailwind CSS를 주력으로 사용하므로, 여기에 너무 많은 커스텀 CSS를 추가하기보다 Tailwind 유틸리티 클래스 활용을 우선합니다.

<br>

### 2.3. `apiClient` 사용 표준 및 개발 가이드

> 프로젝트 전반의 **API 통신 일관성과 효율성을 위해 `src/shared/utils/apiClient.js`를 통한 API 호출 표준을 확립했습니다.** 앞으로 모든 API 요청은 이 `apiClient` 인스턴스를 사용하는 것을 원칙으로 합니다.

- **`apiClient`의 역할:**
    - **기본 URL 관리**: `VITE_APP_API_URL` 환경 변수를 통해 백엔드 API의 기본 URL을 중앙에서 관리합니다.
    - **자격 증명(Credential) 포함**: `withCredentials: true` 설정으로 모든 요청에 쿠키/세션(JWT 포함)이 자동으로 포함되어 인증 처리가 용이합니다.
    - **공통 헤더**: `Content-Type: application/json`과 같은 공통 헤더가 기본으로 설정됩니다.
    - **요청/응답 인터셉터**: 요청 전 토큰 삽입, 응답 에러 처리(예: 401/403 응답 시 로그인 페이지 리다이렉트), 성공 응답(`success` 필드 확인) 등의 로직을 중앙에서 관리합니다.

<br>

- **개발 시 참고 사항:**
    - **직접 `axios.create()`를 호출하거나 `fetch` API를 사용하지 마세요.** 모든 API 요청은 `src/shared/utils/apiClient.js`를 임포트하여 사용해야 합니다.
    - **API 서비스 파일 구조**: 각 `features/[도메인명]/services` 디렉토리 내에서 `apiClient`를 임포트하여 해당 도메인에 특화된 API 호출 함수들을 정의합니다.

        ```javascript
        // 예시: src/features/concert/services/concertService.js
        import apiClient from '../../../shared/utils/apiClient'; // shared/utils/apiClient 경로에 유의

        export const fetchConcerts = async () => {
            try {
                const response = await apiClient.get('/concerts'); // apiClient 사용
                return response.data.data; // SuccessResponse 구조에 따라
            } catch (error) {
                console.error('Failed to fetch concerts:', error);
                throw error;
            }
        };
        ```

    - **에러 처리**: `apiClient`의 응답 인터셉터에서 공통 에러 처리가 이루어지므로, 각 API 호출 함수에서는 필요한 경우에만 추가적인 에러 핸들링을 구현합니다.

<br>

---

## 3. 코딩 컨벤션 및 스타일 가이드

- **파일 및 컴포넌트명**:
    - React 컴포넌트 파일은 `PascalCase`로 작성하고 `.jsx` 확장자를 사용합니다. (예: `Login.jsx`, `ConcertCard.jsx`)
    - 훅 파일은 `use` 접두사를 사용하고 `camelCase`로 작성합니다. (예: `useLogin.js`, `useConcertData.js`)
    - 서비스, 유틸리티 파일은 `camelCase`로 작성합니다. (예: `authService.js`, `validation.js`)
- **컴포넌트 구조**:
    - 함수형 컴포넌트와 React Hooks를 사용합니다.
    - 컴포넌트 내에서 복잡한 로직은 커스텀 훅으로 분리하는 것을 권장합니다.
- **ESLint & Prettier**: 프로젝트에 ESLint와 Prettier가 설정되어 있어 코드 품질과 일관된 스타일을 유지합니다. 코드 커밋 전 `npm run lint:fix` 명령어를 실행하여 자동으로 포맷팅 오류를 수정하는 것을 권장합니다.
- **빈 파일 및 플레이스홀더**: 현재 비어있는 파일들은 향후 구현될 기능이나 특정 목적을 위한 플레이스홀더입니다. `// TODO: [구현 내용]`과 같은 주석을 파일 상단에 추가하여 해당 파일의 목적을 명확히 하고, 향후 개발 시 참고하도록 합니다.

<br>

---

## ⚠️ 4. 중요한 참고 사항 (인증 및 배포 전략)

- **백엔드 API 인증(로그인/JWT) 관련**:
    - 백엔드 `SecurityConfig`에 `anyRequest().authenticated()` 등 실질적인 접근 권한 규칙이 적용되었습니다.
    - API 호출 시 유효한 JWT 토큰이 필요합니다.
    - 로컬 테스트 시: 로그인 후, 브라우저가 자동으로 보내는 쿠키를 통해 인증을 수행할 수 있습니다. Swagger UI를 통한 테스트도 이 방식으로 진행하면 됩니다.
- **프론트엔드 배포 전략 (AWS 비용 최소화)**:
    - CI/CD 단계에서 Vite로 빌드된 프론트엔드 정적 파일은 AWS S3에 직접 배포되지 않고, GitHub Actions의 '아티팩트'로만 저장됩니다. 이는 AWS 비용 발생을 AWS 마이그레이션 시점까지 최소화하기 위함입니다.
    - 로컬 개발 환경에서는 `docker-compose.yml`에 추가된 Nginx 컨테이너가 프론트엔드의 `dist` 폴더를 서빙하게 됩니다.
    - 실제 AWS로 마이그레이션할 때 GitHub Actions를 통해 AWS S3와 CloudFront로 자동 배포가 이루어질 것입니다.

<br>

---

## 🔄 5. 브랜치 전략 및 Git Workflow

- 기본 브랜치: `main`
- 개발 브랜치: `dev`
- 기능 개발 브랜치: `feat/[기능_이름]`
- Git Workflow:
    1.  `dev` 브랜치에서 최신 변경 사항을 풀(pull) 받습니다.
        ```bash
            git checkout dev
            git pull origin dev
        ```
    2.  새로운 기능 개발을 위해 `feat/[기능_이름]` 브랜치를 생성하고 전환합니다.
        ```bash
            git checkout -b feat/[기능_이름]
        ```
    3.  코드 변경 후 로컬에서 충분히 테스트합니다.
    4.  변경 사항을 커밋합니다. (커밋 메시지 가이드를 따릅니다.)
        ```bash
            git add .
            git commit -m "feat: [기능 요약]"
        ```
    5.  작업한 브랜치를 원격(remote)에 푸시합니다.
        ```bash
            git push origin feat/[기능_이름]`
        ```
    6.  `feat/[기능_이름]` 브랜치에서 `dev` 브랜치로 Pull Request (PR)를 생성합니다.
    7.  코드 리뷰를 거쳐 PR이 승인되면 `dev` 브랜치에 병합됩니다.

<br>

---

## ⚠️ 6. 필수 조치 사항:

1. **최신 `dev` 브랜치 풀(pull) 또는 리베이스(rebase) 하기**

    ```bash
      git pull origin dev
      # 또는 현재 작업 브랜치에서: git pull origin dev --rebase
    ```

2. **`npm install` 실행하기**
    - `package.json` 변경사항(특히 `lucide-react` 추가)이 반영되도록 반드시 **`npm install`** 명령어를 한 번 더 실행해 주시기 바랍니다.

<br>

### 📚 상세 내용은 PR 메시지 및 `README.md` 참고:

- **머지된 PR 메시지**: 상세한 변경 내용을 확인할 수 있습니다.
- **업데이트된 `README.md` 파일**: 새로운 폴더 구조 등이 최신 정보로 업데이트되었으니 확인해 주세요.

<br>

---

> [❗[메인으로 돌아가기]](./README.md)
