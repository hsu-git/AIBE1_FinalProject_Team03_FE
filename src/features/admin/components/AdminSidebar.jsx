import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
    return (
        <div
            className="flex flex-col shrink-0 min-h-screen bg-[#111922] border-r border-solid border-r-[#243447] py-3 pl-4 pr-3"
            style={{ width: '200px' }}
        >
            <div className="flex flex-col gap-2 py-4">
                <NavLink
                    to="/admin"
                    end
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                            isActive ? 'bg-[#243447]' : 'hover:bg-[#243447]'
                        }`
                    }
                >
                    <img
                        src="/admin-vector-00.svg" // 수정됨
                        alt="홈 아이콘"
                        className="w-6 h-6"
                    />
                    홈 (관리자)
                </NavLink>
                <NavLink
                    to="/admin/seller-management"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                            isActive ? 'bg-[#243447]' : 'hover:bg-[#243447]'
                        }`
                    }
                >
                    <img
                        src="/admin-vector-03.svg" // 수정됨
                        alt="판매자 관리"
                        className="w-6 h-6"
                    />
                    판매자 권한 관리
                </NavLink>
                {/* 추가적인 관리자 메뉴는 여기에 NavLink로 추가 */}
                {/*
                    <NavLink
                      to="/admin/concerts"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                          isActive ? 'bg-[#243447]' : 'hover:bg-[#243447]'
                        }`
                      }
                    >
                      <img src="/admin-vector-04.svg" alt="콘서트 관리" className="w-6 h-6" />*/}
                {/* 주석 해제 시에도 admin-vector 로 수정 */}
                {/*
                            콘서트 관리
                        </NavLink>
            */}
            </div>
        </div>
    );
};

export default AdminSidebar;
