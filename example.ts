// import * from "chzzk"
import * as chzzk from "./src"

async function example() {
    const channels = await chzzk.searchChannels("김진우")
    const channel = channels[0]

    const liveStatus = await chzzk.getLiveStatus(channel.channelId)

    const chzzkChat = new chzzk.ChzzkChat(liveStatus.chatChannelId)

    chzzkChat.on("connect", (message) => {
        console.log("Connected")
        chzzkChat.requestRecentChat(50) // 최근 50개의 채팅을 요청, 필수는 아님
    })

    chzzkChat.on('chat', chat => {
        console.log(`[${chat.extras.osType}] ${chat.profile.nickname}: ${chat.message}`)
    })

    await chzzkChat.connect()
}

example()