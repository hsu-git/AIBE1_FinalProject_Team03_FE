export const NOTIFICATION_TYPE = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
};

export const BOOKING_STATUS = {
    CONFIRMED: 'CONFIRMED',
    COMPLETED: 'COMPLETED',
    CANCELED: 'CANCELED',
};

export const PAYMENT_STATUS = {
    PENDING: '결제 승인 대기',
    DONE: '결제 완료',
    CANCELED: '결제 취소',
    PARTIAL_CANCELED: '부분 취소',
    FAILED: '결제 실패',
    EXPIRED: '결제 시간 만료',
};

export const PAYMENT_METHOD = {
    CARD: '카드',
};

export const formatDate = (dateString) => {
    if (!dateString) return '정보 없음';

    const date = new Date(dateString);
    if (isNaN(date)) return '정보 없음';

    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
    });
};

export const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '정보 없음';

    const date = new Date(dateTimeString);
    if (isNaN(date)) return '정보 없음';

    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatPrice = (price) => {
    if (price == null || isNaN(price)) return '0원';

    return new Intl.NumberFormat('ko-KR').format(price) + '원';
};

export function calculateTimeUntilConcert(concertDate, startTime) {
    if (!concertDate || !startTime) return '정보 없음';

    const concertDateTime = new Date(`${concertDate}T${startTime}`);
    if (isNaN(concertDateTime)) return '정보 없음';

    const now = new Date();
    const diff = concertDateTime - now;

    if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            return `${days}일 ${hours}시간 후`;
        } else if (hours > 0) {
            return `${hours}시간 ${minutes}분 후`;
        } else {
            return minutes > 0 ? `${minutes}분 후` : '곧 시작';
        }
    } else {
        return '공연 종료';
    }
}
