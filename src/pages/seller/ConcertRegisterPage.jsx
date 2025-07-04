import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import ConcertForm from '../../features/seller/components/ConcertForm.jsx';

const ConcertRegisterPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    // 판매자 권한 확인
    const sellerId = user?.userId; // 또는 user?.sellerId가 별도로 있다면 그것 사용

    // 로그인하지 않았거나 판매자가 아닌 경우 처리
    if (!user) {
        return (
            <div className="p-6 bg-[#111922] text-white min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        접근 권한이 없습니다
                    </h2>
                    <p className="mb-4">
                        콘서트 등록은 로그인한 판매자만 가능합니다.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        로그인하기
                    </button>
                </div>
            </div>
        );
    }

    // 콘서트 등록 성공 시 콜백
    const handleConcertSuccess = (newConcert) => {
        console.log('콘서트 등록 성공:', newConcert);

        // 성공 메시지 표시
        alert(`"${newConcert.title}" 콘서트가 성공적으로 등록되었습니다!`);

        // 등록된 콘서트 상세 페이지로 이동
        navigate('/seller/concerts');
    };

    // 콘서트 등록 취소 시 (뒤로가기 등)
    const handleConcertCancel = () => {
        // 콘서트 목록 페이지로 이동하거나 이전 페이지로
        navigate('/concerts');
    };

    return (
        <div className="p-6 bg-[#111922] text-white min-h-screen">
            {/* 기존 헤더 유지 */}
            <h2 className="text-3xl font-bold mb-4">콘서트 등록</h2>
            <p className="mb-8 text-gray-300">
                새로운 콘서트 정보를 등록하는 페이지입니다.
            </p>

            {/* 콘서트 등록 폼을 바로 표시 */}
            <div className="max-w-4xl mx-auto">
                <ConcertForm
                    isOpen={true} // 항상 열려있음
                    modal={false}
                    onClose={handleConcertCancel}
                    onSuccess={handleConcertSuccess}
                    concert={null} // 생성 모드이므로 null
                    sellerId={sellerId}
                />
            </div>
        </div>
    );
};

export default ConcertRegisterPage;
