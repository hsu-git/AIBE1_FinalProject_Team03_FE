import apiClient from '../../../shared/utils/apiClient'; // 공통 apiClient 임포트

export const registerUser = async (data) => {
    try {
        const response = await apiClient.post('/auth/register', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.message || '회원가입 중 오류가 발생했습니다.',
        };
    }
};

export const oauthRegisterUser = async () => {
    try {
        const response = await apiClient.get('/auth/register/social');
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error:
                error.message ||
                '소셜 로그인 유저 회원가입 중 오류가 발생했습니다.',
        };
    }
};
