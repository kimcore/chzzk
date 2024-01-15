// import * from "chzzk"
import {ChzzkClient} from "./src"

async function example() {
    const client = new ChzzkClient()

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
    const chzzkChat = client.chat({
        channelId: channel.channelId,
        // chatChannelId 의 변경을 감지하기 위한 polling 요청의 주기 (선택사항, ms 단위)
        // channelId를 지정할 경우 자동으로 30초로 설정됨, 0초로 설정 시 polling 요청을 하지 않음
        pollInterval: 30 * 1000
    })

    chzzkChat.on('connect', chatChannelId => {
        console.log(`Connected to ${chatChannelId}`)

        // 최근 50개의 채팅을 요청 (선택사항, 이 요청으로 불러와진 채팅 및 도네이션은 isRecent 값이 true)
        chzzkChat.requestRecentChat(50)

        // 채팅 전송 (로그인 시에만 가능)
        chzzkChat.sendChat('안녕하세요')
    })

    // 재연결 (방송 시작 시)
    chzzkChat.on('reconnect', chatChannelId => {
        console.log(`Reconnected to ${chatChannelId}`)
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
}

example()