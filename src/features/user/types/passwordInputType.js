import { Lock } from 'lucide-react';

export const passwordInputType = [
    {
        name: 'curPwd',
        type: 'password',
        icon: Lock,
        labelName: '현재 비밀번호',
        toggle: true,
    },
    {
        name: 'newPwd',
        type: 'password',
        icon: Lock,
        labelName: '새 비밀번호',
        toggle: true,
    },
    {
        name: 'confirmPwd',
        type: 'password',
        icon: Lock,
        labelName: '새 비밀번호 확인',
    },
];
