# CHZZK

[![npm version](https://img.shields.io/npm/v/chzzk.svg?style=for-the-badge)](https://www.npmjs.org/package/chzzk) [![install size](https://img.shields.io/bundlephobia/min/chzzk?style=for-the-badge)](https://packagephobia.com/result?p=chzzk) [![npm downloads](https://img.shields.io/npm/dm/chzzk.svg?style=for-the-badge)](http://npm-stat.com/charts.html?package=chzzk) [![license](https://img.shields.io/github/license/kimcore/chzzk?style=for-the-badge)](https://github.com/kimcore/chzzk/blob/master/LICENSE)

네이버 라이브 스트리밍 서비스 CHZZK의 비공식 API 라이브러리입니다.

현재 구현된 기능은 다음과 같습니다.

- 로그인 (쿠키 사용)
- 검색 (채널, 영상, 생방송, 라운지, 자동완성)
- 채널 정보 조회
- 방송 상태 및 상세 정보 조회
- 채팅
- 관리 (채팅 제한, 활동 제한, 방송 설정, 금칙어 설정 등)

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
const result = await client.search.channels("녹두로")
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
const chzzkChat = client.chat({
    channelId: channel.channelId,
    // chatChannelId 의 변경을 감지하기 위한 polling 요청의 주기 (선택사항, ms 단위)
    // channelId를 지정할 경우 자동으로 30초로 설정됨, 0초로 설정 시 polling 요청을 하지 않음
    pollInterval: 30 * 1000
})

chzzkChat.on('connect', () => {
    console.log('Connected')

    // 최근 50개의 채팅 및 고정 메시지를 요청 (선택사항, 도네 및 시스템 메시지 포함이므로 주의)
    chzzkChat.requestRecentChat(50)
})

// 재연결 (방송 시작 시)
chzzkChat.on('reconnect', newChatChannelId => {
    console.log(`Reconnected to ${newChatChannelId}`)
})

// 일반 채팅
chzzkChat.on('chat', chat => {
    const message = chat.hidden ? "[블라인드 처리 됨]" : chat.message
    console.log(`${chat.profile.nickname}: ${message}`)

    // 유저의 팔로우 일시 불러오기
    // client.chat.profileCard(chzzkChat.chatChannelId, chat.profile.userIdHash).then(profile => {
    //     const following = profile.streamingProperty.following
    //     console.log(following ? `${following.followDate} 에 팔로우 함` : "팔로우 안함")
    // })
})

// 후원 채팅
chzzkChat.on('donation', donation => {
    console.log(`\n>> ${donation.profile?.nickname ?? "익명의 후원자"} 님의 ${donation.extras.payAmount}원 ${donationTypeName(donation.extras.donationType)}`)
    if (donation.message) {
        console.log(`>> ${donation.message}`)
    }
    console.log()
})

// 구독
chzzkChat.on('subscription', subscription => {
    console.log(`${subscription.profile.nickname} 님이 ${subscription.extras.month} 개월 동안 ${subscription.extras.tierName} 구독중`)
})

// 시스템 메시지 (채팅 제한, 활동 제한, 운영자 임명 등)
chzzkChat.on('systemMessage', systemMessage => {
    console.log(systemMessage.extras.description)
})

// 고정 메시지
chzzkChat.on('notice', notice => {
    // 고정 해제 시 null
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

```ts
// Webpack 등의 모듈 번들러를 통해 사용할 경우
import {ChzzkChat} from "chzzk"

// script 태그에서 사용할 경우
import {ChzzkChat} from "https://cdn.skypack.dev/chzzk"
```

```ts
// chatChannelId, accessToken 값을 제공해야 합니다. (해당 값들은 서버 환경에서만 불러올 수 있음)
const client = new ChzzkChat({
    chatChannelId,
    accessToken
})
```

## CORS 우회 방법

`baseUrls` 옵션을 설정하여 ChzzkClient가 요청을 보내는 API 주소를 변경할 수 있습니다.

해당 옵션을 설정할 경우 브라우저 (클라이언트) 에서도 ChzzkClient의 사용이 가능합니다.

```ts
const client = new ChzzkClient({
    baseUrls: {
        chzzkBaseUrl: "https://api.chzzk.naver.com",
        gameBaseUrl: "https://comm-api.game.naver.com/nng_main"
    }
})
```
