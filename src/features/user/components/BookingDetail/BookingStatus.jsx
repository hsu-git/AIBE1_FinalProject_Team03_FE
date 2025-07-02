import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
    CONFIRMED: {
        color: 'bg-green-500',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        icon: CheckCircle,
        text: '예매 확정',
    },
    COMPLETED: {
        color: 'bg-gray-500',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700',
        icon: CheckCircle,
        text: '관람 완료',
    },
    CANCELED: {
        color: 'bg-red-500',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        icon: XCircle,
        text: '취소됨',
    },
    DEFAULT: {
        color: 'bg-yellow-500',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        icon: AlertCircle,
        text: '대기중',
    },
};

export function BookingStatus({ status, timeUntilConcert }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.DEFAULT;
    const Icon = config.icon;

    return (
        <div
            className={`flex flex-col items-center justify-center text-center px-6 py-4 rounded-2xl ${config.bgColor} border-2 border-opacity-20 w-full`}
            style={{ borderColor: config.color }}
        >
            <Icon size={28} className={`${config.textColor} mb-2`} />
            <span className={`font-bold ${config.textColor} text-lg`}>
                {config.text}
            </span>
            {status === 'CONFIRMED' && (
                <span className="text-sm text-gray-600 mt-1">
                    공연까지 {timeUntilConcert}
                </span>
            )}
        </div>
    );
}
