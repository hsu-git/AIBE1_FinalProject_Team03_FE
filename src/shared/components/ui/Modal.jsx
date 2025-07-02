// src/shared/components/ui/Modal.jsx

import React, { useEffect } from 'react';

/**
 * ===== Modal 컴포넌트 =====
 *
 * 재사용 가능한 모달 컴포넌트
 * 리뷰 작성, 기대평 작성, 삭제 확인 등에 사용
 */
const Modal = ({
    // ===== 필수 props =====
    isOpen = false, // 모달 열림/닫힘 상태
    onClose, // 모달 닫기 핸들러
    children, // 모달 내용

    // ===== 선택적 props =====
    title = '', // 모달 제목
    showCloseButton = true, // X 버튼 표시 여부
    closeOnBackdrop = true, // 배경 클릭 시 닫기
    closeOnEsc = true, // ESC 키로 닫기

    // ===== 스타일 props =====
    size = 'medium', // 'small' | 'medium' | 'large'
    className = '', // 추가 CSS 클래스
}) => {
    // ESC 키 이벤트 처리
    useEffect(() => {
        if (!isOpen || !closeOnEsc) return;

        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose?.();
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [isOpen, closeOnEsc, onClose]);

    // 스크롤 방지
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // 모달이 열려있지 않으면 렌더링하지 않음
    if (!isOpen) return null;

    // 배경 클릭 핸들러
    const handleBackdropClick = (event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) {
            onClose?.();
        }
    };

    // 모달 크기별 스타일
    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return { maxWidth: '400px', width: '90vw' };
            case 'large':
                return { maxWidth: '800px', width: '90vw' };
            case 'medium':
            default:
                return { maxWidth: '600px', width: '90vw' };
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px',
            }}
            onClick={handleBackdropClick}
            className={`modal-backdrop ${className}`}
        >
            <div
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow:
                        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    position: 'relative',
                    ...getSizeStyles(),
                }}
                onClick={(e) => e.stopPropagation()}
                className="modal-content"
            >
                {/* 모달 헤더 */}
                {(title || showCloseButton) && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '20px 24px',
                            borderBottom: '1px solid #e5e7eb',
                        }}
                    >
                        {title && (
                            <h2
                                style={{
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    color: '#1f2937',
                                    margin: 0,
                                }}
                            >
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    color: '#6b7280',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    borderRadius: '4px',
                                    transition: 'color 0.2s ease',
                                }}
                                onMouseEnter={(e) =>
                                    (e.target.style.color = '#374151')
                                }
                                onMouseLeave={(e) =>
                                    (e.target.style.color = '#6b7280')
                                }
                                aria-label="모달 닫기"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                )}

                {/* 모달 본문 */}
                <div
                    style={{
                        padding: title || showCloseButton ? '24px' : '24px',
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
