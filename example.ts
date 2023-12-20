// import * from "chzzk"
import {ChzzkClient} from "./src"

async function example() {
    const client = new ChzzkClient()

    // 채널 검색
    const result = await client.search.channels("녹두로로")
    const channel = result.channels[0]

    // 현재 방송 정보 불러오기
    const liveDetail = await client.live.detail(channel.channelId)

    const media = liveDetail.livePlayback.media // 방송 중이 아닐 경우 비어있음
    const hls = media.find(media => media.mediaId === "HLS") // HLS, LLHLS

    if (hls) {
        const m3u8 = await client.fetch(hls.path).then(r => r.text())
        console.log(m3u8)
    }

    // 채팅 인스턴스 생성
    const chatChannelId = liveDetail.chatChannelId // 고유한 6자리 ID, channelId와는 별개
    const chzzkChat = client.chat(chatChannelId)

    chzzkChat.on('connect', () => {
        console.log('Connected')

        // 최근 50개의 채팅을 요청 (선택사항)
        chzzkChat.requestRecentChat(50)

        // 채팅 전송 (로그인 시에만 가능)
        chzzkChat.sendChat('안녕하세요')
    })

    // 일반 채팅
    chzzkChat.on('chat', chat => {
        console.log(`${chat.profile.nickname}: ${chat.message}`)
    })

    // 후원 채팅
    chzzkChat.on('donation', donation => {
        console.log(`\n>> ${donation.profile.nickname} 님이 ${donation.extras.payAmount}원 후원`)
        if (donation.message) {
            console.log(`>> ${donation.message}`)
        }
        console.log()
    })

    // 채팅 연결
    await chzzkChat.connect()
}

example()