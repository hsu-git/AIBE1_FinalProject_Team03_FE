// 루트 컴포넌트

// 애플리케이션의 주요 라우팅 규칙을 정의
import React, { useContext } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'; // Outlet 임포트 확인

// 레이아웃
import MainLayout from './shared/components/layout/MainLayout';
import AuthLayout from './shared/components/layout/AuthLayout';
import PublicLayout from './shared/components/layout/PublicLayout.jsx';
import SellerLayout from './shared/components/layout/SellerLayout';

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

// 판매자 페이지 (새로 만들거나 기존 페이지 재활용)
import SellerHomePage from './pages/seller/SellerHomePage.jsx'; // 판매자 홈 페이지
import SellerStatusPage from './pages/seller/SellerStatusPage.jsx'; // 판매자 상태 페이지
import SellerApplyPage from './pages/seller/SellerApplyPage.jsx'; // 판매자 권한 신청 페이지
import ConcertRegisterPage from './pages/seller/ConcertRegisterPage.jsx'; // 콘서트 등록 페이지
import SellerConcertManagementPage from './pages/seller/SellerConcertManagementPage.jsx'; // 판매자 콘서트

import NotFoundPage from './pages/NotFoundPage.jsx';

// App 컴포넌트: 라우팅 정의 및 네비게이션 제공
export default function App() {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div className="text-center py-20">로딩 중…</div>;
    }

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

                {/* 프로필 페이지 라우트는 이제 판매자 라우트 그룹 밖에 따로 둡니다. */}
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

                {/* 판매자 페이지 그룹 라우트: SellerLayout을 사용하여 사이드바를 포함시킵니다. */}
                <Route
                    path="/seller"
                    element={
                        user ? (
                            <SellerLayout />
                        ) : (
                            <Navigate to="/login" replace />
                        ) // 로그인하면 SellerLayout 렌더링
                    }
                >
                    {/* /seller 기본 경로: SellerHomePage (판매자 대시보드)로 연결 */}
                    <Route index element={<SellerHomePage />} />
                    {/* 판매자 권한 신청 페이지 (모든 로그인 유저 접근 가능) */}
                    <Route path="apply" element={<SellerApplyPage />} />
                    {/* 판매자 권한 상태 페이지 (모든 로그인 유저 접근 가능하도록 이동) */}
                    <Route path="status" element={<SellerStatusPage />} />
                    {/* 판매자 권한이 있는 경우에만 접근 가능한 페이지들 */}
                    <Route
                        element={
                            user &&
                            (user.role === 'ROLE_SELLER' ||
                                (user.roles &&
                                    user.roles.includes('ROLE_SELLER'))) ? (
                                <Outlet /> // 판매자 권한이 있다면 하위 라우트들을 Outlet에 렌더링
                            ) : (
                                <Navigate to="/seller/apply" replace />
                            ) // 권한 없으면 신청 페이지로 리다이렉트
                        }
                    >
                        <Route
                            path="concerts/register"
                            element={<ConcertRegisterPage />}
                        />{' '}
                        {/* 콘서트 등록 */}
                        <Route
                            path="concerts/manage"
                            element={<SellerConcertManagementPage />}
                        />{' '}
                        {/* 콘서트 관리 */}
                    </Route>
                </Route>
            </Route>

            {/** — 404 처리 — **/}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
