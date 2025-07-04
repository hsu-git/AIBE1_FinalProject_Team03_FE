import { useNavigate } from 'react-router-dom';
import { BOOKING_STATUS } from '../services/bookingDetailService';
import { formatPrice } from '../services/bookingDetailService';

export function BookingsTab({ bookingHistory, isLoading }) {
    const navigate = useNavigate();

    const getStatusColor = (status) => {
        switch (status) {
            case BOOKING_STATUS.CONFIRMED:
                return 'bg-green-100 text-green-800';
            case BOOKING_STATUS.COMPLETED:
                return 'bg-gray-100 text-gray-800';
            case BOOKING_STATUS.CANCELED:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case BOOKING_STATUS.CONFIRMED:
                return '예매 확정';
            case BOOKING_STATUS.COMPLETED:
                return '관람 완료';
            case BOOKING_STATUS.CANCELED:
                return '취소됨';
            default:
                return '대기중';
        }
    };

    const handleDetailBooking = (bookingId) => {
        navigate(`/bookingDetail/${bookingId}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">예매 내역</h3>
                {bookingHistory && bookingHistory.length > 0 && (
                    <p className="text-gray-400">
                        총 {bookingHistory.length}건의 예매 내역이 있습니다
                    </p>
                )}
            </div>

            {!bookingHistory || bookingHistory.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-400">예매 내역이 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookingHistory.map((booking) => (
                        <div
                            key={booking.bookingNumber}
                            className="bg-gray-700 rounded-xl p-6 hover:bg-gray-650 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xl font-bold">
                                    {booking.concertTitle}
                                </h4>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                        booking.bookingStatus,
                                    )}`}
                                >
                                    {getStatusText(booking.bookingStatus)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-400 block">
                                        공연일시
                                    </span>
                                    <span className="font-medium">
                                        {booking.concertDate}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">
                                        공연장
                                    </span>
                                    <p className="font-medium">
                                        {booking.venueName}
                                    </p>
                                    <p className="font-medium">
                                        {booking.venueAddress}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">
                                        좌석
                                    </span>
                                    {booking.seatList &&
                                    Array.isArray(booking.seatList) ? (
                                        booking.seatList.map((seat) => (
                                            <p
                                                key={seat}
                                                className="font-medium"
                                            >
                                                {seat}
                                            </p>
                                        ))
                                    ) : (
                                        <p className="font-medium text-gray-400">
                                            좌석 정보 없음
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <span className="text-gray-400 block">
                                        결제금액
                                    </span>
                                    <span className="font-bold text-blue-400">
                                        {formatPrice(booking.totalAmount)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end mt-4 space-x-2">
                                <button
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm"
                                    onClick={() =>
                                        handleDetailBooking(
                                            booking.bookingNumber,
                                        )
                                    }
                                >
                                    상세보기
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
