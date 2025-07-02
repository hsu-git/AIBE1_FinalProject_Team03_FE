import React from 'react';
import { Download, Share2, XCircle } from 'lucide-react';

export function BookingActionSection({
    canDownloadTicket,
    canCancelBooking,
    onDownloadTicket,
    onShare,
    onShowCancelConfirm,
}) {
    return (
        <div className="bg-gray-800 rounded-3xl p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                    onClick={onDownloadTicket}
                    disabled={!canDownloadTicket}
                    className="flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                >
                    <Download size={20} />
                    <span className="font-medium">티켓 다운로드</span>
                </button>

                <button
                    onClick={onShare}
                    className="flex items-center justify-center space-x-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                    <Share2 size={20} />
                    <span className="font-medium">공유하기</span>
                </button>

                <button
                    onClick={onShowCancelConfirm}
                    disabled={!canCancelBooking}
                    className="flex items-center justify-center space-x-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                >
                    <XCircle size={20} />
                    <span className="font-medium">예매 취소</span>
                </button>
            </div>
        </div>
    );
}
