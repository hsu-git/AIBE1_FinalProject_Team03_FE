import React, { useState } from 'react';
import { AccountForm } from '../../auth/services/AccountForm';
import { EditProfileForm } from '../components/ProfileForm';
import { passwordInputType } from '../types/passwordInputType';

export function PasswordTab({ userId, onChangePassword }) {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isChanging, setIsChanging] = useState(false);
    const [errors, setErrors] = useState({});
    const [changeError, setChangeError] = useState('');
    const [changeSuccess, setChangeSuccess] = useState('');
    const [passwords, setPasswords] = useState({
        curPwd: '',
        newPwd: '',
        confirmPwd: '',
    });

    const handlePasswordChange = async () => {
        setIsChanging(true);
        setChangeError('');
        setChangeSuccess('');

        try {
            const result = await onChangePassword({
                userId,
                currentPassword: passwords.curPwd,
                newPassword: passwords.newPwd,
            });

            setPasswords({ curPwd: '', newPwd: '', confirmPwd: '' });

            if (result.success) {
                setChangeSuccess('비밀번호가 성공적으로 변경되었습니다.');
            } else {
                setChangeError(
                    '비밀번호 변경에 실패했습니다.\n 현재 비밀번호가 올바른지 확인해주세요.',
                );
            }
        } catch (error) {
            setChangeError(
                '비밀번호 변경에 실패했습니다.\n 현재 비밀번호가 올바른지 확인해주세요.',
            );
        } finally {
            setIsChanging(false);
        }
    };

    const handleInputChange = (field) => (e) => {
        let value = e.target.value;

        const updatedData = {
            ...passwords,
            [field]: value,
        };

        setPasswords(updatedData);

        if (field != 'confirmPwd') {
            const error = AccountForm.validateField(
                'password',
                value,
                passwords,
            );
            setErrors((prev) => ({
                ...prev,
                [field]: error,
            }));
        }

        if (field === 'confirmPwd') {
            const confirmError =
                value !== passwords.newPwd
                    ? '비밀번호가 일치하지 않습니다.'
                    : '';
            setErrors((prev) => ({
                ...prev,
                confirmPwd: confirmError,
            }));
        }

        if (field === 'newPwd') {
            const confirmError =
                passwords.confirmPwd && passwords.confirmPwd !== value
                    ? '비밀번호가 일치하지 않습니다.'
                    : '';
            setErrors((prev) => ({
                ...prev,
                confirmPwd: confirmError,
            }));
        }
    };

    const isInvalid =
        !passwords.curPwd ||
        !passwords.newPwd ||
        !passwords.confirmPwd ||
        passwords.newPwd !== passwords.confirmPwd ||
        errors.curPwd ||
        errors.newPwd ||
        errors.confirmPwd;

    return (
        <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">비밀번호 변경</h3>
                <p className="text-gray-400">
                    보안을 위해 주기적으로 비밀번호를 변경해주세요
                </p>
            </div>

            <div className="space-y-6">
                {passwordInputType.map(
                    ({ name, type, icon, labelName, toggle }) => (
                        <EditProfileForm
                            key={name}
                            icon={icon}
                            name={name}
                            labelName={labelName}
                            type={type}
                            value={passwords[name]}
                            onChange={handleInputChange(name)}
                            showToggle={toggle}
                            showValue={
                                name === 'curPwd'
                                    ? showCurrentPassword
                                    : name === 'newPwd'
                                      ? showNewPassword
                                      : false
                            }
                            onToggle={() =>
                                name === 'curPwd'
                                    ? setShowCurrentPassword((prev) => !prev)
                                    : name === 'newPwd'
                                      ? setShowNewPassword((prev) => !prev)
                                      : null
                            }
                            error={errors[name]}
                        />
                    ),
                )}

                {/* 메시지 표시 영역 */}
                {changeError && (
                    <p className="text-red-500 text-sm text-center">
                        {changeError}
                    </p>
                )}
                {changeSuccess && (
                    <p className="text-green-600 text-sm text-center">
                        {changeSuccess}
                    </p>
                )}

                <button
                    type="button"
                    onClick={handlePasswordChange}
                    disabled={isChanging || isInvalid}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                    {isChanging ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>변경 중...</span>
                        </>
                    ) : (
                        <span>비밀번호 변경</span>
                    )}
                </button>
            </div>
        </div>
    );
}
