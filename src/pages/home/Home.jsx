import React, { useState, useEffect, useContext } from 'react';
import { concertService } from '../../features/concert/services/concertService';
import { AuthContext } from '../../context/AuthContext';
import '../../App.css';

function Home() {
    const [concerts, setConcerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, logout } = useContext(AuthContext);

    useEffect(() => {
        async function getConcerts() {
            try {
                setLoading(true);
                setError(null);

                console.log('🎵 콘서트 목록 조회 시작...');

                const response = await concertService.getConcerts({
                    page: 0,
                    size: 20,
                });

                console.log('📦 API 응답 데이터:', response);

                // 응답 데이터 구조 확인 및 처리
                let concertData = [];

                if (response?.data) {
                    // SuccessResponse 구조: { success: true, message: "...", data: {...} }
                    if (response.data.content) {
                        // 페이지네이션 구조: { content: [...], totalElements: ..., ... }
                        concertData = response.data.content;
                    } else if (Array.isArray(response.data)) {
                        // 직접 배열인 경우
                        concertData = response.data;
                    } else {
                        console.warn(
                            '⚠️ 예상치 못한 데이터 구조:',
                            response.data,
                        );
                        concertData = [];
                    }
                } else if (Array.isArray(response)) {
                    // 직접 배열 응답인 경우
                    concertData = response;
                }

                console.log(`✅ 콘서트 ${concertData.length}개 로드 완료`);
                setConcerts(concertData);
            } catch (err) {
                console.error('❌ 콘서트 목록 조회 실패:', err);

                // 에러 메시지 처리
                let errorMessage = '콘서트 목록을 불러오지 못했습니다.';

                if (err.message) {
                    errorMessage = err.message;
                } else if (err.response?.data?.message) {
                    errorMessage = err.response.data.message;
                }

                setError(errorMessage);
                setConcerts([]); // 에러 시 빈 배열로 설정
            } finally {
                setLoading(false);
            }
        }

        getConcerts();
    }, []);

    // 재시도 함수
    const handleRetry = () => {
        window.location.reload(); // 간단한 재시도
    };

    if (loading) {
        return (
            <div className="container">
                <div className="card">
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            padding: '20px',
                        }}
                    >
                        <div
                            style={{
                                width: '20px',
                                height: '20px',
                                border: '2px solid #f3f3f3',
                                borderTop: '2px solid #3498db',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                            }}
                        ></div>
                        <span>콘서트 목록을 불러오는 중...</span>
                    </div>
                </div>

                <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div
                    className="card"
                    style={{
                        color: 'red',
                        textAlign: 'center',
                        padding: '20px',
                    }}
                >
                    <h3>😵 오류 발생</h3>
                    <p>{error}</p>
                    <button
                        onClick={handleRetry}
                        style={{
                            marginTop: '10px',
                            padding: '8px 16px',
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        🔄 다시 시도
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            {user && (
                <div className="card">
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <span>👋 {user.username}님 환영합니다!</span>
                        <button
                            onClick={logout}
                            style={{
                                padding: '5px 10px',
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            로그아웃
                        </button>
                    </div>
                </div>
            )}

            <h1>🎵 공연 목록</h1>

            {concerts.length === 0 ? (
                <div
                    className="card"
                    style={{ textAlign: 'center', padding: '40px' }}
                >
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                        🎭
                    </div>
                    <h3>현재 등록된 공연이 없습니다</h3>
                    <p style={{ color: '#666', marginTop: '8px' }}>
                        곧 멋진 공연들이 업데이트될 예정입니다!
                    </p>
                </div>
            ) : (
                <>
                    <div
                        style={{
                            marginBottom: '20px',
                            padding: '10px',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '4px',
                            textAlign: 'center',
                        }}
                    >
                        총 <strong>{concerts.length}개</strong>의 공연이
                        있습니다
                    </div>

                    <ul className="concert-list">
                        {concerts.map((concert, index) => (
                            <li
                                key={concert.concertId || index}
                                className="concert-item"
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <h3
                                            style={{
                                                margin: '0 0 8px 0',
                                                color: '#2c3e50',
                                            }}
                                        >
                                            {concert.title || '제목 없음'}
                                        </h3>
                                        <p style={{ margin: '4px 0' }}>
                                            🎤 <strong>아티스트:</strong>{' '}
                                            {concert.artist || '정보 없음'}
                                        </p>
                                        <p style={{ margin: '4px 0' }}>
                                            📍 <strong>장소:</strong>{' '}
                                            {concert.venueName || '정보 없음'}
                                        </p>
                                        <p style={{ margin: '4px 0' }}>
                                            📅 <strong>날짜:</strong>{' '}
                                            {concert.concertDate || '정보 없음'}
                                        </p>
                                        {concert.startTime && (
                                            <p style={{ margin: '4px 0' }}>
                                                ⏰ <strong>시간:</strong>{' '}
                                                {concert.startTime}
                                            </p>
                                        )}
                                    </div>

                                    {concert.status && (
                                        <div
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: getStatusColor(
                                                    concert.status,
                                                ).bg,
                                                color: getStatusColor(
                                                    concert.status,
                                                ).text,
                                            }}
                                        >
                                            {getStatusLabel(concert.status)}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <p className="read-the-docs">
                💡 이것은 백엔드에서 데이터를 가져오는 예시입니다.
            </p>
        </div>
    );
}

// 상태별 색상 반환 함수
function getStatusColor(status) {
    switch (status) {
        case 'SCHEDULED':
            return { bg: '#fff3cd', text: '#856404' }; // 노란색
        case 'ON_SALE':
            return { bg: '#d4edda', text: '#155724' }; // 초록색
        case 'SOLD_OUT':
            return { bg: '#f8d7da', text: '#721c24' }; // 빨간색
        case 'CANCELLED':
            return { bg: '#f6f6f6', text: '#6c757d' }; // 회색
        case 'COMPLETED':
            return { bg: '#d1ecf1', text: '#0c5460' }; // 파란색
        default:
            return { bg: '#f6f6f6', text: '#6c757d' }; // 기본 회색
    }
}

// 상태별 라벨 반환 함수
function getStatusLabel(status) {
    const labels = {
        SCHEDULED: '예매 대기',
        ON_SALE: '예매 중',
        SOLD_OUT: '매진',
        CANCELLED: '취소됨',
        COMPLETED: '공연 완료',
    };
    return labels[status] || status;
}

export default Home;
