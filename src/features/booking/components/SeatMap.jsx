// src/features/booking/components/SeatMap.jsx
import React from 'react';

export default function SeatMap({
    seatStatuses = [],
    selectedSeat,
    onSeatClick,
    isReserving,
}) {
    // 1) section → row → [seats] 구조로 그룹핑 (num은 숫자 타입)
    const sections = seatStatuses.reduce((acc, s) => {
        const [sec, row, numStr] = s.seatInfo.split('-');
        const num = parseInt(numStr, 10);
        if (!acc[sec]) acc[sec] = {};
        if (!acc[sec][row]) acc[sec][row] = [];
        acc[sec][row].push({ ...s, num });
        return acc;
    }, {});

    return (
        <div className="space-y-12">
            {Object.keys(sections)
                .sort() // 섹션 A, B, …
                .map((sec) => {
                    const rows = sections[sec];

                    return (
                        <div key={sec}>
                            <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">
                                {sec} 구역
                            </h3>

                            {/* 각 행(Row)별 렌더링 */}
                            {Object.keys(rows)
                                .map((r) => parseInt(r, 10))
                                .sort((a, b) => a - b) // 숫자 순 정렬
                                .map((rowNum) => {
                                    const seatsInRow = rows[rowNum];

                                    // 2) 이 행의 최대 좌석 번호(열 수)
                                    const maxCol = Math.max(
                                        ...seatsInRow.map((s) => s.num),
                                    );

                                    // 3) 번호별로 매핑: 빈 칸은 null
                                    const seatMap = {};
                                    seatsInRow.forEach((s) => {
                                        seatMap[s.num] = s;
                                    });

                                    return (
                                        <div key={rowNum} className="mb-6">
                                            <h4 className="text-sm font-medium mb-2 text-gray-600">
                                                {rowNum}열
                                            </h4>
                                            <div
                                                className="grid gap-2 justify-center"
                                                style={{
                                                    gridTemplateColumns: `repeat(${maxCol}, minmax(0, 1fr))`,
                                                }}
                                            >
                                                {Array.from(
                                                    { length: maxCol },
                                                    (_, idx) => {
                                                        const col = idx + 1;
                                                        const seat =
                                                            seatMap[col];

                                                        if (!seat) {
                                                            // 빈 자리 placeholder
                                                            return (
                                                                <div
                                                                    key={`empty-${rowNum}-${col}`}
                                                                    className="w-10 h-10"
                                                                />
                                                            );
                                                        }

                                                        // 실제 좌석 셀
                                                        const isSel =
                                                            selectedSeat?.seatId ===
                                                            seat.seatId;
                                                        let base =
                                                            'w-10 h-10 flex items-center justify-center rounded text-sm font-bold cursor-pointer transition';
                                                        if (isSel) {
                                                            base +=
                                                                ' bg-purple-500 ring-2 ring-purple-700';
                                                        } else if (
                                                            seat.status ===
                                                            'AVAILABLE'
                                                        ) {
                                                            base +=
                                                                ' bg-green-500 hover:bg-green-600';
                                                        } else if (
                                                            seat.status ===
                                                            'RESERVED'
                                                        ) {
                                                            base +=
                                                                ' bg-yellow-500 cursor-not-allowed';
                                                        } else if (
                                                            seat.status ===
                                                            'BOOKED'
                                                        ) {
                                                            base +=
                                                                ' bg-red-500 cursor-not-allowed';
                                                        } else {
                                                            base +=
                                                                ' bg-gray-400 cursor-not-allowed';
                                                        }

                                                        return (
                                                            <div
                                                                key={
                                                                    seat.seatId
                                                                }
                                                                className={base}
                                                                onClick={() =>
                                                                    !isReserving &&
                                                                    onSeatClick(
                                                                        seat,
                                                                    )
                                                                }
                                                            >
                                                                {seat.num}
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    );
                })}
        </div>
    );
}
