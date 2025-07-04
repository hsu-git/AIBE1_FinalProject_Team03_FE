import apiClient from '../../../shared/utils/apiClient'; // apiClient는 utils/apiClient.js에서 가져온다고 가정

// 특정 콘서트의 모든 좌석 상태 조회 API
export async function fetchAllSeatStatus(concertId) {
    const response = await apiClient.get(`/seats/concerts/${concertId}/status`);
    return response.data; // SeatStatusResponse[]
}

// 좌석 임시 선점 API
export async function reserveSeat(concertId, seatId) {
    // 백엔드 API 명세에 따라 userId가 PathVariable이 아닌 AuthenticationPrincipal로 처리되므로,
    // 클라이언트에서는 userId를 별도로 보내지 않습니다.
    const response = await apiClient.post(
        `/seats/concerts/${concertId}/seats/${seatId}/reserve`,
    );
    return response.data; // SeatStatusResponse
}

// 좌석 선점 해제 API
export async function releaseSeat(concertId, seatId) {
    const response = await apiClient.delete(
        `/seats/concerts/${concertId}/seats/${seatId}/release`,
    );
    return response.data; // String ("SUCCESS")
}

// 예매 생성 및 결제 준비 API
export async function createBookingAndPreparePayment(bookingCreateRequest) {
    const response = await apiClient.post('/bookings', bookingCreateRequest);
    return response.data; // PaymentExecutionResponse
}

/**
 * 콘서트 대기열 입장 요청
 * 백엔드: POST /api/queue/enter?concertId={concertId}
 * @param {number} concertId - 대기열에 입장할 콘서트 ID
 * @returns {Promise<any>} - 서버에서 반환한 대기열 관련 데이터
 */
export async function enterWaitingQueue(concertId) {
    try {
        const response = await apiClient.post(
            `/queue/enter?concertId=${concertId}`,
        );
        console.log('[enterWaitingQueue] Success:', response);
        return response.data;
    } catch (error) {
        console.error(
            `[enterWaitingQueue] 실패 (concertId: ${concertId}):`,
            error,
        );
        throw error; // 호출자에게 에러를 전달
    }
}

export async function checkQueueStatus(concertId) {
    const response = await apiClient.get(
        `/queue/status?concertId=${concertId}`,
    );
    return response.data; // QueueStatusDto 반환
}
