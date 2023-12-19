# CHZZK

네이버 라이브 스트리밍 서비스 CHZZK의 비공식 API 라이브러리입니다.

현재 구현된 기능은 다음과 같습니다.

- 로그인 (쿠키 사용)
- 검색 (채널, 영상, 생방송)
- 채널 정보 조회
- 방송 상태 및 상세 정보 조회
- 채팅

## 설치

> Node 18 이상에서만 동작합니다.

```bash
npm install chzzk
pnpm add chzzk
yarn add chzzk
```

## 예시

```ts
// 로그인 옵션 (선택사항)
const options = {
    nidAuth: "NID_AUT 쿠키",
    nidSession: "NID_SES 쿠키"
}

const client = new ChzzkClient(options)

const results = await client.search.channels("녹두로로")
const channel = results.channels[0]

const liveStatus = await client.live.status(channel.channelId)

const chzzkChat = client.chat(liveStatus.chatChannelId)

chzzkChat.on('connect', () => {
    console.log('Connected')
    chzzkChat.requestRecentChat(50) // 최근 50개의 채팅을 요청 (선택사항)

    // 채팅 전송 (로그인 시에만 가능)
    chzzkChat.sendChat('안녕하세요')
})

chzzkChat.on('chat', chat => {
    console.log(`${chat.profile.nickname}: ${chat.message}`)
})

chzzkChat.on('donation', donation => {
    console.log(`\n>> ${donation.profile.nickname} 님이 ${donation.extras.payAmount}원 후원`)
    if (donation.message) {
        console.log(`>> ${donation.message}`)
    }
    console.log()
})

await chzzkChat.connect()
```

## 로그인
`chzzk.naver.com` 에 로그인 하신 후, 개발자 도구를 열어 `Application > Cookies > https://chzzk.naver.com` 에서 `NID_AUT` 과 `NID_SES` 쿠키를 확인하실 수 있습니다.
