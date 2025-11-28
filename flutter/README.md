# 🍅 토마토 스마트팜 앱

SEED FARM 토마토 스마트팜 관리 앱 - Flutter 버전

## 📱 주요 기능

| 탭 | 기능 | 설명 |
|---|------|------|
| 🏠 **홈** | 실시간 모니터링 | MJPEG 스트리밍, 토마토 현황, 알림 |
| 🤖 **AI 챗봇** | 재배 상담 | Gemini 기반 농업 AI 어시스턴트 |
| 📷 **사진 분석** | YOLO 분석 | 토마토 분류, 병해충 AI 진단 |
| 📝 **농장 일지** | 기록 관리 | 일별 데이터 조회, 메모 저장 |
| 💰 **시장 가격** | 가격 정보 | KAMIS 도매가, 온라인 비교, 추이 |

## 🛠 기술 스택

- **Framework**: Flutter 3.0+
- **State Management**: setState (간단한 구조)
- **HTTP Client**: http 패키지
- **Image Picker**: image_picker 패키지

## 📁 프로젝트 구조

```
lib/
├── main.dart                    # 앱 진입점 & 네비게이션
├── config/
│   └── app_theme.dart          # 테마 & 색상 정의
├── services/
│   └── api_service.dart        # API 통신 클래스
├── widgets/
│   └── common_widgets.dart     # 공통 UI 컴포넌트
└── screens/
    ├── home_screen.dart        # 홈 화면
    ├── chat_screen.dart        # AI 챗봇
    ├── camera_screen.dart      # 사진 분석
    ├── diary_screen.dart       # 농장 일지
    ├── market_screen.dart      # 시장 가격
    └── prediction_screen.dart  # 수확량 예측
```

## 🚀 시작하기

### 1. 의존성 설치

```bash
flutter pub get
```

### 2. 앱 실행

```bash
# 개발 모드
flutter run

# 릴리즈 빌드 (Android)
flutter build apk --release

# 릴리즈 빌드 (iOS)
flutter build ios --release
```

## 🔧 설정

### API 서버 주소

`lib/services/api_service.dart`에서 수정:

```dart
static const String baseUrl = 'http://seedfarm.co.kr:5678/webhook';
static const String streamUrl = 'http://192.168.49.219:8080/stream';
```

### Android 권한 설정

`android/app/src/main/AndroidManifest.xml`에 추가:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
```

### iOS 권한 설정

`ios/Runner/Info.plist`에 추가:

```xml
<key>NSCameraUsageDescription</key>
<string>토마토 사진 촬영을 위해 카메라 접근이 필요합니다</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>토마토 사진 선택을 위해 갤러리 접근이 필요합니다</string>
```

## 📊 API 연동

### 사용하는 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/app/home` | GET | 홈 화면 통합 데이터 |
| `/data-realtime` | GET | 실시간 토마토 데이터 |
| `/data-history` | GET | 과거 데이터 |
| `/camera-capture` | POST | 즉시 촬영 |
| `/capture-test` | POST | 테스트 촬영 |
| `/app/chat` | POST | AI 챗봇 |
| `/capture-analyze` | POST | 이미지 YOLO 분석 |
| `/disease-diagnosis` | POST | 병해충 AI 진단 |
| `/app/diary` | GET/POST | 농장 일지 |
| `/market-price` | GET | 시장 가격 |
| `/price-compare` | GET | 가격 비교 |
| `/price-history` | GET | 가격 추이 |
| `/yield-prediction` | POST | 수확량 예측 |

## 🎨 디자인 시스템

### 색상 팔레트

| 이름 | HEX | 용도 |
|-----|-----|------|
| Primary | `#22C55E` | 메인 (수확 가능) |
| Warning | `#F59E0B` | 미성숙 |
| Error | `#EF4444` | 병해 |
| Purple | `#8B5CF6` | 화방 |

### 컴포넌트

- `TomatoMetricCard`: 토마토 상태 카드
- `TomatoStatusGrid`: 4개 상태 그리드
- `AlertBanner`: 알림 배너
- `SectionHeader`: 섹션 제목
- `RipenessProgressBar`: 성숙률 프로그레스 바
- `LoadingWidget`: 로딩 표시
- `ErrorWidget`: 에러 표시
- `EmptyStateWidget`: 빈 상태 표시

## 📝 추가 개발 계획

- [ ] 차트 라이브러리 추가 (fl_chart)
- [ ] 다크 모드 지원
- [ ] 푸시 알림
- [ ] 오프라인 캐싱
- [ ] 다국어 지원

## 👥 기여자

SEED FARM 개발팀

---

**마지막 업데이트**: 2024-11-28
