// src/features/booking/hooks/useBookingQueue.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { enterWaitingQueue } from '../services/bookingService';

export function useBookingQueue(concertId) {
    const navigate = useNavigate();
    const [isEntering, setIsEntering] = useState(false);

    const enterQueue = async () => {
        if (!concertId) return;

        setIsEntering(true);
        try {
            const response = await enterWaitingQueue(concertId);

            switch (response.status) {
                case 'IMMEDIATE_ENTRY':
                    console.log('즉시 입장 허가. Access Key 수신.');
                    sessionStorage.setItem(
                        `accessKey-${concertId}`,
                        response.accessKey,
                    );
                    navigate(`/concerts/${concertId}/reserve`);
                    break;

                case 'WAITING':
                    console.log(`대기열 진입. 순번: ${response.rank}`);
                    navigate(`/concerts/${concertId}/wait`, {
                        state: { rank: response.rank },
                    });
                    break;

                case 'ERROR':
                    alert(response.message);
                    break;

                default:
                    console.warn(`알 수 없는 응답 상태: ${response.status}`);
                    alert('알 수 없는 응답입니다. 잠시 후 다시 시도해주세요.');
            }
        } catch (err) {
            alert(err.message || '대기열 입장 중 오류가 발생했습니다.');
        } finally {
            setIsEntering(false);
        }
    };

    return {
        enterQueue,
        isEntering,
    };
}
