// src/pages/payment/PaymentSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchBooking } from '../../features/payment/paymentAPI';

export default function PaymentSuccess() {
    const [params] = useSearchParams();
    const bookingNumber = params.get('bookingNumber');
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!bookingNumber) {
            setError('예매 번호가 전달되지 않았습니다.');
            return;
        }
        fetchBooking(bookingNumber)
            .then((res) => setBooking(res.data.data))
            .catch(() => setError('예매 정보를 불러오는 데 실패했습니다.'));
    }, [bookingNumber]);

    if (error) {
        return (
            <div className="px-40 flex flex-1 justify-center py-20">
                <div className="layout-content-container text-center">
                    {error}
                </div>
            </div>
        );
    }
    if (!booking) {
        return (
            <div className="px-40 flex flex-1 justify-center py-20">
                <div className="layout-content-container text-center">
                    로딩 중…
                </div>
            </div>
        );
    }

    const {
        concertTitle = '',
        concertDateTime = '',
        seatLabels = [],
        totalAmount = 0,
    } = booking || {};

    return (
        <div className="px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5">
                {/* 제목 & 설명 */}
                <h2 className="text-[#141414] text-[28px] font-bold text-center pb-2">
                    결제가 완료되었습니다!
                </h2>
                <p className="text-[#757575] text-base text-center pb-4">
                    아래 예매 정보를 확인해 주세요.
                </p>

                <hr className="border-t border-t-[#e0e0e0] mb-6" />

                {/* 주문 요약 */}
                <h3 className="text-[#141414] text-lg font-bold pb-2">
                    주문 요약
                </h3>
                <hr className="border-t border-t-[#e0e0e0] mb-6" />

                <div className="space-y-3 mb-8">
                    <div>
                        <p className="text-[#757575] text-sm">공연명</p>
                        <p className="text-[#141414] text-sm">{concertTitle}</p>
                    </div>
                    <div>
                        <p className="text-[#757575] text-sm">공연 일시</p>
                        <p className="text-[#141414] text-sm">
                            {concertDateTime}
                        </p>
                    </div>
                    <div>
                        <p className="text-[#757575] text-sm">좌석</p>
                        <p className="text-[#141414] text-sm">
                            {seatLabels?.length > 0
                                ? seatLabels.join(', ')
                                : '좌석 정보 없음'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[#757575] text-sm">총 금액</p>
                        <p className="text-[#141414] text-sm">
                            {(totalAmount || 0).toLocaleString()}원
                        </p>
                    </div>
                </div>

                {/* 버튼 */}
                <div className="flex justify-center gap-3">
                    <Link
                        to="/mypage/profile"
                        className="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-4 bg-[#f2f2f2] text-[#141414] text-sm font-bold"
                    >
                        마이페이지
                    </Link>
                    <Link
                        to="/"
                        className="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-4 bg-[#141414] text-white text-sm font-bold"
                    >
                        홈으로
                    </Link>
                </div>
            </div>
        </div>
    );
}
