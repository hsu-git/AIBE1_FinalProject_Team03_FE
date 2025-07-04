// src/shared/services/fileUploadService.js

import apiClient from '../utils/apiClient.js';

const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
];

/**
 * 파일 업로드 관련 API 서비스
 * 백엔드의 FileUploadController와 연동
 */
export const fileUploadService = {
    /**
     * 포스터 이미지를 Supabase에 업로드
     * 백엔드: POST /api/upload/poster
     *
     * @param {File} file - 업로드할 이미지 파일
     * @param {number|null} concertId - 콘서트 ID (선택사항, 임시 업로드 시 null)
     * @param {Function} onProgress - 업로드 진행률 콜백 함수 (선택사항)
     * @returns {Promise<{success: boolean, message: string, data: string}>} 업로드된 파일의 public URL
     */
    async uploadPosterImage(file, concertId = null, onProgress = null) {
        try {
            // 파일 유효성 검사
            if (!file) {
                throw new Error('업로드할 파일이 선택되지 않았습니다.');
            }

            // 파일 크기 검사 (10MB 제한)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                throw new Error('파일 크기는 10MB를 초과할 수 없습니다.');
            }

            // 파일 타입 검사 (이미지만 허용)
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                throw new Error(
                    '지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP, GIF만 가능)',
                );
            }

            // FormData 생성
            const formData = new FormData();
            formData.append('file', file);

            // concertId가 있으면 추가 (기존 콘서트 수정 시)
            if (concertId) {
                formData.append('concertId', concertId.toString());
            }

            // API 호출 설정
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                // 업로드 진행률 추적 (선택사항)
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total,
                        );
                        onProgress(percentCompleted);
                    }
                },
            };

            // 백엔드 API 호출
            const response = await apiClient.post(
                '/upload/poster',
                formData,
                config,
            );

            // 성공 응답 처리
            if (response && response.success && response.data) {
                return {
                    success: true,
                    message:
                        response.message || '파일 업로드가 완료되었습니다.',
                    data: response.data, // Supabase public URL
                };
            } else {
                throw new Error(
                    response?.message || '파일 업로드에 실패했습니다.',
                );
            }
        } catch (error) {
            // 에러 타입별 처리
            if (error.response) {
                // 백엔드에서 반환한 에러 (4xx, 5xx)
                const errorMessage =
                    error.response.data?.message ||
                    error.response.data?.error ||
                    '서버에서 파일 업로드를 처리하지 못했습니다.';

                console.error(
                    '파일 업로드 서버 에러:',
                    error.response.status,
                    errorMessage,
                );
                throw new Error(errorMessage);
            } else if (error.request) {
                // 네트워크 에러 (요청은 보냈지만 응답을 받지 못함)
                console.error('파일 업로드 네트워크 에러:', error.request);
                throw new Error('네트워크 연결을 확인해주세요.');
            } else {
                // 클라이언트 측 에러 (파일 검증 실패 등)
                console.error('파일 업로드 클라이언트 에러:', error.message);
                throw new Error(error.message);
            }
        }
    },

    /**
     * 파일 업로드 전 클라이언트 측 유효성 검사
     * 실제 업로드 전에 미리 검증하여 UX 개선
     *
     * @param {File} file - 검사할 파일
     * @returns {{valid: boolean, error?: string}} 검증 결과
     */
    validateFile(file) {
        try {
            // 파일 존재 여부
            if (!file) {
                return { valid: false, error: '파일이 선택되지 않았습니다.' };
            }

            // 파일 크기 검사 (10MB)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
                return {
                    valid: false,
                    error: `파일 크기가 너무 큽니다. (${sizeMB}MB / 최대 10MB)`,
                };
            }

            // 파일 타입 검사
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                return {
                    valid: false,
                    error: `지원하지 않는 파일 형식입니다. (${file.type})\n허용 형식: JPEG, PNG, WebP, GIF`,
                };
            }

            // 파일명 검사 (선택사항)
            if (file.name.length > 255) {
                return {
                    valid: false,
                    error: '파일명이 너무 깁니다. (최대 255자)',
                };
            }

            return { valid: true };
        } catch (error) {
            return {
                valid: false,
                error: '파일 검증 중 오류가 발생했습니다.',
            };
        }
    },

    /**
     * 파일 크기를 사람이 읽기 쉬운 형태로 변환
     *
     * @param {number} bytes - 바이트 단위 파일 크기
     * @returns {string} 변환된 크기 문자열 (예: "2.5 MB")
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },

    /**
     * 파일 확장자 추출
     *
     * @param {string} filename - 파일명
     * @returns {string} 확장자 (소문자, 점 제외)
     */
    getFileExtension(filename) {
        if (!filename || !filename.includes('.')) {
            return '';
        }
        return filename.split('.').pop().toLowerCase();
    },

    /**
     * 이미지 파일인지 확인
     *
     * @param {File} file - 확인할 파일
     * @returns {boolean} 이미지 파일 여부
     */
    isImageFile(file) {
        return ALLOWED_IMAGE_TYPES.includes(file.type);
    },

    /**
     * 파일을 Base64 데이터 URL로 변환 (미리보기용)
     *
     * @param {File} file - 변환할 파일
     * @returns {Promise<string>} Base64 데이터 URL
     */
    fileToDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                resolve(event.target.result);
            };

            reader.onerror = (error) => {
                reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
            };

            reader.readAsDataURL(file);
        });
    },
};
