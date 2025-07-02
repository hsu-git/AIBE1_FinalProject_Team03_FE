import { CreditCard } from 'lucide-react';
import {
    formatDateTime,
    formatPrice,
    PAYMENT_STATUS,
    PAYMENT_METHOD,
} from '../../services/bookingDetailService';

export function PaymentSection({
    bookedAt,
    totalAmount,
    paymentStatus,
    paymentMethod,
}) {
    const paymentStatusColorMap = {
        PENDING: 'text-white',
        DONE: 'text-green-400',
        CANCELED: 'text-red-500',
        PARTIAL_CANCELED: 'text-orange-500',
        FAILED: 'text-red-500',
        EXPIRED: 'text-gray-400',
    };

    return (
        <div className="bg-gray-800 rounded-3xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-6 flex items-center text-white">
                <CreditCard className="mr-3 text-green-400" size={24} />
                결제 정보
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* 왼쪽 정보 */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex justify-between items-center py-2">
                        <span className="text-gray-400">결제 상태</span>
                        <span
                            className={`font-semibold ${paymentStatusColorMap[paymentStatus] || 'text-white'}`}
                        >
                            {PAYMENT_STATUS[paymentStatus]}
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-gray-400">결제 방법</span>
                        <span className="font-medium text-white">
                            {PAYMENT_METHOD[paymentMethod]}
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-gray-400">예매일시</span>
                        <span className="font-medium text-white">
                            {formatDateTime(bookedAt)}
                        </span>
                    </div>
                </div>

                {/* 금액 정보 강조 */}
                <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center w-full h-full min-h-[96px]">
                    <p className="text-white text-sm font-medium mb-1 whitespace-nowrap">
                        총 결제금액
                    </p>
                    <p className="text-white text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight whitespace-nowrap">
                        {formatPrice(totalAmount)}
                    </p>
                </div>
            </div>
        </div>
    );
}
