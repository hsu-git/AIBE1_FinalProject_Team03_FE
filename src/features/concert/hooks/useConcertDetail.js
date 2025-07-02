// src/features/concert/hooks/useConcertDetail.js

// React에서 제공하는 기본 훅들을 import
// useState: 컴포넌트의 상태(데이터)를 관리하는 훅
// useEffect: 컴포넌트가 렌더링된 후 특정 작업을 수행하는 훅 (API 호출 등)
// useCallback: 함수를 메모이제이션(캐싱)해서 불필요한 재생성을 방지하는 훅
import { useState, useEffect, useCallback } from 'react';

// 우리가 만든 콘서트 서비스 import (실제 API 호출 로직이 들어있음)
import { concertService } from '../services/concertService.js';

/**
 * 콘서트 상세 정보 관리를 위한 커스텀 React 훅
 *
 * 🎯 이 훅이 하는 일:
 * 1. 특정 콘서트의 상세 정보 상태 관리 (concert 객체)
 * 2. API 호출 중인지 상태 관리 (loading boolean)
 * 3. 에러 발생 시 에러 상태 관리 (error 객체/메시지)
 * 4. 콘서트 상세 정보를 가져오는 함수 제공 (fetchConcertDetail)
 * 5. AI 요약 정보를 가져오는 함수 제공 (fetchAISummary)
 * 6. 콘서트 정보 새로고침 함수 제공 (refreshConcert)
 *
 * 🔄 사용 방법:
 * const { concert, loading, error, fetchConcertDetail, aiSummary, fetchAISummary } = useConcertDetail();
 *
 * @param {number} concertId - 조회할 콘서트 ID (선택사항, 나중에 설정 가능)
 * @returns {Object} 콘서트 상세 관련 상태와 함수들이 담긴 객체
 */
