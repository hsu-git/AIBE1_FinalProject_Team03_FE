export default function SeatLegend() {
    const items = [
        { label: 'Available', color: 'bg-green-500' },
        { label: 'Reserved', color: 'bg-yellow-500' },
        { label: 'Booked', color: 'bg-red-500' },
        { label: 'Unavailable', color: 'bg-gray-400' },
        { label: 'Selected', color: 'bg-purple-500 ring-2 ring-purple-700' },
    ];

    return (
        <div className="flex flex-wrap justify-center gap-4 p-4 bg-gray-100 rounded-lg">
            {items.map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2">
                    <span className={`w-5 h-5 ${color} rounded-md`} />
                    <span className="text-gray-700 text-sm">{label}</span>
                </div>
            ))}
        </div>
    );
}
