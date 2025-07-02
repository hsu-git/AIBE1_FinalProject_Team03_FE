import { createContext, useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

// 1. Context 생성
export const AuthContext = createContext();

// 2. Provider 컴포넌트
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // 로그인한 사용자 정보
    const [loading, setLoading] = useState(true);

    // 3. 앱 시작 시 사용자 정보 로딩
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/auth/me`, {
                    credentials: 'include', // 🔥 중요! 쿠키 포함
                });
                if (res.ok) {
                    const data = await res.json();
                    // console.log('AuthContext: Fetched user data:', data);
                    setUser(data); // 로그인 상태로 설정
                } else {
                    setUser(null);
                }
            } catch {
                // catch(error) {
                //         console.error('AuthContext: Failed to fetch user data:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    // 로그아웃 요청 및 상태 초기화
    const logout = async () => {
        const logoutUrl = `${import.meta.env.VITE_APP_API_URL.replace('/api', '')}/auth/logout`;
        try {
            await fetch(logoutUrl, {
                method: 'POST',
                credentials: 'include',
            });
        } catch {
            console.warn('로그아웃 요청 실패');
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
