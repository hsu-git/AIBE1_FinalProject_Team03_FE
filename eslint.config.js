import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
// --- Prettier 통합을 위한 추가 ---
import prettierConfig from 'eslint-config-prettier';
import pluginPrettier from 'eslint-plugin-prettier';
// --- eslint-plugin-react 추가 ---
import pluginReact from 'eslint-plugin-react';

export default [
    { ignores: ['dist'] },
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        // --- settings 추가 (React 버전 감지) ---
        settings: {
            react: {
                version: 'detect', // React 버전 자동 감지
            },
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            // --- Prettier 플러그인 추가 ---
            prettier: pluginPrettier,
            react: pluginReact,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            // --- eslint-plugin-react의 권장 규칙 추가 ---
            ...pluginReact.configs.recommended.rules,

            // --- 핵심 오류 규칙 (Error 유지) ---
            // 사용되지 않는 변수는 에러로 처리하여 반드시 제거하도록 강제 (기존 설정 유지)
            'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
            // Prettier 규칙에 어긋나면 에러 발생 (기존 설정 유지)
            'prettier/prettier': 'error',
            // React Hooks 규칙 위반은 에러로 처리
            'react-hooks/rules-of-hooks': 'error',
            // JSX에서 알 수 없는 속성 사용은 에러로 처리
            'react/no-unknown-property': 'error',

            // --- 경고 규칙 조정 (Warning -> Off 또는 Error) ---

            // React Fast Refresh 관련 경고: 개발 편의를 위해 일단 경고 유지 또는 비활성화
            'react-refresh/only-export-components': [
                'warn', // 또는 'off'로 설정하여 비활성화 가능
                { allowConstantExport: true },
            ],
            // React Hook 의존성 배열 경고: 중요하므로 경고 유지 (수정 권장)
            'react-hooks/exhaustive-deps': 'warn',

            // --- 유미님이 제시한 추가 규칙 (필요시 활성화) ---
            'react/react-in-jsx-scope': 'off', // React 17+에서는 불필요
            // props 타입 검사: 현재 TypeScript를 사용하지 않는다면 경고가 많을 수 있으므로 'off'
            'react/prop-types': 'off', // props 타입 검사 (선택 사항)
            // console.log 사용: 개발 중에는 필요할 수 있으므로 'off'
            'no-console': 'off', // console.log 사용 시 경고
        },
    },
    // --- Prettier config를 extends에 마지막으로 추가 (다른 규칙들을 덮어쓰지 않도록) ---
    prettierConfig,
];
