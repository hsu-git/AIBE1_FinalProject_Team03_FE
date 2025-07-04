// 루트 컴포넌트

// 애플리케이션의 주요 라우팅 규칙을 정의
import React, { useContext } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'; // Outlet 임포트 확인

// 레이아웃
import MainLayout from './shared/components/layout/MainLayout';
import AuthLayout from './shared/components/layout/AuthLayout';
import PublicLayout from './shared/components/layout/PublicLayout.jsx';
import SellerLayout from './shared/components/layout/SellerLayout';
import AdminLayout from './shared/components/layout/AdminLayout';

// Auth Context
import { AuthContext } from './context/AuthContext';

// 홈페이지 & 인증 페이지
import HomePage from './pages/home/Home.jsx';
import LoginPage from './pages/auth/Login.jsx';
import RegisterPage from './pages/auth/Register.jsx';
import ProfilePage from './pages/mypage/Profile.jsx';
import BookingDetailPage from './pages/mypage/BookingDetail.jsx';

// 콘서트 페이지
import ConcertListPage from './pages/concert/ConcertListPage.jsx';
import ConcertDetailPage from './pages/concert/ConcertDetailPage.jsx';

// 예매 페이지
import WaitingPage from './pages/booking/WaitingPage.jsx';
import SeatSelectionPage from './pages/booking/SeatSelectionPage.jsx';

//결제결과 페이지
import { PaymentRoutes } from './features/payment/RoutePayment.jsx';

// 판매자 페이지 (새로 만들거나 기존 페이지 재활용)
import SellerHomePage from './pages/seller/SellerHomePage.jsx'; // 판매자 홈 페이지
import SellerStatusPage from './pages/seller/SellerStatusPage.jsx'; // 판매자 상태 페이지
import SellerApplyPage from './pages/seller/SellerApplyPage.jsx'; // 판매자 권한 신청 페이지
import ConcertRegisterPage from './pages/seller/ConcertRegisterPage.jsx'; // 콘서트 등록 페이지
import SellerConcertManagementPage from './pages/seller/SellerConcertManagementPage.jsx'; // 판매자 콘서트

// 관리자 페이지
import AdminDashboard from './pages/admin/Dashboard';
import AdminSellerManagement from './pages/admin/AdminSellerManagement';

import NotFoundPage from './pages/NotFoundPage.jsx';
import UnauthorizedAccessPage from './pages/UnauthorizedAccessPage';

// App 컴포넌트: 라우팅 정의 및 네비게이션 제공
export default function App() {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div className="text-center py-20">로딩 중…</div>;
    }

    // 역할 확인 헬퍼 변수
    // user.role은 단일 문자열, user.roles는 배열일 수 있으므로 두 경우 모두 처리
    const isAdmin =
        user &&
        (user.role === 'ROLE_ADMIN' ||
            (user.roles && user.roles.includes('ROLE_ADMIN')));
    const isSeller =
        user &&
        (user.role === 'ROLE_SELLER' ||
            (user.roles && user.roles.includes('ROLE_SELLER')));
    const isLoggedIn = !!user;

    return (
        <Routes>
            {/** — 인증 전용 — **/}
            <Route element={<AuthLayout />}>
                <Route
                    path="/login"
                    element={user ? <Navigate to="/" replace /> : <LoginPage />}
                />
                <Route
                    path="/register"
                    element={
                        user ? <Navigate to="/" replace /> : <RegisterPage />
                    }
                />
            </Route>

            {/** — 공개 페이지 — **/}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="concerts" element={<ConcertListPage />} />
                {PaymentRoutes()}
                <Route
                    path="concerts/:concertId"
                    element={<ConcertDetailPage />}
                />
            </Route>

            {/** — 로그인 후 보호된 페이지 — **/}
            <Route element={<MainLayout />}>
                <Route
                    path="concerts/:concertId/wait" // 새로운 경로 추가
                    element={
                        user ? (
                            <WaitingPage />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
                <Route
                    path="concerts/:concertId/reserve"
                    element={
                        user ? (
                            <SeatSelectionPage />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* 프로필 페이지 라우트는 판매자 라우트 그룹 밖에 따로 위치 */}
                <Route
                    path="/mypage/profile"
                    element={
                        user ? (
                            <ProfilePage />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
                <Route
                    path="/bookingDetail/:bookingNumber"
                    element={
                        user ? (
                            <BookingDetailPage />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* 판매자 페이지 그룹 라우트: SellerLayout을 사용하여 사이드바를 포함 */}
                <Route
                    path="/seller"
                    element={
                        // 비로그인 상태이거나 관리자(ROLE_ADMIN)인 경우 UnauthorizedAccessPage로 리다이렉트
                        // 관리자는 판매자 페이지에 접근 불가
                        !isLoggedIn || isAdmin ? (
                            <Navigate to="/unauthorized" replace />
                        ) : (
                            <SellerLayout />
                        )
                    }
                >
                    {/* /seller 기본 경로: SellerHomePage (판매자 대시보드)로 연결 */}
                    <Route index element={<SellerHomePage />} />
                    {/* 판매자 권한 신청 페이지 (접근 로직은 SellerApplyPage 내부에서 처리) */}
                    <Route path="apply" element={<SellerApplyPage />} />
                    {/* 판매자 권한 상태 페이지 (모든 로그인 유저 접근 가능) */}
                    <Route path="status" element={<SellerStatusPage />} />
                    {/* 판매자 권한이 있는 경우에만 접근 가능한 페이지들 */}
                    <Route
                        element={
                            isSeller ? (
                                <Outlet /> // 판매자 권한이 있다면 하위 라우트들을 Outlet에 렌더링
                            ) : (
                                // 판매자 권한이 없는 로그인 유저 (일반 유저)가 콘서트 관리 탭에 접근 시 UnauthorizedAccessPage로 리다이렉트
                                <Navigate to="/unauthorized" replace />
                            )
                        }
                    >
                        <Route
                            path="concerts/register"
                            element={<ConcertRegisterPage />}
                        />
                        <Route
                            path="concerts/manage"
                            element={<SellerConcertManagementPage />}
                        />
                    </Route>
                </Route>

                {/* 관리자 페이지 그룹 라우트: AdminLayout을 사용하여 사이드바를 포함 */}
                <Route
                    path="/admin"
                    element={
                        // 관리자가 아니거나 비로그인 상태일 경우 UnauthorizedAccessPage로 리다이렉트
                        !isLoggedIn || !isAdmin ? (
                            <Navigate to="/unauthorized" replace />
                        ) : (
                            <AdminLayout />
                        )
                    }
                >
                    <Route index element={<AdminDashboard />} />
                    {/* 판매자 권한 관리 페이지 라우트 추가 */}
                    <Route
                        path="seller-management"
                        element={<AdminSellerManagement />}
                    />
                </Route>
            </Route>

            {/** — 권한 없음 페이지 — **/}
            <Route path="/unauthorized" element={<UnauthorizedAccessPage />} />

            {/** — 404 처리 — **/}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
