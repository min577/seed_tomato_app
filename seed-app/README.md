# 🌱 Seed - 토마토 스마트팜 앱

SEED 회사의 토마토 스마트팜 모니터링 및 관리 앱

## 🎨 디자인

- SEED 브랜드 컬러 (#1B4D3E, #4CAF50)
- 토스 스타일 미니멀 디자인
- 깔끔한 카드 UI, 둥근 모서리, 그림자

## 📱 기능

### 1. 홈 (대시보드)
- 오늘의 토마토 현황 (수확률)
- 실시간 메트릭 (수확 가능, 미성숙, 병해, 꽃송이)
- 최근 알림

### 2. AI 채팅
- 재배 상담 채팅봇
- 카메라 촬영 → YOLO 분석
- 이미지 기반 토마토 상태 분석

### 3. 실시간 모니터링
- 라즈베리파이 카메라 스트리밍
- 실시간 토마토 현황 오버레이
- 스냅샷 저장

### 4. 마이페이지
- 농가 정보
- 농가 일지
- 수확량 기록
- 설정

## 🚀 설치 및 실행

### 1. 프로젝트 생성
```bash
# Expo 프로젝트 생성
npx create-expo-app seed-app
cd seed-app

# 제공된 파일들을 프로젝트에 복사
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
# iOS
npm run ios

# Android
npm run android

# 웹
npm run web
```

### 4. Expo Go로 테스트
```bash
npm start
```
- iOS: Expo Go 앱에서 QR 코드 스캔
- Android: Expo Go 앱에서 QR 코드 스캔

## 📦 빌드 및 배포

### EAS Build 설정
```bash
# EAS CLI 설치
npm install -g eas-cli

# EAS 로그인
eas login

# 프로젝트 설정
eas build:configure

# Android APK 빌드
eas build --platform android --profile preview

# iOS 빌드
eas build --platform ios --profile preview
```

### Play Store / App Store 배포
```bash
# Android
eas submit --platform android

# iOS
eas submit --platform ios
```

## 🔧 설정

### API 엔드포인트
`services/api.js` 파일에서 수정:
```javascript
const BASE_URL = 'http://seedfarm.co.kr:5678/webhook/app';
```

### 브랜드 컬러
`App.js` 파일에서 수정:
```javascript
const COLORS = {
  primary: '#1B4D3E',
  secondary: '#4CAF50',
  // ...
};
```

## 📂 프로젝트 구조

```
seed-app/
├── App.js                 # 메인 앱 & 네비게이션
├── app.json              # Expo 설정
├── package.json          # 의존성
├── screens/              # 화면
│   ├── HomeScreen.js     # 홈 (대시보드)
│   ├── ChatScreen.js     # AI 채팅
│   ├── MonitorScreen.js  # 실시간 모니터링
│   └── MyPageScreen.js   # 마이페이지
├── services/             # API
│   └── api.js           # API 호출 함수
└── assets/              # 이미지, 아이콘
    ├── icon.png
    ├── splash.png
    └── seed-logo.png
```

## 🌐 API 연동

### 백엔드 API
- Base URL: `http://seedfarm.co.kr:5678/webhook/app`
- API Key: `tomato-farm-2024`

### 엔드포인트
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/home` | 홈 데이터 |
| POST | `/chat` | AI 채팅 |
| POST | `/analyze` | 이미지 분석 |
| GET | `/diary` | 일지 조회 |
| POST | `/diary` | 일지 저장 |

## 📸 스크린샷

(앱 실행 후 스크린샷 추가)

## 🔑 권한

- **카메라**: 토마토 촬영 및 분석
- **갤러리**: 사진 선택

## 🐛 문제 해결

### 카메라 권한 오류
```bash
# iOS
cd ios && pod install && cd ..

# Android
# AndroidManifest.xml 확인
```

### API 연결 실패
- 서버 URL 확인
- 네트워크 연결 확인
- CORS 설정 확인

## 📞 문의

- 웹사이트: https://www.seedglobal.co
- 이메일: info@seedglobal.co

## 📄 라이선스

© 2024 Seed Global. All rights reserved.
