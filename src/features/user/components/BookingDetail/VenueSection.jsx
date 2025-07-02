import { MapPin, Phone, Navigation } from 'lucide-react';

export function VenueSection({ venueName, venueAddress, onGetDirections }) {
    return (
        <div className="bg-gray-800 rounded-3xl p-8 hover:bg-gray-750 transition-colors">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
                <MapPin className="mr-3 text-red-400" size={24} />
                공연장 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center text-center">
                    <p className="text-xl font-bold mb-2">{venueName}</p>
                    <p className="text-gray-300 leading-relaxed">
                        {venueAddress}
                    </p>
                </div>
                <div className="flex flex-col space-y-3">
                    <button
                        onClick={onGetDirections}
                        className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl transition-colors"
                    >
                        <Navigation size={18} />
                        <span>길찾기</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-xl transition-colors">
                        <Phone size={18} />
                        <span>공연장 전화</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
