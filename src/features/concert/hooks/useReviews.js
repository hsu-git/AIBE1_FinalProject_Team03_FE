// src/features/concert/hooks/useReviews.js

import { useState, useEffect, useCallback } from 'react';
import { reviewService } from '../services/reviewService.js';
import { ReviewDefaults } from '../types/review.js';

export const useReviews = (concertId) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(ReviewDefaults.pageSize);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [sortBy, setSortBy] = useState(ReviewDefaults.sortBy);
    const [sortDir, setSortDir] = useState(ReviewDefaults.sortDir);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchReviews = useCallback(
        async (params = {}) => {
            try {
                if (!concertId || concertId < 1) {
                    throw new Error('유효한 콘서트 ID가 필요합니다.');
                }

                setLoading(true);
                setError(null);

                const requestParams = {
                    concertId,
                    page: params.page ?? currentPage,
                    size: params.size ?? pageSize,
                    sortBy: params.sortBy ?? sortBy,
                    sortDir: params.sortDir ?? sortDir,
                };

                const response =
                    await reviewService.getConcertReviews(requestParams);

                if (response && response.data) {
                    setReviews(response.data.content || []);
                    setCurrentPage(response.data.number || 0);
                    setTotalPages(response.data.totalPages || 0);
                    setTotalElements(response.data.totalElements || 0);
                    setPageSize(response.data.size || ReviewDefaults.pageSize);
                    setSortBy(requestParams.sortBy);
                    setSortDir(requestParams.sortDir);

                    console.info(
                        `리뷰 목록 로드 완료: ${response.data.content?.length || 0}개 (콘서트 ID: ${concertId})`,
                    );
                } else {
                    setReviews([]);
                    setError('리뷰 데이터를 불러올 수 없습니다.');
                }
            } catch (err) {
                console.error(
                    `리뷰 목록 조회 실패 (콘서트 ID: ${concertId}):`,
                    err,
                );
                setError(
                    err.message ||
                        '리뷰 목록을 불러오는 중 오류가 발생했습니다.',
                );
                setReviews([]);
            } finally {
                setLoading(false);
            }
        },
        [concertId],
    );

    const createReview = useCallback(
        async (reviewData) => {
            try {
                if (!concertId || concertId < 1) {
                    throw new Error('유효한 콘서트 ID가 필요합니다.');
                }

                setActionLoading(true);
                setError(null);

                const response = await reviewService.createReview(
                    concertId,
                    reviewData,
                );
                await fetchReviews({ page: 0 });

                console.info(
                    `리뷰 작성 완료: "${reviewData.title}" (콘서트 ID: ${concertId})`,
                );
                return response.data;
            } catch (err) {
                console.error(`리뷰 작성 실패 (콘서트 ID: ${concertId}):`, err);
                setError(err.message || '리뷰 작성 중 오류가 발생했습니다.');
                throw err;
            } finally {
                setActionLoading(false);
            }
        },
        [concertId, fetchReviews],
    );

    /**
     * 🔧 수정된 updateReview 함수 - 파라미터 순서 수정
     */
    const updateReview = useCallback(
        async (reviewId, reviewData) => {
            try {
                // 🔍 디버깅: 파라미터 확인
                console.log('🔍 useReviews.updateReview 호출됨:');
                console.log('  - reviewId:', reviewId, typeof reviewId);
                console.log('  - reviewData:', reviewData, typeof reviewData);

                // ID 파라미터 유효성 검증
                if (!concertId || concertId < 1) {
                    throw new Error('유효한 콘서트 ID가 필요합니다.');
                }
                if (!reviewId || reviewId < 1) {
                    throw new Error('유효한 리뷰 ID가 필요합니다.');
                }

                // reviewData가 객체인지 확인
                if (!reviewData || typeof reviewData !== 'object') {
                    throw new Error('유효한 리뷰 데이터가 필요합니다.');
                }

                setActionLoading(true);
                setError(null);

                // 🔧 수정: 올바른 순서로 파라미터 전달
                const response = await reviewService.updateReview(
                    concertId,
                    reviewId,
                    reviewData,
                );

                await fetchReviews();

                console.info(
                    `리뷰 수정 완료: ID ${reviewId} (콘서트 ID: ${concertId})`,
                );
                return response.data;
            } catch (err) {
                console.error(`리뷰 수정 실패 (리뷰 ID: ${reviewId}):`, err);
                setError(err.message || '리뷰 수정 중 오류가 발생했습니다.');
                throw err;
            } finally {
                setActionLoading(false);
            }
        },
        [concertId, fetchReviews],
    );

    const deleteReview = useCallback(
        async (reviewId) => {
            try {
                if (!concertId || concertId < 1) {
                    throw new Error('유효한 콘서트 ID가 필요합니다.');
                }
                if (!reviewId || reviewId < 1) {
                    throw new Error('유효한 리뷰 ID가 필요합니다.');
                }

                setActionLoading(true);
                setError(null);

                await reviewService.deleteReview(concertId, reviewId);

                const currentReviewCount = reviews.length;
                if (currentReviewCount === 1 && currentPage > 0) {
                    await fetchReviews({ page: currentPage - 1 });
                } else {
                    await fetchReviews();
                }

                console.info(
                    `리뷰 삭제 완료: ID ${reviewId} (콘서트 ID: ${concertId})`,
                );
            } catch (err) {
                console.error(`리뷰 삭제 실패 (리뷰 ID: ${reviewId}):`, err);
                setError(err.message || '리뷰 삭제 중 오류가 발생했습니다.');
                throw err;
            } finally {
                setActionLoading(false);
            }
        },
        [concertId, fetchReviews, reviews.length, currentPage],
    );

    const goToPage = useCallback(
        async (newPage) => {
            if (newPage < 0 || newPage >= totalPages) {
                console.warn(
                    `유효하지 않은 페이지 번호: ${newPage} (범위: 0-${totalPages - 1})`,
                );
                return;
            }

            if (newPage === currentPage) {
                console.info('같은 페이지이므로 API 호출을 건너뜁니다.');
                return;
            }

            await fetchReviews({ page: newPage });
        },
        [fetchReviews, totalPages, currentPage],
    );

    const changeSorting = useCallback(
        async (newSortBy, newSortDir = 'desc') => {
            const allowedSortFields = ['createdAt', 'rating', 'title'];
            if (!allowedSortFields.includes(newSortBy)) {
                console.warn(`유효하지 않은 정렬 기준: ${newSortBy}`);
                return;
            }

            const allowedSortDirections = ['asc', 'desc'];
            if (!allowedSortDirections.includes(newSortDir)) {
                console.warn(`유효하지 않은 정렬 방향: ${newSortDir}`);
                return;
            }

            if (newSortBy === sortBy && newSortDir === sortDir) {
                console.info('같은 정렬 방식이므로 API 호출을 건너뜁니다.');
                return;
            }

            await fetchReviews({
                page: 0,
                sortBy: newSortBy,
                sortDir: newSortDir,
            });
        },
        [fetchReviews, sortBy, sortDir],
    );

    const changePageSize = useCallback(
        async (newSize) => {
            if (newSize < 1 || newSize > 100) {
                console.warn(
                    `유효하지 않은 페이지 크기: ${newSize} (범위: 1-100)`,
                );
                return;
            }

            if (newSize === pageSize) {
                console.info('같은 페이지 크기이므로 API 호출을 건너뜁니다.');
                return;
            }

            await fetchReviews({
                page: 0,
                size: newSize,
            });
        },
        [fetchReviews, pageSize],
    );

    useEffect(() => {
        if (concertId && concertId > 0) {
            fetchReviews({
                page: 0,
                size: ReviewDefaults.pageSize,
                sortBy: sortBy,
                sortDir: sortDir,
            });

            console.info(
                `콘서트 ID ${concertId}의 리뷰 목록을 자동 로드합니다.`,
            );
        }
    }, [concertId]);

    return {
        reviews,
        loading,
        actionLoading,
        error,
        currentPage,
        totalPages,
        totalElements,
        pageSize,
        sortBy,
        sortDir,
        fetchReviews,
        createReview,
        updateReview,
        deleteReview,
        goToPage,
        changeSorting,
        changePageSize,
        refresh: () => fetchReviews(),
        hasNextPage: currentPage < totalPages - 1,
        hasPrevPage: currentPage > 0,
        isEmpty: reviews.length === 0 && !loading,
        isFirstPage: currentPage === 0,
        isLastPage: currentPage === totalPages - 1,
        isSortedByDate: sortBy === 'createdAt',
        isSortedByRating: sortBy === 'rating',
        isSortedByTitle: sortBy === 'title',
        isAscending: sortDir === 'asc',
        isDescending: sortDir === 'desc',
    };
};
