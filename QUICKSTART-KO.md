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

`QA` 버튼을 누르면 WebView 옵션을 바꿀 수 있습니다. 버튼이 화면을 가리면 원하는 위치로 끌어서 옮길 수 있습니다.

- `Edge`: WebView가 전체 화면으로 뜹니다. 웹에서 safe-area 처리를 직접 확인할 때 사용합니다.
- `Safe`: 앱이 native safe-area를 적용합니다. 웹 화면이 notch/status/home 영역 안으로 들어오는지 확인할 때 사용합니다.

주소 입력란에서 다른 테스트 주소를 입력하고 `Load`를 누를 수 있습니다.

- 일반 도메인은 `https://`를 생략해도 됩니다. 앱 입력란에서는 `localhost:8080`, `10.0.2.2:8080`, 사설 IP 같은 로컬 주소에 `http://`를 붙입니다.
- 잘못된 주소는 입력란 아래에 이유가 표시됩니다. 현재 페이지는 그대로 유지됩니다.
- `Start`는 앱을 실행할 때 지정한 시작 주소로 돌아갑니다. 스테이지 주소로 실행했다면 그 스테이지 주소로 돌아갑니다.
- 페이지를 불러오지 못하면 `Retry`로 다시 시도할 수 있습니다. `QA`를 열지 않아도 오류 안내가 표시됩니다.
- Android의 뒤로가기 버튼은 QA 패널을 먼저 닫고, 패널이 닫혀 있으면 웹페이지의 이전 화면으로 이동합니다.
- 가로 화면이나 작은 화면에서는 QA 패널 내부를 스크롤할 수 있습니다.

## 문제가 생기면

아래 명령을 실행하거나 Codex에게 실행해달라고 요청하세요.

```bash
pnpm run doctor
```

Node.js나 pnpm 자체가 없어 위 명령이 실행되지 않으면 다음 명령으로 설치 상태를 확인하세요.

```bash
bash scripts/doctor.sh
```
