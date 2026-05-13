# 설치 가이드

이 문서는 비개발자가 Codex 같은 도구로 스테이지 주소를 iOS/Android WebView에서 열기 위한 준비 절차입니다.

## 먼저 정하기

iOS 시뮬레이터는 macOS와 Xcode가 필요합니다. Windows에서는 iOS 시뮬레이터를 설치할 수 없습니다.

Android 에뮬레이터는 macOS/Windows/Linux에서 가능하지만, 이 저장소의 스크립트는 macOS 기본 Android SDK 경로를 우선 지원합니다.

## 공통 준비

### 1. Node.js 설치

Node.js 공식 사이트에서 LTS 버전을 설치합니다.

- 공식 다운로드: https://nodejs.org/en/download
- 권장: Node.js LTS 24 이상

설치 확인:

```bash
node -v
npm -v
```

### 2. pnpm 설치

이 저장소는 `pnpm@10.11.0`을 사용합니다.

```bash
npm install --global corepack@latest
corepack enable pnpm
corepack prepare pnpm@10.11.0 --activate
pnpm -v
```

위 명령이 어렵다면 Codex에게 이렇게 요청하세요.

```text
이 저장소를 실행할 수 있게 Node.js와 pnpm 상태를 확인하고, pnpm이 없으면 설치 방법을 알려줘.
```

## iOS 시뮬레이터 준비

### 1. Xcode 설치

Mac App Store에서 Xcode를 설치합니다.

- Apple 공식 문서: https://developer.apple.com/documentation/safari-developer-tools/installing-xcode-and-simulators
- Expo iOS Simulator 문서: https://docs.expo.dev/workflow/ios-simulator

설치 후 Xcode를 한 번 실행하고, 필요한 초기 설정과 라이선스 동의를 완료합니다.

### 2. Command Line Tools 선택

Xcode에서:

```text
Xcode > Settings > Locations > Command Line Tools
```

가장 최신 Xcode 버전을 선택합니다.

### 3. iOS Simulator runtime 설치

Xcode에서:

```text
Xcode > Settings > Components 또는 Platforms
```

iOS Simulator runtime을 설치합니다. Xcode 버전에 따라 메뉴 이름이 `Components` 또는 `Platforms`로 보일 수 있습니다.

확인:

```bash
xcrun simctl list devices available
```

## Android 에뮬레이터 준비

### 1. Android Studio 설치

Android Studio 공식 사이트에서 설치합니다.

- 설치 문서: https://developer.android.com/studio/install
- Emulator 문서: https://developer.android.com/studio/run/emulator
- Virtual Device 문서: https://developer.android.com/studio/run/managing-avds

Android Studio 첫 실행 시 Setup Wizard에서 권장 SDK 패키지를 설치합니다.

### 2. Android Virtual Device 만들기

Android Studio에서:

```text
More Actions > Virtual Device Manager
```

또는 프로젝트를 연 뒤:

```text
View > Tool Windows > Device Manager > + > Create Virtual Device
```

권장 설정:

- Device: Pixel 계열 phone
- System Image: Recommended 탭의 최신 안정 Android 이미지
- AVD 이름: 기본값 사용 가능

확인:

```bash
pnpm android:avds
```

## ZIP으로 받은 경우

1. ZIP 파일 압축을 풉니다.
2. Codex에서 압축을 푼 폴더를 엽니다.
3. Codex에게 아래처럼 요청합니다.

```text
이 저장소를 준비하고 https://stage.example.com 을 iOS WebView로 열어줘.
문제가 있으면 pnpm run doctor 결과를 보고 해결해줘.
```

Android도 같이 확인하려면:

```text
이 저장소를 준비하고 https://stage.example.com 을 iOS와 Android WebView에서 각각 열어줘.
문제가 있으면 pnpm run doctor 결과를 보고 해결해줘.
```

## 직접 실행

처음 한 번:

```bash
pnpm install
```

iOS:

```bash
pnpm launch:ios https://stage.example.com
```

Android:

```bash
pnpm launch:android https://stage.example.com
```

## 문제 확인

아래 명령을 실행하면 필요한 환경이 잡혀 있는지 확인합니다.

```bash
pnpm run doctor
```

Codex를 쓰는 경우:

```text
pnpm run doctor를 실행해서 iOS/Android 실행에 부족한 설치 항목을 알려줘.
```
