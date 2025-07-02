// src/pages/booking/WaitingPage.jsx
import React, { useEffect, useState, useContext, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // AuthContext 임포트

const WS_URL = import.meta.env.VITE_APP_WS_URL;
const isDev = import.meta.env.DEV ?? true; // 개발 모드 플래그

function WaitingPage() {
    const { concertId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); // 현재 로그인한 사용자 정보
    const initialRank = location.state?.rank;

    const [rank, setRank] = useState(initialRank); // 실시간 순위 업데이트 (선택적 기능)
    const [statusMessage, setStatusMessage] =
        useState('대기열에 접속 중입니다...');
    const wsRef = useRef(null);
    const isFirstMount = useRef(true);

    useEffect(() => {
        if (!user) {
            setStatusMessage('로그인 정보가 없습니다. 다시 시도해주세요.');
            return;
        }

        if (!WS_URL) {
            setStatusMessage('WebSocket 설정이 필요합니다.');
            return;
        }

        // 이미 연결이 있는 경우 재연결 방지
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        // withCredentials 옵션은 표준 WebSocket API에 직접적으로 없으므로,
        // 백엔드의 WebSocketAuthInterceptor가 쿠키를 정상적으로 읽도록 보장해야함
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket 연결 성공');
            setStatusMessage(`현재 대기 순번은 ${rank}번 입니다.`);
        };

        ws.onmessage = (event) => {
            console.log('서버로부터 메시지 수신:', event.data);

            let message;
            try {
                message = JSON.parse(event.data);
            } catch (error) {
                console.error('메시지 파싱 실패:', error);
                setStatusMessage('서버 메시지 형식 오류가 발생했습니다.');
                return;
            }

            // 서버(RedisMessageSubscriber)에서 보낸 "ADMIT" 타입 메시지 처리
            if (message.type === 'ADMIT' && message.accessKey) {
                setStatusMessage(
                    '입장 허가! 3초 후 예매 페이지로 이동합니다...',
                );
                sessionStorage.setItem(
                    `accessKey-${concertId}`,
                    message.accessKey,
                );

                setTimeout(() => {
                    ws.close();
                    navigate(`/concerts/${concertId}/reserve`);
                }, 3000);
            }
            // TODO: 실시간 순위 업데이트 메시지 처리 로직 추가 가능
        };

        ws.onclose = (event) => {
            if (event.wasClean) {
                console.log(
                    `WebSocket 연결이 정상적으로 종료되었습니다. 코드: ${event.code}, 원인: ${event.reason}`,
                );
            } else {
                console.error('WebSocket 연결이 비정상적으로 끊어졌습니다.');
                setStatusMessage(
                    '서버와의 연결이 끊어졌습니다. 네트워크 상태를 확인해주세요.',
                );
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket 오류 발생:', error);
            setStatusMessage(
                '연결에 오류가 발생했습니다. 잠시 후 새로고침 해주세요.',
            );
        };

        // 컴포넌트가 언마운트될 때 WebSocket 연결을 반드시 정리
        return () => {
            if (
                wsRef.current &&
                (wsRef.current.readyState === WebSocket.OPEN ||
                    wsRef.current.readyState === WebSocket.CONNECTING)
            ) {
                wsRef.current.close(1000, '페이지 언마운트로 인한 연결 종료');
            }
            wsRef.current = null;
        };
    }, [user, concertId, navigate, initialRank]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
                콘서트 예매 대기 중
            </h1>
            <p className="text-lg text-gray-600 mb-8">{statusMessage}</p>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
            <p className="mt-8 text-sm text-gray-500">
                이 페이지를 벗어나거나 새로고침하면 대기열에서 이탈될 수 있으니
                주의해주세요.
            </p>
        </div>
    );
}

export default WaitingPage;
