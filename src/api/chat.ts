import {ChzzkClient} from "../client"
import {ChatExtras} from "../chat"

export interface NoticeOptions {
    extras: string | ChatExtras
    message: string
    messageTime: number
    messageUserIdHash: string
    streamingChannelId: string
}

export async function accessToken(client: ChzzkClient, chatChannelId: string) {
    const r = await client.fetch(`${client.options.baseUrls.gameBaseUrl}/v1/chats/access-token?channelId=${chatChannelId}&chatType=STREAMING`)
    const data = await r.json()
    return data['content'] ?? null
}

export async function profileCard(client: ChzzkClient, chatChannelId: string, userIdHash: string) {
    const r = await client.fetch(`${client.options.baseUrls.gameBaseUrl}/v1/chats/${chatChannelId}/users/${userIdHash}/profile-card?chatType=STREAMING`)
    const data = await r.json()
    return data['content'] ?? null
}

export async function notice(client: ChzzkClient, chatChannelId: string, options?: NoticeOptions) {
    return client.fetch(`${client.options.baseUrls.gameBaseUrl}/v1/chats/notices`, {
        method: options ? "POST" : "DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            channelId: chatChannelId,
            chatType: "STREAMING",
            ...(options || {}),
            extras: options?.extras ? (typeof options.extras === "string" ? options.extras : JSON.stringify(options.extras)) : null
        })
    })
}