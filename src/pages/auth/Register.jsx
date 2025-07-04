import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Upload, X } from 'lucide-react';
import {
    registerUser,
    oauthRegisterUser,
} from '../../features/auth/services/registerService';
import { AccountForm } from '../../features/auth/services/AccountForm';
import { SignupInput } from '../../features/auth/components/RegisterForm';
import { registerInputType } from '../../features/auth/types/registerInputType';
import { NotificationSection } from '../../features/user/components/BookingDetail/NotificationSection';
import { NOTIFICATION_TYPE } from '../../features/user/services/bookingDetailService';

export default function Register() {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        nickname: '',
        phone: '',
        address: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [profileImage, setProfileImage] = useState(null); // 실제 파일
    const [profilePreview, setProfilePreview] = useState(null); // 미리보기용
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const paramError = params.get('error');
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (paramError === 'need_signup') {
            showNotification(
                '소셜 로그인 회원가입 필요',
                NOTIFICATION_TYPE.INFO,
            );

            const handleOauthUserInfo = async () => {
                try {
                    const result = await oauthRegisterUser();
                    if (result.success) {
                        setFormData((prev) => ({
                            ...prev,
                            email: result.data.email,
                            name: result.data.name,
                        }));
                    } else {
                        showNotification(result.error, NOTIFICATION_TYPE.ERROR);
                    }
                } catch (error) {
                    showNotification(
                        '서버 오류로 사용자 정보를 불러올 수 없습니다.',
                        NOTIFICATION_TYPE.ERROR,
                    );
                }
            };

            handleOauthUserInfo();
        }
    }, [paramError]);

    const showNotification = (message, type = NOTIFICATION_TYPE.INFO) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleInputChange = (field) => (e) => {
        let value = e.target.value;

        if (field === 'phone') {
            value = AccountForm.formatPhoneNumber(value);
        }

        const updatedData = {
            ...formData,
            [field]: value,
        };

        setFormData(updatedData);

        const error = AccountForm.validateField(field, value, updatedData);
        setErrors((prev) => ({
            ...prev,
            [field]: error,
        }));

        if (field === 'password' && formData.confirmPassword) {
            const confirmError =
                formData.confirmPassword !== value
                    ? '비밀번호가 일치하지 않습니다.'
                    : '';
            setErrors((prev) => ({
                ...prev,
                confirmPassword: confirmError,
            }));
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const errorMsg = AccountForm.validateImageFile(file);
        if (errorMsg) {
            showNotification(errorMsg, NOTIFICATION_TYPE.ERROR);
            return;
        }

        // 파일 객체 저장
        setProfileImage(file);

        // 미리보기용 이미지 URL 저장
        const reader = new FileReader();
        reader.onload = (e) => {
            setProfilePreview(e.target.result); // base64 문자열
        };
        reader.readAsDataURL(file);
    };

    const handleRegister = async () => {
        const newErrors = AccountForm.validateAllFields(formData);
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            showNotification(
                '입력 정보를 다시 확인해주세요.',
                NOTIFICATION_TYPE.ERROR,
            );
            return;
        }

        if (!agreeTerms) {
            showNotification(
                '이용약관과 개인정보처리방침에 동의해주세요.',
                NOTIFICATION_TYPE.ERROR,
            );
            return;
        }

        const payload = new FormData();

        // 일반 필드 추가
        Object.entries(formData).forEach(([key, value]) => {
            payload.append(key, value);
        });

        // 파일 추가
        if (profileImage) {
            payload.append('profileImage', profileImage);
        }

        setIsLoading(true);
        try {
            const result = await registerUser(payload); // FormData 넘김
            if (result.success) {
                navigate('/login');
            } else {
                showNotification(result.error, NOTIFICATION_TYPE.ERROR);
            }
        } catch (error) {
            showNotification(
                error.message || '회원가입 중 오류가 발생했습니다.',
                NOTIFICATION_TYPE.ERROR,
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md sm:max-w-lg bg-gray-800 p-8 sm:p-10 rounded-lg shadow-2xl space-y-8 transition-all">
            {/* 알림 */}
            {notification && (
                <NotificationSection notification={notification} />
            )}

            {/* Title */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white">계정 만들기</h1>
                <p className="text-gray-400 text-sm mt-1">
                    커뮤니티에 참여하고 안전하게 티켓 거래를 시작하세요
                </p>
            </div>

            {/* Signup Form Fields */}
            {registerInputType.map(
                ({
                    name,
                    type,
                    icon,
                    placeholder,
                    placeholderFull,
                    toggle,
                }) => (
                    <SignupInput
                        key={name}
                        icon={icon}
                        name={name}
                        type={type}
                        placeholder={placeholder}
                        placeholderFull={placeholderFull}
                        value={formData[name]}
                        error={errors[name]}
                        onChange={handleInputChange(name)}
                        showToggle={toggle}
                        showValue={
                            name === 'password'
                                ? showPassword
                                : name === 'confirmPassword'
                                  ? showConfirmPassword
                                  : false
                        }
                        onToggle={() =>
                            name === 'password'
                                ? setShowPassword((prev) => !prev)
                                : name === 'confirmPassword'
                                  ? setShowConfirmPassword((prev) => !prev)
                                  : null
                        }
                    />
                ),
            )}

            {/* 프로필 이미지 업로드 */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    프로필 이미지
                </label>
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center overflow-hidden">
                        {profilePreview ? (
                            <img
                                src={profilePreview}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-8 h-8 text-orange-600" />
                        )}
                    </div>
                    <label className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition">
                        <Upload className="w-4 h-4 text-gray-300" />
                        <span className="text-gray-300 text-sm">
                            파일 업로드
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            {/* 이용약관 동의 */}
            <div className="flex items-start space-x-3">
                <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="terms" className="text-sm text-gray-400">
                    <span className="text-blue-400 hover:text-blue-300 cursor-pointer">
                        이용약관
                    </span>{' '}
                    및{' '}
                    <span className="text-blue-400 hover:text-blue-300 cursor-pointer">
                        개인정보처리방침
                    </span>
                    에 동의합니다
                </label>
            </div>

            {/* 회원가입 버튼 */}
            <button
                onClick={handleRegister}
                disabled={isLoading || !agreeTerms}
                className={`w-full font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLoading || !agreeTerms
                        ? 'bg-gray-600 cursor-not-allowed text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
                {isLoading ? '처리 중...' : '계정 만들기'}
            </button>

            {/* 로그인 링크 */}
            <div className="text-center">
                <p className="text-gray-400 text-sm">
                    이미 계정이 있으신가요?{' '}
                    <button
                        onClick={() => navigate('/login')}
                        className="text-blue-400 hover:text-blue-300 font-medium transition"
                    >
                        로그인
                    </button>
                </p>
            </div>
        </div>
    );
}
