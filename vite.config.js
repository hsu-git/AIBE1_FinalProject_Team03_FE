import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
});

// // https 설정
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import fs from 'fs';

// export default defineConfig({
//   server: {
//     https: {
//       key: fs.readFileSync('./certs/localhost-key.pem'),
//       cert: fs.readFileSync('./certs/localhost.pem'),
//     },
//     port: 3000,
//     proxy: {
//       // `/api` 로 시작하는 모든 요청을 스프링부트(8080)로 포워딩
//       '/api': {
//         target: 'https://localhost:8080',  // 백엔드가 HTTP 8080번 포트라면 이대로,
//         changeOrigin: true,
//         secure: false,                    // HTTPS 로 대상 서버를 호출할 때 인증서 검증을 끄고 싶으면 true→false
//       },
//     },
//   },
//   plugins: [react()],
// });
