# CHZZK

[![npm version](https://img.shields.io/npm/v/chzzk.svg?style=for-the-badge)](https://www.npmjs.org/package/chzzk) [![install size](https://img.shields.io/bundlephobia/min/chzzk?style=for-the-badge)](https://packagephobia.com/result?p=chzzk) [![npm downloads](https://img.shields.io/npm/dm/chzzk.svg?style=for-the-badge)](http://npm-stat.com/charts.html?package=chzzk) [![license](https://img.shields.io/github/license/kimcore/chzzk?style=for-the-badge)](https://github.com/kimcore/chzzk/blob/master/LICENSE)

네이버 라이브 스트리밍 서비스 CHZZK의 비공식 API 라이브러리입니다.

현재 구현된 기능은 다음과 같습니다.

- 로그인 (쿠키 사용)
- 검색 (채널, 영상, 생방송)
- 채널 정보 조회
- 방송 상태 및 상세 정보 조회
- 채팅 (일부 이벤트 미지원)

## 설치

> Node 18 이상에서만 동작합니다.

```bash
npm install chzzk
pnpm add chzzk
yarn add chzzk
```

## 예시

`chzzk.naver.com` 에 로그인 하신 후, 개발자 도구를 열어 `Application > Cookies > https://chzzk.naver.com` 에서 `NID_AUT` 과 `NID_SES` 쿠키를
확인하실 수 있습니다.

```ts
// 로그인 옵션 (선택사항)
const options = {
    nidAuth: "NID_AUT 쿠키",
    nidSession: "NID_SES 쿠키"
}

const client = new ChzzkClient(options)

// 채널 검색
const result = await client.search.channels("녹두로로")
const channel = result.channels[0]

// 설정된 방송 정보, 방송 중이 아닐 경우에도 정보가 존재할 수 있음
const liveDetail = await client.live.detail(channel.channelId)

if (liveDetail) {
    const media = liveDetail.livePlayback.media // 방송 중이 아닐 경우 비어있음
    const hls = media.find(media => media.mediaId === "HLS") // HLS, LLHLS

    if (hls) {
        const m3u8 = await client.fetch(hls.path).then(r => r.text())
        console.log(m3u8)
    }
}

// 채팅 인스턴스 생성
const chatChannelId = liveDetail.chatChannelId // 고유한 6자리 ID, channelId와는 별개
const chzzkChat = client.chat(chatChannelId)

chzzkChat.on('connect', () => {
    console.log('Connected')

    // 최근 50개의 채팅을 요청 (선택사항, 이 요청으로 불러와진 채팅 및 도네이션은 isRecent 값이 true)
    chzzkChat.requestRecentChat(50)

    // 채팅 전송 (로그인 시에만 가능)
    chzzkChat.sendChat('안녕하세요')
})

// 일반 채팅
chzzkChat.on('chat', chat => {
    const message = chat.hidden ? "[블라인드 처리 됨]" : chat.message
    console.log(`${chat.profile.nickname}: ${message}`)
})

// 후원 채팅
chzzkChat.on('donation', donation => {
    console.log(`\n>> ${donation.profile.nickname} 님이 ${donation.extras.payAmount}원 후원`)
    if (donation.message) {
        console.log(`>> ${donation.message}`)
    }
    console.log()
})

// 시스템 메시지
// !!! 현시점에서 제대로 된 테스트가 불가하기에, systemMessage 이벤트는 사용하지 않는 것을 권장합니다 !!!
chzzkChat.on('systemMessage', systemMessage => {
    console.log(systemMessage.extras.description)
})

// 채팅 블라인드
chzzkChat.on('blind', blind => {
    console.log(blind)
})

// 고정 메시지
chzzkChat.on('notice', notice => {
    console.log(notice)
})

// RAW 이벤트
// chzzkChat.on('raw', raw => {
//     console.log(raw)
// })

// 채팅 연결
await chzzkChat.connect()
```

## 브라우저 사용

ChzzkChat 은 브라우저 환경에서도 사용이 가능합니다.

`chatChannelId`, `accessToken`, `uid` 값을 제공해야 합니다.
(해당 값들은 서버 환경에서만 불러올 수 있음)

```ts
import {ChzzkChat} from "chzzk"

// uid 값은 선택사항 (로그인 시에만 사용, ChzzkClient.user() 함수의 userIdHash 값)
const chzzkChat = ChzzkChat.fromAccessToken(chatChannelId, accessToken, uid)
```