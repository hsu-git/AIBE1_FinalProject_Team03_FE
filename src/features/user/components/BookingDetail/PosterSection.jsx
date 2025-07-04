import React from 'react';
import { Calendar } from 'lucide-react';
import { BookingStatus } from './BookingStatus';
import { formatDate } from '../../services/bookingDetailService';

const formatTime = (timeStr) => {
    const [hour, minute] = timeStr.split(':');
    return `${parseInt(hour, 10)}시 ${parseInt(minute, 10)}분`;
};

export function PosterSection({
    posterImageUrl,
    concertTitle,
    artistName,
    concertDate,
    startTime,
    endTime,
    bookingStatus,
    timeUntilConcert,
}) {
    return (
        <div className="xl:col-span-1">
            <div className="bg-gray-800 rounded-3xl p-6 sticky top-6">
                <div className="h-[400px] sm:h-[320px] xs:h-[260px] w-full mb-6 rounded-2xl overflow-hidden shadow-2xl mx-auto">
                    <img
                        src={posterImageUrl || `/images/basic-poster-image.png`}
                        alt={concertTitle}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.currentTarget.src =
                                '/images/basic-poster-image.png';
                        }}
                    />
                </div>

                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2 leading-tight text-white">
                        {artistName}
                    </h2>
                    <p className="text-gray-400 text-sm break-words mb-4">
                        {concertDate}
                    </p>

                    <div className="bg-gray-700 rounded-xl px-4 py-3 mb-4 space-y-1">
                        <div className="flex items-center justify-center space-x-2">
                            <Calendar size={16} className="text-blue-400" />
                            <span className="text-sm text-gray-300 font-medium">
                                공연일
                            </span>
                        </div>
                        <p className="font-bold text-white text-sm sm:text-base break-words">
                            {formatDate(concertDate)}
                        </p>
                        <p className="text-gray-300 text-sm">
                            {formatTime(startTime)} - {formatTime(endTime)}
                        </p>
                    </div>
                </div>

                <div className="mt-4">
                    <BookingStatus
                        status={bookingStatus}
                        timeUntilConcert={timeUntilConcert}
                    />
                </div>
            </div>
        </div>
    );
}
