// 1. 정규식과 메시지 상수화
const REGEX = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    username: /^[a-z0-9]+$/,
    password:
        /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+=-])[A-Za-z\d!@#$%^&*()_+=-]{8,}$/,
    phone: /^01[016789]-\d{3,4}-\d{4}$/,
    nickname: /^[가-힣a-zA-Z0-9]{1,20}$/,
};

const MESSAGES = {
    required: (label) => `${label}은(는) 필수입니다.`,
    email: '올바른 이메일 형식이 아닙니다.',
    usernameLength: '아이디는 4자 이상 20자 이하로 입력해주세요.',
    username: '아이디는 영어 소문자와 숫자만 사용 가능합니다.',
    password:
        '비밀번호는 최소 8자 이상이며, 소문자, 숫자, 특수문자를 포함해야 합니다.',
    confirmPassword: '비밀번호가 일치하지 않습니다.',
    nameLength: '이름은 100자 이하로 입력해주세요.',
    nicknameLength: '닉네임은 20자 이하로 입력해주세요.',
    confirmNickname: '올바른 닉네임 형식이 아닙니다.',
    phone: '올바른 전화번호 형식이 아닙니다. 예: 010-1234-5678',
};

// 2. 각 필드별 유효성 검사 함수 분리
const validators = {
    email: (value) => {
        if (!value.trim()) return MESSAGES.required('이메일');
        if (!REGEX.email.test(value)) return MESSAGES.email;
    },
    username: (value) => {
        if (!value.trim()) return MESSAGES.required('사용자 아이디');
        if (value.length < 4 || value.length > 20)
            return MESSAGES.usernameLength;
        if (!REGEX.username.test(value)) return MESSAGES.username;
    },
    password: (value) => {
        if (!value.trim()) return MESSAGES.required('비밀번호');
        if (!REGEX.password.test(value)) return MESSAGES.password;
    },
    confirmPassword: (value, formData) => {
        if (!value.trim()) return MESSAGES.required('비밀번호 확인');
        if (value !== formData.password) return MESSAGES.confirmPassword;
    },
    name: (value) => {
        if (!value.trim()) return MESSAGES.required('이름');
        if (value.length > 100) return MESSAGES.nameLength;
    },
    nickname: (value) => {
        if (!value.trim()) return MESSAGES.required('닉네임');
        if (value.length > 20) return MESSAGES.nicknameLength;
        if (!REGEX.nickname.test(value)) return MESSAGES.confirmNickname;
    },
    phone: (value) => {
        if (!value.trim()) return MESSAGES.required('전화번호');
        if (!REGEX.phone.test(value)) return MESSAGES.phone;
    },
    address: (value) => {
        if (!value.trim()) return MESSAGES.required('주소');
    },
};

// 3. 단일 필드 유효성 검증 함수
const validateField = (field, value, formData = {}) => {
    const validator = validators[field];
    return validator ? validator(value, formData) : '';
};

// 4. 전체 필드 유효성 검사
const validateAllFields = (formData) => {
    const errors = {};
    Object.entries(formData).forEach(([field, value]) => {
        const error = validateField(field, value, formData);
        if (error) errors[field] = error;
    });
    return errors;
};

// 5. 전화번호 포맷팅
const formatPhoneNumber = (value) => {
    const numbers = value.replace(/[^\d]/g, '');

    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7)
        return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    if (numbers.length <= 11)
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};

export const AccountForm = {
    validateField,
    validateAllFields,
    formatPhoneNumber,
};
