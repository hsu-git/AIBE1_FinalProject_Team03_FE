import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../features/user/services/userService.js';
import { NotificationSection } from '../../features/user/components/BookingDetail/NotificationSection.jsx';
import { PosterSection } from '../../features/user/components/BookingDetail/PosterSection.jsx';
import { BookingActionSection } from '../../features/user/components/BookingDetail/BookingActionSection.jsx';
import { VenueSection } from '../../features/user/components/BookingDetail/VenueSection.jsx';
import { SeatInfoSection } from '../../features/user/components/BookingDetail/SeatsInfoSection.jsx';
import { PaymentSection } from '../../features/user/components/BookingDetail/PaymentSection.jsx';
import { CancelConfirmModal } from '../../features/user/components/BookingDetail/CancelConfirmModal.jsx';
import {
    NOTIFICATION_TYPE,
    BOOKING_STATUS,
    formatDate,
    calculateTimeUntilConcert,
} from '../../features/user/services/bookingDetailService.js';
import { ArrowLeft, AlertCircle, Copy, Check } from 'lucide-react';

export default function BookingDetail() {
    const navigate = useNavigate();
    const { bookingNumber } = useParams();
    const [bookingDetail, setBookingDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [copiedBookingNumber, setCopiedBookingNumber] = useState(false);
    const [notification, setNotification] = useState(null);

    // 공연까지 남은 시간 계산
    const [timeUntilConcert, setTimeUntilConcert] = useState('');

    // 예매 정보 로드
    useEffect(() => {
        const loadBookingDetail = async () => {
            setIsLoading(true);
            try {
                const data = await userService.getBookingDetail(bookingNumber);
                setBookingDetail(data);
            } catch (error) {
                showNotification(
                    '예매 정보를 불러오는데 실패했습니다.',
                    NOTIFICATION_TYPE.ERROR,
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadBookingDetail();
    }, [bookingNumber]);

    useEffect(() => {
        if (!bookingDetail) return;

        const updateTime = () => {
            const result = calculateTimeUntilConcert(
                bookingDetail.concertDate,
                bookingDetail.startTime,
            );
            setTimeUntilConcert(result);
        };

        updateTime();
        const interval = setInterval(updateTime, 60000); // 1분마다 업데이트

        return () => clearInterval(interval);
    }, [bookingDetail]);

    const showNotification = (message, type = NOTIFICATION_TYPE.INFO) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (!bookingDetail) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div>예매 정보를 찾을 수 없습니다.</div>
            </div>
        );
    }

    const handleBack = () => {
        navigate('/mypage/profile', { state: { from: 'bookingDetail' } });
    };

    const handleCopyBookingNumber = async () => {
        try {
            await navigator.clipboard.writeText(bookingDetail.bookingNumber);
            setCopiedBookingNumber(true);
            showNotification(
                '예매번호가 복사되었습니다!',
                NOTIFICATION_TYPE.SUCCESS,
            );
            setTimeout(() => setCopiedBookingNumber(false), 2000);
        } catch (err) {
            showNotification('복사에 실패했습니다.', NOTIFICATION_TYPE.ERROR);
        }
    };

    // 예매 취소
    const handleCancelBooking = async () => {
        if (bookingDetail.bookingStatus === BOOKING_STATUS.CANCELED) {
            showNotification(
                '이미 취소된 예매입니다.',
                NOTIFICATION_TYPE.ERROR,
            );
            return;
        }

        setIsLoading(true);
        try {
            const result = await userService.cancelBooking(
                bookingDetail.bookingId,
            );

            const updated = await userService.getBookingDetail(bookingNumber);
            setBookingDetail(updated);

            showNotification(
                '예매가 취소되었습니다.',
                NOTIFICATION_TYPE.SUCCESS,
            );
        } catch (error) {
            showNotification(
                `${error}` || '예매 취소 중 오류가 발생했습니다.',
                NOTIFICATION_TYPE.ERROR,
            );
        } finally {
            setIsLoading(false);
            setShowCancelConfirm(false);
        }
    };

    const handleDownloadTicket = () => {
        if (bookingDetail.bookingStatus === BOOKING_STATUS.CANCELED) {
            showNotification(
                '취소된 예매는 티켓을 다운로드할 수 없습니다.',
                NOTIFICATION_TYPE.ERROR,
            );
            return;
        }
        showNotification(
            '티켓을 다운로드하고 있습니다...',
            NOTIFICATION_TYPE.INFO,
        );
        // 실제 다운로드 로직
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: bookingDetail.concertTitle,
                    text: `${bookingDetail.concertTitle} 예매 완료!\n${formatDate(bookingDetail.concertDate)} ${
                        bookingDetail.startTime
                    }`,
                    url: window.location.href,
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    showNotification(
                        '공유에 실패했습니다.',
                        NOTIFICATION_TYPE.ERROR,
                    );
                }
            }
        } else {
            handleCopyBookingNumber();
        }
    };

    const handleGetDirections = () => {
        const query = encodeURIComponent(bookingDetail.venueAddress);
        window.open(`https://map.kakao.com/link/search/${query}`, '_blank');
    };

    const canCancelBooking =
        bookingDetail.bookingStatus === BOOKING_STATUS.CONFIRMED &&
        bookingDetail.paymentStatus === 'DONE';
    const canDownloadTicket =
        bookingDetail.bookingStatus === BOOKING_STATUS.CONFIRMED ||
        bookingDetail.bookingStatus === BOOKING_STATUS.COMPLETED;

    if (!isLoading && bookingDetail) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
                {/* 알림 */}
                {notification && (
                    <NotificationSection notification={notification} />
                )}

                {/* 취소 확인 모달 */}
                {showCancelConfirm && (
                    <CancelConfirmModal
                        isLoading={isLoading}
                        concertTitle={bookingDetail.concertTitle}
                        concertDate={bookingDetail.concertDate}
                        onShowCancelConfirm={() => setShowCancelConfirm(false)}
                        onCancelBooking={handleCancelBooking}
                    />
                )}

                <div className="max-w-6xl mx-auto px-4 py-6">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={handleBack}
                            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
                        >
                            <ArrowLeft
                                size={20}
                                className="group-hover:-translate-x-1 transition-transform"
                            />
                            <span>뒤로가기</span>
                        </button>

                        <div className="text-right">
                            <p className="text-sm text-gray-400">예매번호</p>
                            <button
                                onClick={handleCopyBookingNumber}
                                className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors group"
                            >
                                <span className="font-mono text-lg">
                                    {bookingDetail.bookingNumber}
                                </span>
                                {copiedBookingNumber ? (
                                    <Check
                                        size={18}
                                        className="text-green-400"
                                    />
                                ) : (
                                    <Copy
                                        size={18}
                                        className="group-hover:scale-110 transition-transform"
                                    />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 메인 콘텐츠 */}
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                        {/* 포스터 섹션 */}
                        <PosterSection
                            posterImageUrl={bookingDetail.posterImageUrl}
                            concertTitle={bookingDetail.concertTitle}
                            artistName={bookingDetail.artistName}
                            concertDate={bookingDetail.concertDate}
                            startTime={bookingDetail.startTime}
                            endTime={bookingDetail.endTime}
                            bookingStatus={bookingDetail.bookingStatus}
                            timeUntilConcert={timeUntilConcert}
                        />

                        {/* 상세 정보 섹션 */}
                        <div className="xl:col-span-3 space-y-6">
                            {/* 공연장 정보 */}
                            <VenueSection
                                venueName={bookingDetail.venueName}
                                venueAddress={bookingDetail.venueAddress}
                                onGetDirections={handleGetDirections}
                            />

                            {/* 좌석 정보 */}
                            <SeatInfoSection
                                seatList={bookingDetail.seatList}
                            />

                            {/* 결제 정보 */}
                            <PaymentSection
                                bookedAt={bookingDetail.bookedAt}
                                totalAmount={bookingDetail.totalAmount}
                                paymentStatus={bookingDetail.paymentStatus}
                                paymentMethod={bookingDetail.paymentMethod}
                            />

                            {/* 액션 버튼들 */}
                            <BookingActionSection
                                canDownloadTicket={canDownloadTicket}
                                canCancelBooking={canCancelBooking}
                                onDownloadTicket={handleDownloadTicket}
                                onShare={handleShare}
                                onShowCancelConfirm={() =>
                                    setShowCancelConfirm(true)
                                }
                            />

                            <div className="mt-6 p-4 bg-gray-700 rounded-xl text-center">
                                <div className="flex justify-center items-center space-x-2 mb-2">
                                    <AlertCircle
                                        size={20}
                                        className="text-yellow-400"
                                    />
                                    <p className="text-sm font-medium text-yellow-400">
                                        알림
                                    </p>
                                </div>
                                <ul className="text-sm text-gray-300 space-y-1">
                                    <li>
                                        • 공연 당일 입장 시 신분증과 예매
                                        확인서를 지참해 주세요
                                    </li>
                                    <li>
                                        • 공연 시작 후에는 입장이 제한될 수
                                        있습니다
                                    </li>
                                    <li>
                                        • 취소는 공연 3일 전까지만 가능합니다
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