export const useConcertDetail = (concertId = null) => {
    // ===== 상태(State) 정의 =====
    // React의 useState 훅을 사용해서 컴포넌트의 상태를 정의
    // useState는 [현재값, 값을 변경하는 함수] 배열을 반환

    // 콘서트 상세 정보를 저장하는 상태
    // 초기값: null (아직 데이터를 불러오지 않음)
    const [concert, setConcert] = useState(null);

    // AI 요약 정보를 저장하는 상태
    // 초기값: null (아직 AI 요약을 불러오지 않음)
    const [aiSummary, setAiSummary] = useState(null);

    // AI 요약 로딩 상태를 별도로 관리 (콘서트 정보와 AI 요약은 독립적으로 로딩될 수 있음)
    const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

    // API 호출 중인지 여부를 나타내는 상태
    // 초기값: false (로딩 중이 아님)
    const [loading, setLoading] = useState(false);

    // 에러 발생 시 에러 정보를 저장하는 상태
    // 초기값: null (에러 없음)
    const [error, setError] = useState(null);

    // 현재 조회 중인 콘서트 ID를 저장하는 상태
    // 파라미터로 받은 concertId 또는 나중에 설정된 ID
    const [currentConcertId, setCurrentConcertId] = useState(concertId);

    // ===== 함수 정의 =====

    /**
     * 콘서트 상세 정보를 가져오는 함수
     * useCallback으로 감싸서 불필요한 함수 재생성을 방지
     *
     * @param {number} id - 가져올 콘서트 ID (선택사항, 기본값은 currentConcertId)
     */
    const fetchConcertDetail = useCallback(
        async (id = currentConcertId) => {
            try {
                // concertId가 없으면 조회할 수 없음
                if (!id || id < 1) {
                    throw new Error('유효한 콘서트 ID가 필요합니다.');
                }

                // 로딩 시작: 사용자에게 "데이터 가져오는 중"임을 표시
                setLoading(true);

                // 이전 에러 상태 초기화: 새로운 요청이므로 기존 에러 제거
                setError(null);

                // 현재 조회 중인 콘서트 ID 업데이트
                setCurrentConcertId(id);

                // 실제 API 호출: concertService의 getConcertById 메서드 사용
                // 백엔드에서 특정 콘서트의 상세 정보를 받아옴
                const response = await concertService.getConcertById(id);

                // API 호출 성공 시 받아온 데이터로 상태 업데이트
                if (response && response.data) {
                    // 콘서트 상세 정보 설정
                    setConcert(response.data);

                    // 개발/디버깅용 로그: 어떤 콘서트 정보를 받았는지 확인
                    console.info(
                        `콘서트 상세 정보 로드 완료: ${response.data.title} (ID: ${id})`,
                    );
                } else {
                    // API 응답은 성공했지만 데이터 형식이 예상과 다른 경우
                    setConcert(null);
                    setError('콘서트 정보를 불러올 수 없습니다.');
                }
            } catch (err) {
                // API 호출 실패 시 에러 처리
                console.error(`콘서트 상세 조회 실패 (ID: ${id}):`, err);

                // 사용자에게 보여줄 친화적인 에러 메시지 설정
                setError(
                    err.message ||
                        '콘서트 정보를 불러오는 중 오류가 발생했습니다.',
                );

                // 에러 발생 시 콘서트 정보 초기화
                setConcert(null);
            } finally {
                // 성공/실패 상관없이 로딩 상태 해제
                // finally 블록은 try나 catch 실행 후 반드시 실행됨
                setLoading(false);
            }
        },
        [currentConcertId],
    ); // currentConcertId가 변경되면 함수 재생성

    /**
     * AI 요약 정보를 가져오는 함수
     * 콘서트 정보와 독립적으로 호출 가능
     *
     * @param {number} id - AI 요약을 가져올 콘서트 ID (선택사항, 기본값은 currentConcertId)
     */
    const fetchAISummary = useCallback(
        async (id = currentConcertId) => {
            try {
                // concertId가 없으면 조회할 수 없음
                if (!id || id < 1) {
                    throw new Error('유효한 콘서트 ID가 필요합니다.');
                }

                // AI 요약 로딩 시작: 콘서트 정보 로딩과 독립적으로 관리
                setAiSummaryLoading(true);

                // 실제 API 호출: concertService의 getAISummary 메서드 사용
                const response = await concertService.getAISummary(id);

                // API 호출 성공 시 받아온 데이터로 상태 업데이트
                if (response && response.data) {
                    // AI 요약 정보 설정
                    setAiSummary(response.data);

                    // 개발/디버깅용 로그: AI 요약 내용 일부 출력 (너무 길지 않게)
                    const summaryPreview =
                        response.data.length > 50
                            ? response.data.substring(0, 50) + '...'
                            : response.data;
                    console.info(
                        `AI 요약 로드 완료 (ID: ${id}): "${summaryPreview}"`,
                    );
                } else {
                    // AI 요약이 없는 경우 (정상적인 상황일 수 있음)
                    setAiSummary('AI 요약 정보가 아직 생성되지 않았습니다.');
                }
            } catch (err) {
                // AI 요약 조회 실패 시 에러 처리
                console.error(`AI 요약 조회 실패 (ID: ${id}):`, err);

                // AI 요약 실패는 전체 페이지를 망가뜨리지 않음 (부분적 실패)
                // 따라서 error 상태가 아닌 aiSummary에 실패 메시지 설정
                setAiSummary('AI 요약을 불러올 수 없습니다.');

                // 개발자를 위한 상세 에러 로그
                console.warn(
                    'AI 요약 조회 실패, 하지만 콘서트 정보는 정상 표시됩니다.',
                );
            } finally {
                // AI 요약 로딩 상태 해제
                setAiSummaryLoading(false);
            }
        },
        [currentConcertId],
    ); // currentConcertId가 변경되면 함수 재생성

    /**
     * 콘서트 정보와 AI 요약을 모두 새로고침하는 함수
     * 콘서트 정보가 업데이트되었을 때 사용 (예: 관리자가 정보 수정 후)
     *
     * @param {number} id - 새로고침할 콘서트 ID (선택사항, 기본값은 currentConcertId)
     */
    const refreshConcert = useCallback(
        async (id = currentConcertId) => {
            try {
                // concertId가 없으면 새로고침할 수 없음
                if (!id || id < 1) {
                    throw new Error('유효한 콘서트 ID가 필요합니다.');
                }

                // 콘서트 정보와 AI 요약을 병렬로 새로고침
                // Promise.all을 사용해서 두 API를 동시에 호출 (성능 향상)
                await Promise.all([
                    fetchConcertDetail(id), // 콘서트 상세 정보 새로고침
                    fetchAISummary(id), // AI 요약 새로고침
                ]);

                console.info(`콘서트 전체 정보 새로고침 완료 (ID: ${id})`);
            } catch (err) {
                // 새로고침 실패 시 에러 로그
                console.error(`콘서트 새로고침 실패 (ID: ${id}):`, err);

                // 에러는 각각의 fetchConcertDetail, fetchAISummary에서 처리되므로
                // 여기서는 추가적인 에러 처리 없이 로그만 남김
            }
        },
        [fetchConcertDetail, fetchAISummary, currentConcertId],
    ); // 의존하는 함수들이 변경되면 재생성

    /**
     * 콘서트 ID를 변경하는 함수
     * 같은 컴포넌트에서 다른 콘서트를 조회하고 싶을 때 사용
     *
     * @param {number} newConcertId - 새로운 콘서트 ID
     */
    const setConcertId = useCallback(
        (newConcertId) => {
            // 새로운 콘서트 ID가 유효한지 확인
            if (!newConcertId || newConcertId < 1) {
                console.warn('유효하지 않은 콘서트 ID입니다:', newConcertId);
                return;
            }

            // 현재 콘서트 ID와 같으면 불필요한 API 호출 방지
            if (newConcertId === currentConcertId) {
                console.info('같은 콘서트 ID이므로 API 호출을 건너뜁니다.');
                return;
            }

            // 이전 데이터 초기화 (새로운 콘서트를 로드하기 전에)
            setConcert(null);
            setAiSummary(null);
            setError(null);

            // 새로운 콘서트 ID 설정
            setCurrentConcertId(newConcertId);

            // 새로운 콘서트 정보 자동 로드
            // useEffect에서 currentConcertId 변경을 감지해서 자동으로 호출됨
        },
        [currentConcertId],
    ); // currentConcertId가 변경되면 함수 재생성

    // ===== 부수 효과(Side Effect) =====

    /**
     * currentConcertId가 변경될 때마다 자동으로 콘서트 정보를 가져오는 효과
     * useEffect: 컴포넌트 렌더링 후 실행되는 함수를 정의
     */
    useEffect(() => {
        // currentConcertId가 유효한 값일 때만 API 호출
        if (currentConcertId && currentConcertId > 0) {
            // 콘서트 상세 정보와 AI 요약을 모두 가져오기
            refreshConcert(currentConcertId);

            // 개발자를 위한 로그: 어떤 콘서트 ID로 데이터를 가져오는지 확인
            console.info(
                `콘서트 ID ${currentConcertId}의 정보를 자동 로드합니다.`,
            );
        }
    }, [currentConcertId, refreshConcert]); // currentConcertId나 refreshConcert가 변경되면 다시 실행

    /**
     * 컴포넌트가 언마운트(화면에서 사라질 때)될 때 정리 작업
     * 메모리 누수 방지를 위해 필요에 따라 사용
     */
    useEffect(() => {
        // 컴포넌트가 언마운트될 때 실행되는 정리 함수 반환
        return () => {
            // 현재는 특별한 정리 작업이 필요하지 않음
            // 필요하다면 여기서 타이머 정리, 이벤트 리스너 제거 등을 수행
            console.info('useConcertDetail 훅이 정리됩니다.');
        };
    }, []); // 빈 배열이므로 컴포넌트 마운트 시 한 번만 실행

    // ===== 반환값 =====

    /**
     * 이 훅을 사용하는 컴포넌트에게 제공할 상태와 함수들
     * 컴포넌트에서 구조 분해 할당으로 필요한 것만 가져다 쓸 수 있음
     */
    return {
        // 📊 데이터 상태
        concert, // 현재 로드된 콘서트 상세 정보 객체
        aiSummary, // AI 생성 요약 텍스트
        loading, // 콘서트 정보 로딩 중인지 여부 (true/false)
        aiSummaryLoading, // AI 요약 로딩 중인지 여부 (true/false)
        error, // 에러 메시지 (문자열 또는 null)

        // 🆔 상태 정보
        currentConcertId, // 현재 조회 중인 콘서트 ID

        // 🔧 액션 함수들 (컴포넌트에서 호출해서 상태 변경)
        fetchConcertDetail, // 콘서트 상세 정보만 새로고침
        fetchAISummary, // AI 요약만 새로고침
        refreshConcert, // 콘서트 정보와 AI 요약 모두 새로고침
        setConcertId, // 콘서트 ID 변경 (자동으로 새 정보 로드)

        // 🎛️ 편의 기능들
        isReady: !!concert && !loading, // 콘서트 정보가 준비되었는지 여부
        hasError: !!error, // 에러가 있는지 여부
        hasAISummary:
            !!aiSummary &&
            aiSummary !== 'AI 요약 정보가 아직 생성되지 않았습니다.' &&
            aiSummary !== 'AI 요약을 불러올 수 없습니다.', // 유효한 AI 요약이 있는지 여부
        isEmpty: !concert && !loading && !error, // 데이터가 비어있는지 (로딩 중이나 에러가 아닐 때)

        // 콘서트 상태별 편의 속성들 (concert가 있을 때만 사용 가능)
        isScheduled: concert?.status === 'SCHEDULED', // 예매 대기 상태인지
        isOnSale: concert?.status === 'ON_SALE', // 예매 중인지
        isSoldOut: concert?.status === 'SOLD_OUT', // 매진인지
        isCancelled: concert?.status === 'CANCELLED', // 취소된지
        isCompleted: concert?.status === 'COMPLETED', // 완료된지
    };
};
