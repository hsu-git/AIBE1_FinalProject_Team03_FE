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
    const [timeUntilConcert, setTimeUntilConcert] = useState('');

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
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, [bookingDetail]);

    const showNotification = (message, type = NOTIFICATION_TYPE.INFO) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

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
        } catch {
            showNotification('복사에 실패했습니다.', NOTIFICATION_TYPE.ERROR);
        }
    };

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
            await userService.cancelBooking(bookingDetail.bookingId);
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
            '티켓을 다운로드 기능은 구현 예정입니다.',
            NOTIFICATION_TYPE.ERROR,
        );
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: bookingDetail.concertTitle,
                    text: `${bookingDetail.concertTitle} 예매 완료!\n${formatDate(bookingDetail.concertDate)} ${bookingDetail.startTime}`,
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
        bookingDetail?.bookingStatus === BOOKING_STATUS.CONFIRMED &&
        bookingDetail?.paymentStatus === 'DONE';
    const canDownloadTicket = [
        BOOKING_STATUS.CONFIRMED,
        BOOKING_STATUS.COMPLETED,
    ].includes(bookingDetail?.bookingStatus);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                로딩 중...
            </div>
        );
    }

    if (!bookingDetail) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                예매 정보를 찾을 수 없습니다.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {notification && (
                <NotificationSection notification={notification} />
            )}
            {showCancelConfirm && (
                <CancelConfirmModal
                    isLoading={isLoading}
                    concertTitle={bookingDetail.concertTitle}
                    concertDate={bookingDetail.concertDate}
                    onShowCancelConfirm={() => setShowCancelConfirm(false)}
                    onCancelBooking={handleCancelBooking}
                />
            )}

            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-5">
                    <button
                        onClick={handleBack}
                        className="bg-gray-600 text-white hover:text-blue-300 flex items-center space-x-2"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm sm:text-base font-medium">
                            뒤로가기
                        </span>
                    </button>
                    <div className="flex items-center space-x-2 text-sm text-right w-fit">
                        <span className="text-gray-300 whitespace-nowrap">
                            예매번호
                        </span>
                        <button
                            onClick={handleCopyBookingNumber}
                            className="flex items-center space-x-1 bg-gray-600 text-white hover:text-blue-400 px-3 py-2.5"
                        >
                            <span className="font-mono text-base truncate max-w-[160px] sm:max-w-[220px]">
                                {bookingDetail.bookingNumber}
                            </span>
                            {copiedBookingNumber ? (
                                <Check size={18} className="text-green-400" />
                            ) : (
                                <Copy size={18} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <PosterSection
                            {...bookingDetail}
                            timeUntilConcert={timeUntilConcert}
                        />
                    </div>
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-gray-800 p-6 rounded-xl">
                            <VenueSection
                                venueName={bookingDetail.venueName}
                                venueAddress={bookingDetail.venueAddress}
                                onGetDirections={handleGetDirections}
                            />
                        </div>
                        <div className="bg-gray-800 p-6 rounded-xl">
                            <SeatInfoSection
                                seatList={bookingDetail.seatList}
                            />
                        </div>
                        <div className="bg-gray-800 p-6 rounded-xl overflow-x-auto">
                            <PaymentSection {...bookingDetail} />
                        </div>
                        <div className="bg-gray-800 p-6 rounded-xl">
                            <BookingActionSection
                                canDownloadTicket={canDownloadTicket}
                                canCancelBooking={canCancelBooking}
                                onDownloadTicket={handleDownloadTicket}
                                onShare={handleShare}
                                onShowCancelConfirm={() =>
                                    setShowCancelConfirm(true)
                                }
                            />
                        </div>
                        <div className="p-6 bg-gray-700 rounded-xl text-center">
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
                                    • 공연 당일 입장 시 신분증과 예매 확인서를
                                    지참해 주세요
                                </li>
                                <li>
                                    • 공연 시작 후에는 입장이 제한될 수 있습니다
                                </li>
                                <li>• 취소는 공연 3일 전까지만 가능합니다</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
