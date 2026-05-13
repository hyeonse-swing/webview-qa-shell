# 비개발자용 빠른 실행 가이드

이 저장소는 스테이지 주소를 iOS/Android 네이티브 WebView에서 열어보는 테스트 앱입니다.

처음 설치하는 사람은 먼저 [SETUP-KO.md](./SETUP-KO.md)를 확인하세요.

## Codex에 이렇게 요청하세요

iOS로 열기:

```text
이 저장소를 준비하고 https://stage.example.com 을 iOS WebView로 열어줘.
문제가 있으면 pnpm run doctor 결과를 보고 해결해줘.
```

Android로 열기:

```text
이 저장소를 준비하고 https://stage.example.com 을 Android WebView로 열어줘.
문제가 있으면 pnpm run doctor 결과를 보고 해결해줘.
```

iOS와 Android 둘 다 열기:

```text
이 저장소를 준비하고 https://stage.example.com 을 iOS와 Android WebView에서 각각 열어줘.
문제가 있으면 pnpm run doctor 결과를 보고 해결해줘.
```

## 직접 실행할 때

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

주소 앞에 `https://`를 빼도 됩니다.

```bash
pnpm launch:ios stage.example.com
```

## 앱에서 확인할 것

앱 오른쪽 위 `QA` 버튼을 누르면 WebView 옵션을 바꿀 수 있습니다.

- `Edge`: WebView가 전체 화면으로 뜹니다. 웹에서 safe-area 처리를 직접 확인할 때 사용합니다.
- `Safe`: 앱이 native safe-area를 적용합니다. 웹 화면이 notch/status/home 영역 안으로 들어오는지 확인할 때 사용합니다.

## 문제가 생기면

아래 명령을 실행하거나 Codex에게 실행해달라고 요청하세요.

```bash
pnpm run doctor
```
