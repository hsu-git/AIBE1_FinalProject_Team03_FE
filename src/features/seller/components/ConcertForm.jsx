import React, { useState, useEffect } from 'react';
import {
    X,
    Calendar,
    Clock,
    MapPin,
    Users,
    Image,
    AlertCircle,
    CheckCircle,
} from 'lucide-react';

/**
 * ConcertForm.jsx
 *
 * 판매자용 콘서트 등록/수정 폼 컴포넌트
 * - 백엔드 SellerConcertController의 API와 완전히 일치
 * - POST /api/seller/concerts (생성)
 * - PUT /api/seller/concerts/{concertId} (수정)
 * - 백엔드 DTO 검증 규칙과 동일한 클라이언트 검증
 */
const ConcertForm = ({
    isOpen,
    onClose,
    onSuccess,
    concert = null, // 수정 모드일 때 기존 콘서트 데이터
    sellerId,
}) => {
    // ====== 상태 관리 ======
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');

    // 폼 데이터 - 백엔드 DTO와 완전히 일치
    const [formData, setFormData] = useState({
        // 필수 필드들 (SellerConcertCreateDTO)
        title: '',
        artist: '',
        venueName: '',
        concertDate: '',
        startTime: '',
        endTime: '',
        totalSeats: '',
        bookingStartDate: '',
        bookingEndDate: '',

        // 선택 필드들
        description: '',
        venueAddress: '',
        minAge: 0,
        maxTicketsPerUser: 4,
        posterImageUrl: '',

        // 수정 모드에서만 사용
        status: 'SCHEDULED',
    });

    const isEditMode = !!concert;

    // ====== 초기화 ======
    useEffect(() => {
        if (isEditMode && concert) {
            // 수정 모드: 기존 데이터로 폼 초기화
            setFormData({
                title: concert.title || '',
                artist: concert.artist || '',
                description: concert.description || '',
                venueName: concert.venueName || '',
                venueAddress: concert.venueAddress || '',
                concertDate: concert.concertDate || '',
                startTime: concert.startTime || '',
                endTime: concert.endTime || '',
                totalSeats: concert.totalSeats?.toString() || '',
                bookingStartDate: concert.bookingStartDate
                    ? new Date(concert.bookingStartDate)
                          .toISOString()
                          .slice(0, 16)
                    : '',
                bookingEndDate: concert.bookingEndDate
                    ? new Date(concert.bookingEndDate)
                          .toISOString()
                          .slice(0, 16)
                    : '',
                minAge: concert.minAge || 0,
                maxTicketsPerUser: concert.maxTicketsPerUser || 4,
                posterImageUrl: concert.posterImageUrl || '',
                status: concert.status || 'SCHEDULED',
            });
        } else {
            // 생성 모드: 기본값으로 초기화
            setFormData({
                title: '',
                artist: '',
                description: '',
                venueName: '',
                venueAddress: '',
                concertDate: '',
                startTime: '',
                endTime: '',
                totalSeats: '',
                bookingStartDate: '',
                bookingEndDate: '',
                minAge: 0,
                maxTicketsPerUser: 4,
                posterImageUrl: '',
                status: 'SCHEDULED',
            });
        }

        setErrors({});
        setSubmitError('');
        setSubmitSuccess('');
    }, [isEditMode, concert, isOpen]);

    // ====== 입력 핸들러 ======
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // 해당 필드의 에러 클리어
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    // ====== 클라이언트 검증 (백엔드 DTO 검증과 동일) ======
    const validateForm = () => {
        const newErrors = {};

        // 필수 문자열 필드 검증 (NotBlank)
        if (!formData.title?.trim()) {
            newErrors.title = '콘서트 제목은 필수입니다';
        } else if (formData.title.trim().length > 100) {
            newErrors.title = '콘서트 제목은 100자 이하여야 합니다';
        }

        if (!formData.artist?.trim()) {
            newErrors.artist = '아티스트명은 필수입니다';
        } else if (formData.artist.trim().length > 50) {
            newErrors.artist = '아티스트명은 50자 이하여야 합니다';
        }

        if (!formData.venueName?.trim()) {
            newErrors.venueName = '공연장명은 필수입니다';
        } else if (formData.venueName.trim().length > 100) {
            newErrors.venueName = '공연장명은 100자 이하여야 합니다';
        }

        // 선택 문자열 필드 길이 검증
        if (formData.description && formData.description.length > 1000) {
            newErrors.description = '콘서트 설명은 1000자 이하여야 합니다';
        }

        if (formData.venueAddress && formData.venueAddress.length > 200) {
            newErrors.venueAddress = '공연장 주소는 200자 이하여야 합니다';
        }

        // 날짜 필드 검증 (NotNull, Future)
        if (!formData.concertDate) {
            newErrors.concertDate = '콘서트 날짜는 필수입니다';
        } else {
            const concertDate = new Date(formData.concertDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (concertDate <= today) {
                newErrors.concertDate =
                    '콘서트 날짜는 현재 날짜보다 이후여야 합니다';
            }
        }

        // 시간 필드 검증 (NotNull)
        if (!formData.startTime) {
            newErrors.startTime = '시작 시간은 필수입니다';
        }

        if (!formData.endTime) {
            newErrors.endTime = '종료 시간은 필수입니다';
        }

        // 시간 순서 검증
        if (formData.startTime && formData.endTime) {
            if (formData.endTime <= formData.startTime) {
                newErrors.endTime = '종료 시간은 시작 시간보다 늦어야 합니다';
            }
        }

        // 좌석 수 검증 (NotNull, Positive, Max)
        if (!formData.totalSeats) {
            newErrors.totalSeats = '총 좌석 수는 필수입니다';
        } else {
            const seats = parseInt(formData.totalSeats);
            if (isNaN(seats) || seats <= 0) {
                newErrors.totalSeats = '총 좌석 수는 양수여야 합니다';
            } else if (seats > 100000) {
                newErrors.totalSeats = '총 좌석 수는 100,000석 이하여야 합니다';
            }
        }

        // 예매 일시 검증 (NotNull, Future)
        if (!formData.bookingStartDate) {
            newErrors.bookingStartDate = '예매 시작일시는 필수입니다';
        } else {
            const bookingStart = new Date(formData.bookingStartDate);
            const now = new Date();

            if (bookingStart <= now) {
                newErrors.bookingStartDate =
                    '예매 시작일시는 현재 시간보다 이후여야 합니다';
            }
        }

        if (!formData.bookingEndDate) {
            newErrors.bookingEndDate = '예매 종료일시는 필수입니다';
        } else {
            const bookingEnd = new Date(formData.bookingEndDate);
            const now = new Date();

            if (bookingEnd <= now) {
                newErrors.bookingEndDate =
                    '예매 종료일시는 현재 시간보다 이후여야 합니다';
            }
        }

        // 예매 시간 순서 검증
        if (formData.bookingStartDate && formData.bookingEndDate) {
            const bookingStart = new Date(formData.bookingStartDate);
            const bookingEnd = new Date(formData.bookingEndDate);

            if (bookingEnd <= bookingStart) {
                newErrors.bookingEndDate =
                    '예매 종료일시는 예매 시작일시보다 늦어야 합니다';
            }
        }

        // 예매 기간과 공연 날짜 검증
        if (
            formData.bookingEndDate &&
            formData.concertDate &&
            formData.startTime
        ) {
            const bookingEnd = new Date(formData.bookingEndDate);
            const concertStart = new Date(
                `${formData.concertDate}T${formData.startTime}`,
            );

            if (bookingEnd >= concertStart) {
                newErrors.bookingEndDate =
                    '예매 종료일시는 공연 시작 전이어야 합니다';
            }
        }

        // 연령 제한 검증 (Min, Max)
        const minAge = parseInt(formData.minAge);
        if (isNaN(minAge) || minAge < 0) {
            newErrors.minAge = '최소 연령은 0세 이상이어야 합니다';
        } else if (minAge > 100) {
            newErrors.minAge = '최소 연령은 100세 이하여야 합니다';
        }

        // 최대 티켓 수 검증 (Min, Max)
        const maxTickets = parseInt(formData.maxTicketsPerUser);
        if (isNaN(maxTickets) || maxTickets < 1) {
            newErrors.maxTicketsPerUser =
                '사용자당 최대 티켓 수는 1개 이상이어야 합니다';
        } else if (maxTickets > 10) {
            newErrors.maxTicketsPerUser =
                '사용자당 최대 티켓 수는 10개 이하여야 합니다';
        }

        // 포스터 URL 패턴 검증
        if (formData.posterImageUrl) {
            const urlPattern = /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i;
            if (!urlPattern.test(formData.posterImageUrl)) {
                newErrors.posterImageUrl =
                    '포스터 이미지 URL은 올바른 이미지 URL 형식이어야 합니다';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ====== API 호출 ======

    /**
     * 콘서트 생성
     * POST /api/seller/concerts
     */
    const createConcert = async () => {
        const params = new URLSearchParams({
            sellerId: sellerId.toString(),
        });

        // 백엔드 SellerConcertCreateDTO에 맞는 데이터 구성
        const createData = {
            title: formData.title.trim(),
            artist: formData.artist.trim(),
            description: formData.description?.trim() || null,
            venueName: formData.venueName.trim(),
            venueAddress: formData.venueAddress?.trim() || null,
            concertDate: formData.concertDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
            totalSeats: parseInt(formData.totalSeats),
            bookingStartDate: formData.bookingStartDate,
            bookingEndDate: formData.bookingEndDate,
            minAge: parseInt(formData.minAge),
            maxTicketsPerUser: parseInt(formData.maxTicketsPerUser),
            posterImageUrl: formData.posterImageUrl?.trim() || null,
        };

        const response = await fetch(`/api/seller/concerts?${params}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(createData),
        });

        return response.json();
    };

    /**
     * 콘서트 수정
     * PUT /api/seller/concerts/{concertId}
     */
    const updateConcert = async () => {
        const params = new URLSearchParams({
            sellerId: sellerId.toString(),
        });

        // 백엔드 SellerConcertUpdateDTO에 맞는 데이터 구성 (부분 수정 지원)
        const updateData = {};

        // 변경된 필드만 포함 (null/undefined 값은 제외)
        if (formData.title?.trim()) updateData.title = formData.title.trim();
        if (formData.artist?.trim()) updateData.artist = formData.artist.trim();
        if (formData.description !== undefined)
            updateData.description = formData.description?.trim() || null;
        if (formData.venueName?.trim())
            updateData.venueName = formData.venueName.trim();
        if (formData.venueAddress !== undefined)
            updateData.venueAddress = formData.venueAddress?.trim() || null;
        if (formData.concertDate) updateData.concertDate = formData.concertDate;
        if (formData.startTime) updateData.startTime = formData.startTime;
        if (formData.endTime) updateData.endTime = formData.endTime;
        if (formData.totalSeats)
            updateData.totalSeats = parseInt(formData.totalSeats);
        if (formData.bookingStartDate)
            updateData.bookingStartDate = formData.bookingStartDate;
        if (formData.bookingEndDate)
            updateData.bookingEndDate = formData.bookingEndDate;
        if (formData.minAge !== undefined)
            updateData.minAge = parseInt(formData.minAge);
        if (formData.maxTicketsPerUser !== undefined)
            updateData.maxTicketsPerUser = parseInt(formData.maxTicketsPerUser);
        if (formData.status) updateData.status = formData.status;
        if (formData.posterImageUrl !== undefined)
            updateData.posterImageUrl = formData.posterImageUrl?.trim() || null;

        const response = await fetch(
            `/api/seller/concerts/${concert.concertId}?${params}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            },
        );

        return response.json();
    };

    // ====== 폼 제출 ======
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setSubmitError('');
        setSubmitSuccess('');

        try {
            const result = isEditMode
                ? await updateConcert()
                : await createConcert();

            if (result.success) {
                setSubmitSuccess(
                    result.message ||
                        (isEditMode
                            ? '콘서트가 수정되었습니다.'
                            : '콘서트가 생성되었습니다.'),
                );

                // 성공 시 부모 컴포넌트에 알림
                setTimeout(() => {
                    onSuccess && onSuccess(result.data);
                    onClose();
                }, 1500);
            } else {
                setSubmitError(
                    result.message || '처리 중 오류가 발생했습니다.',
                );
            }
        } catch (error) {
            setSubmitError('네트워크 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isEditMode ? '콘서트 수정' : '콘서트 등록'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* 성공/에러 메시지 */}
                {submitSuccess && (
                    <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                        <CheckCircle size={20} className="text-green-600" />
                        <span className="text-green-700">{submitSuccess}</span>
                    </div>
                )}

                {submitError && (
                    <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <AlertCircle size={20} className="text-red-600" />
                        <span className="text-red-700">{submitError}</span>
                    </div>
                )}

                {/* 폼 */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 기본 정보 섹션 */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                기본 정보
                            </h3>
                        </div>

                        {/* 콘서트 제목 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                콘서트 제목{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.title
                                        ? 'border-red-300'
                                        : 'border-gray-300'
                                }`}
                                placeholder="콘서트 제목을 입력하세요"
                                maxLength={100}
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* 아티스트명 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                아티스트명{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="artist"
                                value={formData.artist}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.artist
                                        ? 'border-red-300'
                                        : 'border-gray-300'
                                }`}
                                placeholder="아티스트명을 입력하세요"
                                maxLength={50}
                            />
                            {errors.artist && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.artist}
                                </p>
                            )}
                        </div>

                        {/* 콘서트 설명 */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                콘서트 설명
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.description
                                        ? 'border-red-300'
                                        : 'border-gray-300'
                                }`}
                                placeholder="콘서트에 대한 상세 설명을 입력하세요"
                                maxLength={1000}
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* 공연장 정보 섹션 */}
                        <div className="md:col-span-2 mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin size={20} />
                                공연장 정보
                            </h3>
                        </div>

                        {/* 공연장명 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                공연장명 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="venueName"
                                value={formData.venueName}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.venueName
                                        ? 'border-red-300'
                                        : 'border-gray-300'
                                }`}
                                placeholder="공연장명을 입력하세요"
                                maxLength={100}
                            />
                            {errors.venueName && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.venueName}
                                </p>
                            )}
                        </div>

                        {/* 공연장 주소 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                공연장 주소
                            </label>
                            <input
                                type="text"
                                name="venueAddress"
                                value={formData.venueAddress}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.venueAddress
                                        ? 'border-red-300'
                                        : 'border-gray-300'
                                }`}
                                placeholder="공연장 주소를 입력하세요"
                                maxLength={200}
                            />
                            {errors.venueAddress && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.venueAddress}
                                </p>
                            )}
                        </div>

                        {/* 일시 정보 섹션 */}
                        <div className="md:col-span-2 mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar size={20} />
                                일시 정보
                            </h3>
                        </div>

                        {/* 공연 날짜 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                공연 날짜{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="concertDate"
                                value={formData.concertDate}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.concertDate
                                        ? 'border-red-300'
                                        : 'border-gray-300'
                                }`}
                            />
                            {errors.concertDate && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.concertDate}
                                </p>
                            )}
                        </div>

                        {/* 총 좌석 수 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                총 좌석 수{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="totalSeats"
                                value={formData.totalSeats}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.totalSeats
                                        ? 'border-red-300'
                                        : 'border-gray-300'
                                }`}
                                placeholder="총 좌석 수를 입력하세요"
                                min={1}
                                max={100000}
                            />
                            {errors.totalSeats && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.totalSeats}
                                </p>
                            )}
                        </div>

                        {/* 시작 시간 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                시작 시간{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.startTime
                                        ? 'border-red-300'
                                        : 'border-gray-300'
                                }`}
                            />
                            {errors.startTime && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.startTime}
                                </p>
                            )}
                        </div>

                        {/* 종료 시간 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                종료 시간{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.endTime
                                        ? 'border-red-300'
                                        : 'border-gray-300'
                                }`}
                            />
                            {errors.endTime && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.endTime}
                                </p>
                            )}
                        </div>

                        {/* 예매 정보 섹션 */}
                        <div className="md:col-span-2 mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock size={20} />
                                예매 정보
                            </h3>
                        </div>

                        {/* 예매 시작일시 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                예매 시작일시{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="bookingStartDate"
                                value={formData.bookingStartDate}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.bookingStartDate
                                        ? 'border-red-300'
                                        : 'border-gray-300'
                                }`}
                            />
                            {errors.bookingStartDate && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.bookingStartDate}
                                </p>
                            )}
                        </div>

                        {/* 예매 종료일시 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                예매 종료일시{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="bookingEndDate"
                                value={formData.bookingEndDate}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.bookingEndDate
                                        ? 'border-red-300'
                                        : 'border-gray-300'
                                }`}
                            />
                            {errors.bookingEndDate && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.bookingEndDate}
                                </p>
                            )}
                        </div>

                        {/* 추가 설정 섹션 */}
                        <div className="md:col-span-2 mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Users size={20} />
                                추가 설정
                            </h3>
                        </div>

                        {/* 최소 연령 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                최소 연령 제한
                            </label>
                            <input
                                type="number"
                                name="minAge"
                                value={formData.minAge}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.minAge
                                        ? 'border-red-300'
                                        : 'border-gray-300'
                                }`}
                                placeholder="최소 연령을 입력하세요"
                                min={0}
                                max={100}
                            />
                            {errors.minAge && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.minAge}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                0세는 연령 제한 없음을 의미합니다
                            </p>
                        </div>

                        {/* 사용자당 최대 티켓 수 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                사용자당 최대 구매 티켓 수
                            </label>
                            <input
                                type="number"
                                name="maxTicketsPerUser"
                                value={formData.maxTicketsPerUser}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.maxTicketsPerUser
                                        ? 'border-red-300'
                                        : 'border-gray-300'
                                }`}
                                placeholder="최대 구매 가능 티켓 수"
                                min={1}
                                max={10}
                            />
                            {errors.maxTicketsPerUser && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.maxTicketsPerUser}
                                </p>
                            )}
                        </div>

                        {/* 수정 모드에서만 상태 선택 */}
                        {isEditMode && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    콘서트 상태
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="SCHEDULED">예정됨</option>
                                    <option value="ON_SALE">예매중</option>
                                    <option value="SOLD_OUT">매진</option>
                                    <option value="CANCELLED">취소됨</option>
                                    <option value="COMPLETED">완료됨</option>
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    상태 변경 시 신중하게 선택해주세요
                                </p>
                            </div>
                        )}

                        {/* 포스터 이미지 섹션 */}
                        <div className="md:col-span-2 mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Image size={20} />
                                포스터 이미지
                            </h3>
                        </div>

                        {/* 포스터 이미지 URL */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                포스터 이미지 URL
                            </label>
                            <input
                                type="url"
                                name="posterImageUrl"
                                value={formData.posterImageUrl}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.posterImageUrl
                                        ? 'border-red-300'
                                        : 'border-gray-300'
                                }`}
                                placeholder="https://example.com/poster.jpg"
                            />
                            {errors.posterImageUrl && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.posterImageUrl}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                지원 형식: jpg, jpeg, png, gif, webp
                            </p>

                            {/* 포스터 미리보기 */}
                            {formData.posterImageUrl &&
                                !errors.posterImageUrl && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">
                                            미리보기
                                        </p>
                                        <div className="w-32 h-48 border border-gray-300 rounded-lg overflow-hidden">
                                            <img
                                                src={formData.posterImageUrl}
                                                alt="포스터 미리보기"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display =
                                                        'none';
                                                    e.target.nextSibling.style.display =
                                                        'flex';
                                                }}
                                            />
                                            <div
                                                className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm"
                                                style={{ display: 'none' }}
                                            >
                                                이미지 로드 실패
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* 폼 액션 버튼들 */}
                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading && (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            )}
                            {loading
                                ? '처리 중...'
                                : isEditMode
                                  ? '수정하기'
                                  : '등록하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConcertForm;
