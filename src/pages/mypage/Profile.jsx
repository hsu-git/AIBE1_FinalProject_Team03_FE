import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User, Lock, Calendar } from 'lucide-react';

import { ProfileTab } from '../../features/user/components/ProfileTab';
import { PasswordTab } from '../../features/user/components/PasswordTab';
import { BookingsTab } from '../../features/user/components/BookingsTab';
import { userService } from '../../features/user/services/userService';

export default function Profile() {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('profile');
    const [userInfo, setUserInfo] = useState(null);
    const [bookingHistory, setBookingHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBookingsLoading, setIsBookingsLoading] = useState(false);

    // 사용자 정보 로드
    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const data = await userService.getUserInfo();
                setUserInfo(data);
            } catch (error) {
                console.error('Failed to load user info:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserInfo();
    }, []);

    useEffect(() => {
        if (location.state?.from === 'bookingDetail') {
            setActiveTab('bookings');
        }
    }, [location.state]);

    // 예매 내역 로드 (예매 내역 탭 선택 시)
    useEffect(() => {
        if (
            activeTab === 'bookings' &&
            userInfo &&
            bookingHistory.length === 0
        ) {
            const loadBookingHistory = async () => {
                setIsBookingsLoading(true);
                try {
                    const data = await userService.getBookingHistory(
                        userInfo.id,
                    );
                    setBookingHistory(data);
                } catch (error) {
                    console.error('Failed to load booking history:', error);
                } finally {
                    setIsBookingsLoading(false);
                }
            };

            loadBookingHistory();
        }
    }, [activeTab, userInfo, bookingHistory.length]);

    // 사용자 정보 업데이트
    const handleUpdateUserInfo = async (updatedInfo) => {
        const result = await userService.updateUserInfo(updatedInfo);
        if (result.success) {
            setUserInfo(result.data);
        }
        return result;
    };

    // 비밀번호 변경
    const handleChangePassword = async (passwordData) => {
        return await userService.changePassword(passwordData);
    };

    const tabs = [
        {
            id: 'profile',
            label: '내 정보',
            icon: User,
            component: ProfileTab,
            props: {
                userInfo,
                onUpdateUserInfo: handleUpdateUserInfo,
                isLoading,
            },
        },
        {
            id: 'password',
            label: '비밀번호 변경',
            icon: Lock,
            component: PasswordTab,
            props: {
                userId: userInfo?.id,
                onChangePassword: handleChangePassword,
            },
        },
        {
            id: 'bookings',
            label: '예매 내역',
            icon: Calendar,
            component: BookingsTab,
            props: {
                bookingHistory,
                isLoading: isBookingsLoading,
            },
        },
    ];

    const getCurrentTabComponent = () => {
        const currentTab = tabs.find((tab) => tab.id === activeTab);
        if (!currentTab) return null;

        const Component = currentTab.component;
        return <Component {...currentTab.props} />;
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Page Title */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">My Account</h2>
                    <p className="text-gray-400">
                        프로필과 계정 설정을 관리하세요
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-col sm:flex-row justify-center mb-8">
                    <div className="bg-gray-800 rounded-xl p-1 flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                                        activeTab === tab.id
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-gray-500 hover:text-white hover:bg-gray-300'
                                    }`}
                                >
                                    <Icon size={18} />
                                    <span className="font-medium">
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-gray-800 rounded-2xl p-8">
                    {getCurrentTabComponent()}
                </div>
            </div>
        </div>
    );
}
