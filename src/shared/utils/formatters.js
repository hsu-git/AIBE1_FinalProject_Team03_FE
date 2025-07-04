// 이 파일은 API 응답 또는 사용자 입력을 포맷팅하는 유틸리티 함수들을 모아둡니다.

/**
 * 전화번호를 하이픈 형식으로 포맷팅합니다.
 * 예: 01012345678 -> 010-1234-5678
 * @param {string} phoneNumber - 숫자만 있는 전화번호 문자열
 * @returns {string} 하이픈이 포함된 전화번호 문자열
 */
export const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    const cleaned = ('' + phoneNumber).replace(/\D/g, ''); // 숫자 외 문자 제거
    // 010-xxxx-xxxx, 02-xxx-xxxx, 0X0-xxxx-xxxx 등 다양한 형식 지원
    const match = cleaned.match(/^(01[016789])(\d{3,4})(\d{4})$/);
    const localMatch = cleaned.match(/^(02|0\d{2})(\d{3,4})(\d{4})$/); // 지역번호 포함

    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
    }
    if (localMatch) {
        // 일반 유선 전화번호
        return `${localMatch[1]}-${localMatch[2]}-${localMatch[3]}`;
    }
    return cleaned; // 형식에 맞지 않으면 숫자만 반환
};

/**
 * 사업자등록번호를 하이픈 형식으로 포맷팅합니다.
 * 예: 1234567890 -> 123-45-67890
 * @param {string} businessNumber - 숫자만 있는 사업자등록번호 문자열
 * @returns {string} 하이픈이 포함된 사업자등록번호 문자열
 */
export const formatBusinessNumber = (businessNumber) => {
    if (!businessNumber) return '';
    const cleaned = ('' + businessNumber).replace(/\D/g, ''); // 숫자 외 문자 제거
    const match = cleaned.match(/^(\d{3})(\d{2})(\d{5})$/);
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return cleaned; // 형식에 맞지 않으면 숫자만 반환
};
