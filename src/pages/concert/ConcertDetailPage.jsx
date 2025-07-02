// src/pages/concert/ConcertDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchConcertDetail,
  enterWaitingQueue
} from '../../features/concert/services/concertService';

function ConcertDetailPage() {
  const { concertId } = useParams();
  const navigate = useNavigate();
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    async function getConcertDetail() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchConcertDetail(concertId);
        setConcert(response);
      } catch (err) {
        console.error('콘서트 상세 정보를 가져오는 데 실패했습니다:', err);
        setError(err.message || '콘서트 상세 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }
    getConcertDetail();
  }, [concertId]);

  const handleReserveClick = async () => {
    setIsEntering(true);
    try {
      const response = await enterWaitingQueue(concertId);

      // 백엔드 응답의 status에 따라 분기
      switch (response.status) {
        case 'WAITING':
          // 대기열로 이동
          console.log(`대기열 진입. 순번: ${response.rank}`);
          navigate(`/concerts/${concertId}/wait`, {
            state: { rank: response.rank }
          });
          break;

        case 'IMMEDIATE_ENTRY':
          // 즉시 입장. accessKey 저장 후 예매 페이지로 이동
          console.log('즉시 입장 허가. Access Key 수신.');
          sessionStorage.setItem(`accessKey-${concertId}`, response.accessKey);
          navigate(`/concerts/${concertId}/reserve`);
          break;

        case 'ERROR':
          // 백엔드가 보낸 에러 메시지 표시
          console.error(`에러 발생: ${response.message}`);
          alert(response.message);
          break;

        default:
          // 예상치 못한 상태값 처리
          console.warn(`알 수 없는 응답 상태: ${response.status}`);
          alert('알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('대기열 진입 요청 실패:', err);
      alert(err.message || '요청 처리 중 오류가 발생했습니다.');
    } finally {
      setIsEntering(false);
    }
  };

  if (loading)
    return <div className="text-center py-10">콘서트 상세 정보 로딩 중...</div>;
  if (error)
    return <div className="text-center text-red-500 py-10">에러: {error}</div>;
  if (!concert)
    return (
      <div className="text-center text-gray-500 py-10">
        콘서트 정보를 찾을 수 없습니다.
      </div>
    );

  return (
    <div className="max-w-6xl  mx-auto p-6 overflow-x-hidden">
      <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center break-words">
        {concert.title}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 좌측 상세 콘텐츠 */}
        <div className="lg:sticky ... h-fit min-w-0">
          <div className="flex flex-col md:flex-row gap-6">
            {/* <div className="md:w-1/2">
              {concert.posterImageUrl ? (
                <img
                  src={concert.posterImageUrl}
                  alt={concert.title}
                  className=" h-auto object-cover rounded-xl shadow-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      'https://placehold.co/600x400/cccccc/333333?text=No+Image';
                  }}
                />
              ) : (
                <div className=" h-80 bg-gray-200 flex items-center justify-center rounded-xl text-gray-500">
                  <span className="text-xl">포스터 없음</span>
                </div>
              )}
            </div> */}
            <div className="md:w-1/2 space-y-3 text-gray-700 break-words">
              <p>
                <strong>아티스트:</strong> {concert.artist}
              </p>
              <p>
                <strong>공연장:</strong> {concert.venueName}
              </p>
              <p>
                <strong>주소:</strong> {concert.venueAddress}
              </p>
              <p>
                <strong>공연 날짜:</strong> {concert.concertDate}
              </p>
              <p>
                <strong>공연 시간:</strong> {concert.startTime} ~{' '}
                {concert.endTime}
              </p>
              <p>
                <strong>총 좌석 수:</strong> {concert.totalSeats}석
              </p>
              <p>
                <strong>예매 시작:</strong>{' '}
                {new Date(concert.bookingStartDate).toLocaleString()}
              </p>
              <p>
                <strong>예매 종료:</strong>{' '}
                {new Date(concert.bookingEndDate).toLocaleString()}
              </p>
              {concert.aiSummary && (
                <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-lg">
                  <strong className="block mb-1">AI 요약:</strong>
                  <p className="text-sm leading-relaxed">{concert.aiSummary}</p>
                </div>
              )}
            </div>
          </div>

          {/* 후기 섹션 */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              콘서트 후기
            </h2>
            <p className="text-gray-600">
              콘서트 후기 섹션은 추후 구현될 예정입니다.
            </p>
          </div>

          {/* 기대평 섹션 */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              콘서트 기대평
            </h2>
            <p className="text-gray-600">
              콘서트 기대평 섹션은 추후 구현될 예정입니다.
            </p>
          </div>
        </div>

        {/* 우측 티켓 정보 사이드바 */}
        <div className="lg:sticky lg:top-24 lg:self-start bg-blue-50 p-6 rounded-xl shadow-md space-y-4 h-fit">
          <h2 className="text-xl font-bold text-blue-900">티켓 등급 및 가격</h2>
          {[
            { type: '일반석', price: 50000 },
            { type: 'VIP', price: 100000 },
            { type: '프리미엄', price: 150000 }
          ].map((ticket) => (
            <div
              key={ticket.type}
              className="flex justify-between bg-white px-4 py-3 rounded-lg shadow-sm"
            >
              <span className="text-sm font-semibold text-gray-700">
                {ticket.type}
              </span>
              <span className="text-blue-600 font-bold">
                {ticket.price.toLocaleString()}원
              </span>
            </div>
          ))}
          <button
            onClick={handleReserveClick}
            disabled={isEntering}
            className=" mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition hover:scale-[1.02]"
          >
            {isEntering ? '처리 중...' : '예매하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConcertDetailPage;
