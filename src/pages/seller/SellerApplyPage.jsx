import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../shared/utils/apiClient';
import LoadingSpinner from '../../shared/components/ui/LoadingSpinner';
import ErrorMessage from '../../shared/components/ui/ErrorMessage';
import InputField from '../../shared/components/ui/InputField';
import Button from '../../shared/components/ui/Button';
import SuccessMessage from '../../shared/components/ui/SuccessMessage';
import {
    formatPhoneNumber,
    formatBusinessNumber,
} from '../../shared/utils/formatters';

const SellerApplyPage = () => {
    const { user } = useContext(AuthContext); // AuthContext의 user (GET /auth/me에서 온 정보)
    const navigate = useNavigate();

    const [sellerStatus, setSellerStatus] = useState(null); // /seller-status API 응답 저장
    const [applicantInfo, setApplicantInfo] = useState(null); // /applicant-info API 응답 저장
    const [loading, setLoading] = useState(true); // 전체 페이지 로딩
    const [error, setError] = useState(null); // 전체 페이지 에러
    const [successMessage, setSuccessMessage] = useState(null);

    // 폼 데이터 상태
    const [formData, setFormData] = useState({
        companyName: '',
        businessNumber: '',
        representativeName: '',
        representativePhone: '',
    });
    const [businessLicenseFile, setBusinessLicenseFile] = useState(null); // 파일 상태
    const [filePreview, setFilePreview] = useState(null); // 파일 미리보기 URL
    const [selectedFileName, setSelectedFileName] = useState(''); // 추가: 선택된 파일 이름 상태

    // "Same as applicant" 체크박스 상태
    const [sameAsApplicant, setSameAsApplicant] = useState(false);

    // 폼 유효성 검사 상태
    const [formErrors, setFormErrors] = useState({});

    // 드래그 앤 드롭 영역의 상태
    const [isDragOver, setIsDragOver] = useState(false);

    useEffect(() => {
        const fetchRequiredDataAndControlAccess = async () => {
            if (!user) {
                // 로그인 여부 확인
                navigate('/unauthorized', { replace: true });
                return;
            }

            setLoading(true);
            setError(null);
            try {
                // 1. 판매자 상태 조회 (접근 제어용)
                const sellerStatusResponse = await apiClient.get(
                    '/users/me/seller-status',
                );
                const currentStatus = sellerStatusResponse.data.approvalStatus;
                setSellerStatus(sellerStatusResponse.data);

                // 2. 신청자 상세 정보 조회 (UI 표시용)
                // SellerApplicationController.java에 추가한 API 호출
                const applicantInfoResponse = await apiClient.get(
                    '/users/me/applicant-info',
                );
                setApplicantInfo(applicantInfoResponse.data);

                // 3. 접근 제어 로직 (신청 불가능 상태면 리다이렉트)
                if (
                    currentStatus === 'PENDING' ||
                    currentStatus === 'APPROVED'
                ) {
                    alert(
                        '현재 상태에서는 판매자 권한 신청/재신청을 할 수 없습니다.',
                    );
                    navigate('/seller/status', { replace: true });
                }
                // 4. 재신청 시 기존 데이터 로드
                else if (sellerStatusResponse.data.companyName) {
                    setFormData({
                        companyName: sellerStatusResponse.data.companyName,
                        businessNumber:
                            sellerStatusResponse.data.businessNumber,
                        representativeName:
                            sellerStatusResponse.data.representativeName,
                        representativePhone:
                            sellerStatusResponse.data.representativePhone,
                    });
                    if (sellerStatusResponse.data.uploadedFileUrl) {
                        setFilePreview(
                            sellerStatusResponse.data.uploadedFileUrl,
                        );
                    }
                }
            } catch (err) {
                console.error('판매자 상태 조회 실패 (SellerApplyPage):', err);
                setError(
                    err.response?.data?.message ||
                        '판매자 상태를 불러오는데 실패했습니다. (권한 확인 불가)',
                );
                // 에러 발생 시에도 접근을 막는 것이 안전
                navigate('/seller/status', { replace: true }); // 상태를 알 수 없으므로 상태 페이지로 리다이렉트
            } finally {
                setLoading(false);
            }
        };

        fetchRequiredDataAndControlAccess();
    }, [user, navigate]);

    // "Same as applicant" 체크박스 핸들러
    useEffect(() => {
        if (sameAsApplicant && applicantInfo) {
            // applicantInfo가 로드되었는지 확인
            setFormData((prev) => ({
                ...prev,
                representativeName: applicantInfo.name || '',
                // 수정: applicantInfo.phone에서 숫자만 추출하여 저장
                representativePhone: (applicantInfo.phone || '').replace(
                    /[^0-9]/g,
                    '',
                ),
            }));
        } else if (!sameAsApplicant) {
            // 체크 해제 시
            // 재신청 시 로드된 데이터가 있다면 유지하고, 없다면 비움
            if (!sellerStatus || (sellerStatus && !sellerStatus.companyName)) {
                setFormData((prev) => ({
                    ...prev,
                    representativeName: '',
                    representativePhone: '',
                }));
            } else {
                // 재신청 시 로드된 데이터가 있을 경우, 체크 해제 시 원래 로드된 데이터로 되돌림
                setFormData((prev) => ({
                    ...prev,
                    representativeName: sellerStatus.representativeName || '',
                    representativePhone: (
                        sellerStatus.representativePhone || ''
                    ).replace(/[^0-9]/g, ''),
                }));
            }
        }
    }, [sameAsApplicant, applicantInfo, sellerStatus]); // applicantInfo 추가

    const handleChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;

        // 전화번호와 사업자등록번호 입력 시 숫자 외 문자 자동 제거
        if (name === 'businessNumber' || name === 'representativePhone') {
            processedValue = value.replace(/[^0-9]/g, ''); // 숫자만 남기기
        }

        setFormData((prev) => ({ ...prev, [name]: processedValue }));
        setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    // 파일 입력 변경 핸들러
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBusinessLicenseFile(file);
            setFilePreview(URL.createObjectURL(file));
            setSelectedFileName(file.name); // 추가: 파일 이름 업데이트
        } else {
            setBusinessLicenseFile(null);
            setFilePreview(null);
            setSelectedFileName(''); // 추가: 파일 이름 초기화
        }
        setFormErrors((prev) => ({ ...prev, businessLicenseFile: undefined }));
    };

    // 드래그 앤 드롭 핸들러
    const handleDragOver = (e) => {
        e.preventDefault(); // 기본 동작 방지 (파일이 브라우저에 열리는 것 등)
        e.stopPropagation(); // 이벤트 전파 중단
        setIsDragOver(true); // 드래그 오버 상태 활성화
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false); // 드래그 오버 상태 비활성화
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false); // 드래그 오버 상태 비활성화

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            // 첫 번째 파일만 처리 (현재 단일 파일 업로드 기준)
            const mockEvent = { target: { files: [files[0]] } };
            handleFileChange(mockEvent); // 기존 파일 변경 핸들러 재사용
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.companyName)
            errors.companyName = '업체명을 입력해주세요.';
        if (!formData.businessNumber)
            errors.businessNumber = '사업자등록번호를 입력해주세요.';
        else if (!/^[0-9]{10}$/.test(formData.businessNumber))
            errors.businessNumber = '사업자등록번호는 10자리 숫자여야 합니다.';
        if (!formData.representativeName)
            errors.representativeName = '담당자 이름을 입력해주세요.';
        if (!formData.representativePhone)
            errors.representativePhone = '담당자 연락처는 필수입니다.';
        // 정규식은 숫자만 있는 문자열에 대해 검사 (하이픈 제거된 값)
        else if (!/^0\d{1,2}\d{3,4}\d{4}$/.test(formData.representativePhone))
            errors.representativePhone =
                '담당자 연락처는 유효한 전화번호 형식(숫자만)이어야 합니다.';
        if (!businessLicenseFile && !sellerStatus?.uploadedFileUrl)
            errors.businessLicenseFile = '사업자 등록증 파일을 업로드해주세요.'; // 재신청 시 기존 파일이 없으면 필수

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // 폼 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage(null); // 이전 성공 메시지 초기화

        if (!validateForm()) {
            alert('모든 필수 정보를 올바르게 입력해주세요.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // 수정: 백엔드로 보내기 전에 데이터에서 하이픈 재차 제거
            const cleanedFormData = {
                ...formData,
                businessNumber: formData.businessNumber.replace(/[^0-9]/g, ''),
                representativePhone: formData.representativePhone.replace(
                    /[^0-9]/g,
                    '',
                ),
            };

            const form = new FormData();
            // DTO를 JSON Blob으로 추가 (이제 cleanedFormData 사용)
            form.append(
                'request',
                new Blob([JSON.stringify(cleanedFormData)], {
                    type: 'application/json',
                }),
            ); // DTO를 JSON Blob으로 추가
            if (businessLicenseFile) {
                form.append('document', businessLicenseFile); // 파일은 'document' 이름으로 추가
            }

            // API-03-06: 판매자 권한 신청
            const response = await apiClient.post(
                '/users/me/seller-requests',
                form,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data', // 파일 업로드를 위해 필수
                    },
                },
            );

            setSuccessMessage(
                response.message ||
                    '판매자 권한 신청이 성공적으로 접수되었습니다.',
            ); // response.data.message 대신 response.message 사용
            // 성공 시 상태 페이지로 리다이렉트
            setTimeout(() => {
                navigate('/seller/status', { replace: true });
            }, 2000); // 2초 후 리다이렉트
        } catch (err) {
            console.error('판매자 권한 신청 실패:', err.response?.data);
            setError(
                err.response?.data?.message ||
                    '판매자 권한 신청에 실패했습니다.',
            );
        } finally {
            setLoading(false);
        }
    };

    // 뒤로가기 핸들러
    const handleGoBack = () => {
        navigate('/seller/status');
    };

    if (loading) {
        return <LoadingSpinner message="판매자 신청 페이지 로딩 중..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    // 성공 메시지가 있을 경우 표시
    if (successMessage) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] bg-[#111922] text-white p-4">
                <SuccessMessage message={successMessage} />
                <Button
                    onClick={() => navigate('/seller/status')}
                    className="mt-4"
                >
                    상태 페이지로 이동
                </Button>
            </div>
        );
    }

    // applicantInfo에서 직접 값을 가져와 변수에 할당
    const applicantId = applicantInfo?.id || 'N/A';
    const applicantNickname = applicantInfo?.nickname || 'N/A';
    const applicantName = applicantInfo?.name || 'N/A';
    const applicantEmail = applicantInfo?.email || 'N/A';
    const applicantPhone = applicantInfo?.phone || 'N/A'; // 이곳은 이미 API에서 오는 값

    return (
        <div className="flex flex-col px-6 py-5 bg-[#111922] text-white min-h-[calc(100vh-64px)]">
            {/* 상단 섹션 */}
            <div className="flex items-center justify-between mb-6 p-4">
                <h2 className="text-3xl font-bold">판매자 권한 신청</h2>
                <button
                    onClick={handleGoBack}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition duration-300"
                >
                    뒤로가기
                </button>
            </div>

            <div className="max-w-[960px] mx-auto w-full p-4">
                {/* Applicant Information 섹션 */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">신청자 정보</h3>
                    <div className="bg-[#121a21] p-6 rounded-xl border border-[#243447]">
                        <p className="text-base text-gray-300 mb-2">
                            닉네임:{' '}
                            <span className="font-semibold text-white">
                                {applicantNickname}
                            </span>{' '}
                            | 사용자 ID:{' '}
                            <span className="font-semibold text-white">
                                {applicantId}
                            </span>
                        </p>
                        <p className="text-sm text-gray-400">
                            이름:{' '}
                            <span className="font-medium">{applicantName}</span>
                            <br />
                            이메일:{' '}
                            <span className="font-medium">
                                {applicantEmail}
                            </span>{' '}
                            | 연락처:{' '}
                            <span className="font-medium">
                                {applicantPhone}
                            </span>
                        </p>
                    </div>
                </div>

                {/* 폼 섹션 */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Company Name */}
                    <InputField
                        label="업체명"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="예: (주)티켓몬 공연기획"
                        error={formErrors.companyName}
                        required
                        className="bg-[#1f262e] rounded-xl border border-[#3d4a5c] text-white"
                        inputClassName="bg-transparent"
                    />
                    {/* Business Registration Number */}
                    <InputField
                        label="사업자등록번호"
                        name="businessNumber"
                        // 수정: value에 포맷팅 함수 적용
                        value={formatBusinessNumber(formData.businessNumber)}
                        onChange={handleChange}
                        placeholder="하이픈 없이 10자리 숫자"
                        error={formErrors.businessNumber}
                        required
                        className="bg-[#1f262e] rounded-xl border border-[#3d4a5c] text-white"
                        inputClassName="bg-transparent"
                    />
                    {/* Representative Name */}
                    <InputField
                        label="담당자 이름"
                        name="representativeName"
                        value={formData.representativeName}
                        onChange={handleChange}
                        placeholder="예: 김철수"
                        error={formErrors.representativeName}
                        required
                        className="bg-[#1f262e] rounded-xl border border-[#3d4a5c] text-white"
                        inputClassName="bg-transparent"
                        disabled={sameAsApplicant}
                    />
                    {/* Representative Phone */}
                    <InputField
                        label="담당자 연락처"
                        name="representativePhone"
                        // value에 포맷팅 함수 적용
                        value={formatPhoneNumber(formData.representativePhone)}
                        onChange={handleChange}
                        placeholder="숫자만 입력 (예: 01012345678)"
                        error={formErrors.representativePhone}
                        required
                        className="bg-[#1f262e] rounded-xl border border-[#3d4a5c] text-white"
                        inputClassName="bg-transparent"
                        disabled={sameAsApplicant}
                    />

                    {/* "Same as applicant" 체크박스 */}
                    <div className="flex items-center space-x-2 p-4 bg-[#141a1f] rounded-xl border border-[#243447]">
                        <input
                            type="checkbox"
                            id="sameAsApplicant"
                            checked={sameAsApplicant}
                            onChange={(e) =>
                                setSameAsApplicant(e.target.checked)
                            }
                            className="form-checkbox h-5 w-5 text-[#6366F1] bg-gray-800 border-gray-700 rounded focus:ring-[#6366F1]"
                        />
                        <label
                            htmlFor="sameAsApplicant"
                            className="text-gray-300 text-base cursor-pointer"
                        >
                            신청자와 동일
                        </label>
                    </div>

                    {/* Upload Supporting Documents 섹션 */}
                    <div className="mt-8">
                        <h3 className="text-xl font-bold mb-4">
                            제출 서류 업로드
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                            PDF 또는 JPG 파일 (최대 10MB)
                        </p>
                        {/* 드래그 앤 드롭 영역 */}
                        <div
                            className={`border-dashed border-2 p-6 rounded-xl text-center cursor-pointer transition-colors
                          ${isDragOver ? 'border-[#6366F1] bg-[#1a232f]' : 'border-[#3d4a5c] bg-[#121a21]'}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <label
                                htmlFor="businessLicenseFile"
                                className="cursor-pointer block h-full w-full"
                            >
                                <p className="text-white text-lg font-bold mb-2">
                                    파일을 여기로 드래그 앤 드롭하거나 클릭하여
                                    찾아보기
                                </p>
                                <p className="text-gray-400 text-sm mb-4">
                                    Drag and drop files here or click to browse
                                </p>
                                <input
                                    type="file"
                                    id="businessLicenseFile"
                                    name="businessLicenseFile"
                                    accept="image/*,application/pdf" // 이미지 및 PDF 파일 허용
                                    onChange={handleFileChange}
                                    className="hidden" // 기본 파일 선택 버튼 숨김
                                />
                                <Button
                                    type="button"
                                    onClick={() =>
                                        document
                                            .getElementById(
                                                'businessLicenseFile',
                                            )
                                            .click()
                                    }
                                    className="bg-[#2b3640] hover:bg-[#3d4a5c] text-white py-2 px-6 rounded-xl transition-colors"
                                >
                                    파일 선택
                                </Button>
                            </label>
                            {formErrors.businessLicenseFile && (
                                <p className="mt-3 text-sm text-red-500">
                                    {formErrors.businessLicenseFile}
                                </p>
                            )}
                            {filePreview && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-400 mb-2">
                                        파일 미리보기:{' '}
                                        <span className="text-white font-semibold">
                                            {selectedFileName}
                                        </span>{' '}
                                        {/* 수정: 파일명 표시 */}
                                    </p>
                                    {businessLicenseFile?.type.startsWith(
                                        'image/',
                                    ) ? (
                                        <img
                                            src={filePreview}
                                            alt="파일 미리보기"
                                            className="max-w-xs max-h-48 object-contain border border-gray-700 rounded-md mx-auto"
                                        />
                                    ) : (
                                        <p className="text-gray-500">
                                            PDF 파일은 미리보기를 지원하지
                                            않습니다. 파일이 업로드됩니다.
                                        </p>
                                    )}
                                </div>
                            )}
                            {sellerStatus?.uploadedFileUrl &&
                                !businessLicenseFile && (
                                    <div className="mt-2 text-sm text-gray-400">
                                        기존 업로드 파일:{' '}
                                        <a
                                            href={sellerStatus.uploadedFileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:underline"
                                        >
                                            파일 보기
                                        </a>
                                        (새 파일을 업로드하면 기존 파일은
                                        대체됩니다.)
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* 제출 버튼 */}
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-[#b2c9e5] hover:bg-[#97b3d3] text-[#141a1f]"
                    >
                        {loading ? '신청 중...' : '판매자 권한 신청'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default SellerApplyPage;
