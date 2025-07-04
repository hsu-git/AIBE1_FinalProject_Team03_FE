import React, { useState, useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

// Lucide React 사용 보류
// import { User, Settings, Plus, List, ChevronDown, ChevronUp, Home } from 'lucide-react';

const SellerSidebar = () => {
    const { user } = useContext(AuthContext); // AuthContext에서 user 정보 가져오기
    const [isConcertMenuOpen, setIsConcertMenuOpen] = useState(false); // 콘서트 관리 토글 상태
    const location = useLocation(); // 현재 라우트 정보 가져오기

    // 판매자 권한 확인
    const isAdmin =
        user &&
        (user.role === 'ROLE_ADMIN' ||
            (user.roles && user.roles.includes('ROLE_ADMIN')));
    const isSeller =
        user &&
        (user.role === 'ROLE_SELLER' ||
            (user.roles && user.roles.includes('ROLE_SELLER')));

    // 판매자가 아닌 일반 유저 (로그인된 상태에서, 관리자 제외) - 이 변수는 현재 코드에서 직접 사용되지 않지만, 필요 시 활용
    // const isNormalUser = user && !isSeller && !isAdmin;

    // '판매자 권한 상태' 탭의 동적 텍스트 결정
    const sellerStatusTabText = location.pathname.startsWith('/seller/apply')
        ? '판매자 권한 신청' // /seller/apply 페이지에 있을 때
        : '판매자 권한 상태'; // 그 외 (주로 /seller/status 페이지에 있을 때)

    // 콘서트 관리 메뉴 토글 함수
    const toggleConcertMenu = () => {
        setIsConcertMenuOpen((prev) => !prev);
    };

    return (
        // 사이드바 전체 컨테이너
        <div
            className="flex flex-col shrink-0 min-h-screen bg-[#111922] border-r border-solid border-r-[#243447] py-3 pl-4 pr-3"
            style={{ width: '200px' }} // 사이드바 너비 조정
        >
            {/* 네비게이션 메뉴 */}
            <div className="flex flex-col gap-2 py-4">
                {/* 판매자 페이지 홈 링크 (어떤 사용자든 판매자 페이지 진입 시 기본) */}
                <NavLink
                    to="/seller" // 판매자 페이지의 기본 경로
                    end // 현재 경로가 정확히 일치할 때만 활성화 (하위 라우트에서는 비활성)
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                            isActive ? 'bg-[#243447]' : 'hover:bg-[#243447]'
                        }`
                    }
                >
                    {/* 홈 아이콘 (public 폴더의 SVG 사용) */}
                    <img
                        src="/vector-00.svg"
                        alt="홈 아이콘"
                        className="w-6 h-6"
                    />
                    {/* 관리자는 SellerLayout에 접근 불가하므로 isSeller 여부만 체크 */}
                    {isSeller ? '홈 (판매자)' : '홈 (일반 유저)'}
                </NavLink>

                {/* '판매자 권한 상태' 탭 (일반 유저와 판매자 유저 모두에게 보임) */}
                {/* 관리자는 App.jsx에서 리다이렉트되므로 여기서는 !isAdmin 조건만 체크하면 됨 */}
                {user && !isAdmin && (
                    <NavLink
                        to="/seller/status" // 이 링크는 여전히 /seller/status로 이동
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                                // 현재 경로가 /seller/status이거나 /seller/apply일 때 활성화 (두 페이지 모두 이 탭과 관련됨)
                                isActive ||
                                location.pathname.startsWith('/seller/apply')
                                    ? 'bg-[#243447]'
                                    : 'hover:bg-[#243447]'
                            }`
                        }
                    >
                        <img
                            src="/vector-03.svg"
                            alt={sellerStatusTabText}
                            className="w-6 h-6"
                        />
                        {sellerStatusTabText} {/* 동적 텍스트 적용 */}
                    </NavLink>
                )}

                {/* 판매자 유저에게만 보이는 탭들 */}
                {isSeller && (
                    <>
                        {/* 콘서트 관리 토글 메뉴 */}
                        <div className="flex flex-col">
                            <button
                                onClick={toggleConcertMenu}
                                className="flex items-center justify-between px-3 py-2 rounded-lg text-white text-sm font-medium w-full text-left bg-transparent transition-colors hover:bg-[#243447] focus:bg-[#243447]" // 배경색 투명 설정
                            >
                                <span className="flex items-center gap-3">
                                    {/* vector-04.svg 아이콘 사용 */}
                                    <img
                                        src="/vector-04.svg"
                                        alt="콘서트 관리"
                                        className="w-6 h-6"
                                    />
                                    콘서트 관리
                                </span>
                                {/* 토글 화살표 아이콘 (SVG 직접 포함) */}
                                {isConcertMenuOpen ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16px"
                                        height="16px"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-chevron-up"
                                    >
                                        <path d="m18 15-6-6-6 6" />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16px"
                                        height="16px"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-chevron-down"
                                    >
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                )}
                            </button>
                            {isConcertMenuOpen && (
                                <div className="flex flex-col pl-6 mt-1 space-y-1">
                                    <NavLink
                                        to="/seller/concerts/register"
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                                                isActive
                                                    ? 'bg-[#243447]'
                                                    : 'hover:bg-[#243447]'
                                            }`
                                        }
                                    >
                                        {/* Plus 아이콘 (SVG 직접 포함) */}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16px"
                                            height="16px"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-plus"
                                        >
                                            <path d="M12 5v14M5 12h14" />
                                        </svg>
                                        콘서트 등록
                                    </NavLink>
                                    <NavLink
                                        to="/seller/concerts/manage"
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                                                isActive
                                                    ? 'bg-[#243447]'
                                                    : 'hover:bg-[#243447]'
                                            }`
                                        }
                                    >
                                        {/* List 아이콘 (SVG 직접 포함) */}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16px"
                                            height="16px"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-list"
                                        >
                                            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                                        </svg>
                                        콘서트 관리
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SellerSidebar;
