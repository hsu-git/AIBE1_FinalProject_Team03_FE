// src/pages/booking/WaitingPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { checkQueueStatus } from '../../features/booking/services/bookingService';

const WS_URL = import.meta.env.VITE_APP_WS_URL;

function WaitingPage() {
    const { concertId } = useParams();
    const navigate = useNavigate();
    const [statusMessage, setStatusMessage] =
        useState('대기열에 접속 중입니다...');
    const [retryDelay, setRetryDelay] = useState(5000); // 초기 재시도 딜레이
    const wsRef = useRef(null);
    const pollingRef = useRef(null);
    const reconnectRef = useRef(null);
    const isUnmounted = useRef(false);

    const handleAdmission = (accessKey) => {
        if (isUnmounted.current) return;
        isUnmounted.current = true;

        setStatusMessage('입장 허가! 예매 페이지로 이동합니다...');
        stopAllTimers();
        wsRef.current?.close(1000, 'ADMITTED');

        sessionStorage.setItem(`accessKey-${concertId}`, accessKey);
        setTimeout(() => navigate(`/concerts/${concertId}/reserve`), 1000);
    };

    const startPolling = () => {
        if (pollingRef.current || isUnmounted.current) return;
        console.log('📡 fallback polling 시작');
        setStatusMessage('서버 응답 대기 중 (폴링 시작)...');

        pollingRef.current = setInterval(async () => {
            console.log('🔍 polling → checkQueueStatus 호출');
            try {
                const res = await checkQueueStatus(concertId);
                if (res.status === 'ADMITTED') {
                    console.log('🎟️ polling에서 입장 허가 감지');
                    handleAdmission(res.accessKey);
                }
            } catch (err) {
                console.error('❌ polling 중 에러', err);
            }
        }, 4000);
    };

    const scheduleReconnect = () => {
        if (reconnectRef.current || isUnmounted.current) return;
        console.log(
            `📡 scheduleReconnect() 호출됨 - 다음 시도까지 ${retryDelay / 1000}s`,
        );

        reconnectRef.current = setTimeout(() => {
            console.log(`🔁 ${retryDelay / 1000}s 후 재연결 시도`);
            connectWebSocket();
            setRetryDelay((prev) => Math.min(prev * 2, 60000));
        }, retryDelay);
    };

    const connectWebSocket = () => {
        try {
            const ws = new WebSocket(`${WS_URL}?concertId=${concertId}`);
            wsRef.current = ws;
            console.log('🌐 WebSocket 연결 시도 중...');

            ws.onopen = async () => {
                console.log(
                    '✅ WebSocket 연결됨. 서버와 상태 동기화를 시작합니다.',
                );
                stopAllTimers();

                try {
                    const statusData = await checkQueueStatus(concertId);
                    if (statusData.status === 'ADMITTED') {
                        console.log(
                            '🎟️ 상태 동기화 결과: 이미 입장 허가된 상태. 즉시 이동합니다.',
                        );
                        handleAdmission(statusData.accessKey);
                    } else {
                        console.log(
                            `📝 상태 동기화 결과: 아직 대기 중. 순번: ${statusData.rank}`,
                        );
                        setStatusMessage(
                            `대기열 연결 완료. 현재 순번: ${statusData.rank || '확인 중'}번`,
                        );
                        setRetryDelay(5000);
                    }
                } catch (error) {
                    console.error(
                        '❌ 상태 동기화 중 오류 발생. 폴백 절차를 시작합니다.',
                        error,
                    );
                    startPolling();
                    scheduleReconnect();
                }
            };

            ws.onmessage = (event) => {
                console.log('📩 WebSocket 메시지 수신:', event.data);
                try {
                    const msg = JSON.parse(event.data);
                    if (msg.type === 'ADMIT' && msg.accessKey) {
                        console.log('🎟️ WebSocket에서 입장 허가 감지');
                        handleAdmission(msg.accessKey);
                    }
                } catch (err) {
                    console.error('메시지 처리 오류:', err);
                }
            };

            ws.onerror = () => {
                console.error('WebSocket 오류 발생');
                ws.close();
            };

            ws.onclose = (event) => {
                console.warn(
                    `❌ WebSocket 종료됨: ${event.code} - ${event.reason}`,
                );
                if (!isUnmounted.current) {
                    setStatusMessage('연결 실패. 다시 시도 중...');
                    startPolling();
                    scheduleReconnect();
                }
            };
        } catch (err) {
            console.error('🧨 WebSocket 생성 실패', err);
            startPolling();
            scheduleReconnect();
        }
    };

    const stopAllTimers = () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (reconnectRef.current) clearTimeout(reconnectRef.current);
        pollingRef.current = null;
        reconnectRef.current = null;
    };

    useEffect(() => {
        console.log('💡 useEffect setup: WebSocket 연결 시작');
        connectWebSocket();

        return () => {
            console.log('🧹 useEffect cleanup: 모든 타이머 및 WebSocket 종료');
            stopAllTimers();
            wsRef.current?.close(1000, 'Component Unmount');
            wsRef.current = null;
        };
    }, [concertId]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
                콘서트 예매 대기 중
            </h1>
            <p className="text-lg text-gray-600 mb-8">{statusMessage}</p>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
            <p className="mt-8 text-sm text-gray-500">
                이 페이지를 벗어나거나 새로고침하면 대기열에서 이탈될 수
                있습니다.
            </p>
        </div>
    );
}

export default WaitingPage;
