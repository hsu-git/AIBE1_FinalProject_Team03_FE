// React 앱의 진입점 역할
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // BrowserRouter 임포트
import App from './App.jsx'; // 메인 App 컴포넌트 임포트
import './index.css'; // 전역 CSS 파일
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/*
      BrowserRouter는 애플리케이션 전체를 감싸서 라우팅 기능을 활성화합니다.
      이는 HTML5 History API를 사용하여 URL을 관리합니다.
    */}
        <BrowserRouter>
            <AuthProvider>
                <App /> {/* App 컴포넌트 안에서 라우트를 정의합니다. */}
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
);
