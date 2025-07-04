import React, { useState, useEffect } from 'react';
import { Camera, Edit2, Save, X } from 'lucide-react';
import { AccountForm } from '../../auth/services/AccountForm';
import { EditProfileForm } from '../components/ProfileForm';
import { profileInputType } from '../types/profileInputType';
import { ProfileUploaderSection } from './BookingDetail/ProfileUploaderSection';
import { NotificationSection } from '../components/BookingDetail/NotificationSection';
import { NOTIFICATION_TYPE } from '../services/bookingDetailService';

export function ProfileTab({ userInfo, onUpdateUserInfo, isLoading }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editInfo, setEditInfo] = useState(userInfo || {});
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState(null);

    // userInfo가 변경되면 editInfo도 업데이트
    useEffect(() => {
        if (userInfo) {
            setEditInfo({ ...userInfo });
        }
    }, [userInfo]);

    const showNotification = (message, type = NOTIFICATION_TYPE.INFO) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);

        const newErrors = AccountForm.validateAllFields(editInfo);
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            setIsSaving(false);
            return;
        }

        try {
            const updatePayload = new FormData();
            updatePayload.append('name', editInfo.name);
            updatePayload.append('nickname', editInfo.nickname);
            updatePayload.append('phone', editInfo.phone);
            updatePayload.append('address', editInfo.address);

            // 프로필 이미지 변경 검증
            const isNewFileUploaded =
                editInfo.profileImage instanceof File &&
                editInfo.profilePreview;

            if (isNewFileUploaded) {
                updatePayload.append('profileImage', editInfo.profileImage);
            }

            const result = await onUpdateUserInfo(updatePayload);
            if (result.success) {
                setIsEditing(false);
                setEditInfo({ ...userInfo });
            }
        } catch (error) {
            console.error('Profile update failed:', error);
            setErrors({
                _general:
                    error.response?.data?.message ||
                    '정보 수정에 실패했습니다. 다시 시도해주세요.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditInfo({ ...userInfo });
        setIsEditing(false);
        setErrors({});
    };

    const handleInputChange = (field) => (e) => {
        let value = e.target.value;

        if (field === 'phone') {
            value = AccountForm.formatPhoneNumber(value);
        }

        const updatedData = {
            ...editInfo,
            [field]: value,
        };

        setEditInfo(updatedData);

        const error = AccountForm.validateField(field, value, updatedData);
        setErrors((prev) => ({
            ...prev,
            [field]: error,
        }));
    };

    const handleProfileImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const errorMsg = AccountForm.validateImageFile(file);
        if (errorMsg) {
            showNotification(errorMsg, NOTIFICATION_TYPE.ERROR);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setEditInfo((prev) => ({
                ...prev,
                profileImage: file,
                profilePreview: e.target.result, // base64 문자열
            }));
        };
        reader.readAsDataURL(file);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!userInfo) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400">
                    사용자 정보를 불러올 수 없습니다.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Error Message Banner */}
            {notification && (
                <NotificationSection notification={notification} />
            )}

            {/* Profile Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <ProfileUploaderSection
                        userInfo={editInfo}
                        isEditing={isEditing}
                        profilePreview={editInfo.profilePreview}
                        onImageChange={handleProfileImage}
                    />
                    <div>
                        <h3 className="text-2xl font-bold">{userInfo.name}</h3>
                        <p className="text-gray-400">@{userInfo.username}</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        if (isEditing) {
                            handleCancelEdit(); // 수정 취소
                        } else {
                            setIsEditing(true); // 수정 시작
                        }
                    }}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    <Edit2 size={16} />
                    <span>{isEditing ? '취소' : '수정'}</span>
                </button>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profileInputType.map(
                    ({ name, type, icon, labelName, disable }) => (
                        <EditProfileForm
                            key={name}
                            icon={icon}
                            name={name}
                            labelName={labelName}
                            type={type}
                            value={
                                isEditing
                                    ? editInfo[name] || ''
                                    : userInfo[name] || ''
                            }
                            onChange={handleInputChange(name)}
                            disabled={disable ? disable : !isEditing}
                            error={errors[name]}
                        />
                    ),
                )}
            </div>

            {/* Save Button */}
            {isEditing && (
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="flex items-center space-x-2 px-6 py-3 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        <X size={16} />
                        <span>취소</span>
                    </button>
                    <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex items-center space-x-2 px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <Save size={16} />
                        )}
                        <span>{isSaving ? '저장 중...' : '저장'}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
