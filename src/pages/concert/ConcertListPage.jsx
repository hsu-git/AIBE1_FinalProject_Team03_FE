// src/pages/concert/ConcertListPage.jsx
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// 새로운 컴포넌트들 import
import ConcertList from '../../features/concert/components/ConcertList.jsx';
import SearchBar from '../../features/concert/components/SearchBar.jsx';
import FilterPanel from '../../features/concert/components/FilterPanel.jsx';

// 새로운 hooks import
import { useConcerts } from '../../features/concert/hooks/useConcerts.js';

function ConcertListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // URL 쿼리 파라미터에서 값들 추출
    const query = searchParams.get('query') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';

    // 콘서트 목록 hook
    const {
        concerts,
        loading,
        error,
        currentPage,
        totalPages,
        totalElements,
        fetchConcerts,
        searchConcerts,
        filterConcerts,
        goToPage,
        changePageSize,
    } = useConcerts();

    // 콘서트 카드 클릭 핸들러 (상세 페이지로 이동)
    const handleConcertClick = (concert) => {
        navigate(`/concerts/${concert.concertId}`);
    };

    // 검색 실행 핸들러
    const handleSearch = async (searchKeyword) => {
        try {
            // URL 파라미터 업데이트
            const newSearchParams = new URLSearchParams();
            if (searchKeyword && searchKeyword.trim()) {
                newSearchParams.set('query', searchKeyword.trim());
                await searchConcerts(searchKeyword.trim());
            } else {
                await fetchConcerts();
            }
            setSearchParams(newSearchParams);
        } catch (err) {
            console.error('검색 실패:', err);
        }
    };

    // 검색어 지우기 핸들러 (추가)
    const handleClearSearch = () => {
        // URL 파라미터에서 query 제거
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('query');
        setSearchParams(newSearchParams);

        // 전체 콘서트 목록 다시 로드
        fetchConcerts();

        console.log('검색 완전히 초기화됨');
    };

    // 필터 적용 핸들러
    const handleFilter = async (filterParams) => {
        try {
            // 빈 값들 제거
            const cleanFilterParams = {};
            if (filterParams.startDate)
                cleanFilterParams.startDate = filterParams.startDate;
            if (filterParams.endDate)
                cleanFilterParams.endDate = filterParams.endDate;
            if (filterParams.priceMin)
                cleanFilterParams.priceMin = parseInt(filterParams.priceMin);
            if (filterParams.priceMax)
                cleanFilterParams.priceMax = parseInt(filterParams.priceMax);

            // URL 파라미터 업데이트
            const newSearchParams = new URLSearchParams();
            Object.entries(cleanFilterParams).forEach(([key, value]) => {
                if (value) newSearchParams.set(key, value.toString());
            });

            if (Object.keys(cleanFilterParams).length > 0) {
                await filterConcerts(cleanFilterParams);
            } else {
                // 필터가 없으면 전체 목록 조회
                await fetchConcerts();
            }

            setSearchParams(newSearchParams);
        } catch (err) {
            console.error('필터링 실패:', err);
        }
    };

    // 페이지 변경 핸들러
    const handlePageChange = (newPage) => {
        goToPage(newPage);
    };

    // 새로고침 핸들러
    const handleRefresh = () => {
        // 현재 URL 파라미터에 따라 적절한 API 호출
        if (query) {
            searchConcerts(query);
        } else if (startDate || endDate || minPrice || maxPrice) {
            const filterParams = {};
            if (startDate) filterParams.startDate = startDate;
            if (endDate) filterParams.endDate = endDate;
            if (minPrice) filterParams.priceMin = parseInt(minPrice);
            if (maxPrice) filterParams.priceMax = parseInt(maxPrice);
            filterConcerts(filterParams);
        } else {
            fetchConcerts();
        }
    };

    // 초기 필터 값들 (URL 파라미터 기반)
    const initialFilters = {
        startDate: startDate,
        endDate: endDate,
        priceMin: minPrice,
        priceMax: maxPrice,
    };

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
                모든 콘서트
            </h1>

            {/* 검색 바 컴포넌트 */}
            <div className="bg-white p-4 rounded-lg shadow-md">
                <SearchBar
                    onSearch={handleSearch}
                    onClear={handleClearSearch} // 🔥 onClear prop 추가
                    loading={loading}
                    placeholder="콘서트 제목, 아티스트, 장소 검색..."
                    autoFocus={false}
                />
            </div>

            {/* 필터 패널 컴포넌트 */}
            <div className="bg-white rounded-lg shadow-md">
                <FilterPanel
                    onFilter={handleFilter}
                    initialFilters={initialFilters}
                    loading={loading}
                    compact={false}
                />
            </div>

            {/* 검색/필터 결과 표시 */}
            {concerts.length > 0 &&
                (query || startDate || endDate || minPrice || maxPrice) && (
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-blue-800 mb-1">
                                    {query
                                        ? `"${query}" 검색 결과`
                                        : '필터링 결과'}
                                </h3>
                                <p className="text-sm text-blue-600">
                                    총 {totalElements}개의 콘서트를 찾았습니다.
                                    {startDate && ` | 시작일: ${startDate}`}
                                    {endDate && ` | 종료일: ${endDate}`}
                                    {minPrice &&
                                        ` | 최소가격: ${parseInt(minPrice).toLocaleString()}원`}
                                    {maxPrice &&
                                        ` | 최대가격: ${parseInt(maxPrice).toLocaleString()}원`}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setSearchParams(new URLSearchParams());
                                    fetchConcerts();
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                전체 보기
                            </button>
                        </div>
                    </div>
                )}

            {/* 콘서트 목록 컴포넌트 */}
            <div className="bg-white rounded-lg shadow-md">
                <ConcertList
                    concerts={concerts}
                    loading={loading}
                    error={error}
                    onConcertClick={handleConcertClick}
                    onPageChange={handlePageChange}
                    onRetry={handleRefresh}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    showAiSummary={true} // AI 요약 표시
                    showPagination={true}
                    emptyMessage={
                        query
                            ? `"${query}"에 대한 검색 결과가 없습니다.`
                            : startDate || endDate || minPrice || maxPrice
                              ? '필터 조건에 맞는 콘서트가 없습니다.'
                              : '등록된 콘서트가 없습니다.'
                    }
                />
            </div>

            {/* 페이지 하단 정보 */}
            <div className="text-center text-gray-500 text-sm">
                <p>
                    총 {totalElements}개의 콘서트 중 {currentPage + 1} /{' '}
                    {totalPages} 페이지
                </p>
            </div>
        </div>
    );
}

export default ConcertListPage;
