# CHZZK

네이버 라이브 스트리밍 서비스 CHZZK의 비공식 API 라이브러리입니다.

현재 구현된 기능은 다음과 같습니다.

- 채널 검색
- 채널 정보 조회
- 채널 방송 상태 조회
- 채팅 (수신만 가능)

## 설치

> Node 18 이상에서만 동작합니다.

```bash
npm install chzzk
pnpm add chzzk
yarn add chzzk
```

## 예시

```ts
import {ChzzkChat, getLiveStatus, searchChannels} from "chzzk"

const channels = await searchChannels("김진우")
const channel = channels[0]

const liveStatus = await getLiveStatus(channel.channelId)

const chzzkChat = new ChzzkChat(liveStatus.chatChannelId)

chzzkChat.on("connect", (message) => {
    console.log("Connected")
    chzzkChat.requestRecentChat(50) // 최근 50개의 채팅을 요청, 필수는 아님
})

chzzkChat.on('chat', chat => {
    console.log(`[${chat.extras.osType}] ${chat.profile.nickname}: ${chat.message}`)
})

await chzzkChat.connect()

```