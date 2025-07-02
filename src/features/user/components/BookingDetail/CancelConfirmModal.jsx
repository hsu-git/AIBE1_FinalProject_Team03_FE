import { RefreshCw } from 'lucide-react';
import { formatDate } from '../../services/bookingDetailService';

export function CancelConfirmModal({
    isLoading,
    concertTitle,
    concertDate,
    onShowCancelConfirm,
    onCancelBooking,
}) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full">
                <h3 className="text-xl font-bold mb-4 text-center">
                    예매 취소 확인
                </h3>
                <div className="bg-gray-700 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-300 mb-2">취소할 예매</p>
                    <p className="font-medium">{concertTitle}</p>
                    <p className="text-sm text-gray-400">
                        {formatDate(concertDate)}
                    </p>
                </div>
                <p className="text-gray-300 mb-6 text-center">
                    예매를 취소하시겠습니까?
                    <br />
                    <span className="text-sm text-gray-400">
                        취소 후에는 복구할 수 없습니다.
                    </span>
                </p>
                <div className="flex space-x-3">
                    <button
                        onClick={onShowCancelConfirm}
                        className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                        disabled={isLoading}
                    >
                        돌아가기
                    </button>
                    <button
                        onClick={onCancelBooking}
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center"
                    >
                        {isLoading ? (
                            <RefreshCw size={18} className="animate-spin" />
                        ) : (
                            '취소하기'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
