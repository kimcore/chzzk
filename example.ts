// import * from "chzzk"
import {ChzzkClient} from "./src"

async function example() {
    const client = new ChzzkClient()

    const results = await client.search.channels("녹두로로")
    const channel = results.channels[0]

    const liveStatus = await client.lives.status(channel.channelId)

    const chzzkChat = client.chat(liveStatus.chatChannelId)

    chzzkChat.on('connect', () => {
        console.log('Connected')
        chzzkChat.requestRecentChat(50)
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
}

example()