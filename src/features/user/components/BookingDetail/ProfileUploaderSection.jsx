import { Camera } from 'lucide-react';

export function ProfileUploaderSection({
    userInfo,
    isEditing,
    profilePreview,
    onImageChange,
}) {
    return (
        <div className="relative">
            <div className="w-20 h-20 bg-orange-300 rounded-full overflow-hidden">
                {profilePreview ? (
                    <img
                        src={profilePreview}
                        className="w-full h-full object-cover"
                    />
                ) : userInfo.profileImage ? (
                    <img
                        src={userInfo.profileImage}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-2xl font-bold text-white">
                        {userInfo.name?.charAt(0) || 'U'}
                    </span>
                )}
            </div>

            <label
                htmlFor="profileImageUpload"
                className={`absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 shadow-md cursor-pointer ${
                    isEditing ? '' : 'hidden'
                }`}
            >
                <Camera size={16} className="text-white" />
            </label>

            <input
                id="profileImageUpload"
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
            />
        </div>
    );
}
