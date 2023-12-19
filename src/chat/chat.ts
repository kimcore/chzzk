import WebSocket from "ws"
import {ChatCmd} from "./cmd"

interface Event {
    chat: ChatEvent
    connect: null
    disconnect: null
}

export interface ChatEvent {
    profile: ChatProfile
    extras: ChatExtras
    message: string,
    memberCount: number,
    time: number
}

export interface ChatProfile {
    userIdHash: string
    nickname: string
    profileImageUrl?: string
    userRoleCode: string
    badge: string // unknown
    title: string
    verifiedMark: boolean
    activityBadges: [] // unknown
    streamingProperty: Record<string, string> // unknown
}

export interface ChatExtras {
    chatType: "STREAMING"
    emojis: Record<string, string>
    osType: "PC" | "AOS" | "IOS"
    streamingChannelId: string
    extraToken: string
}

export class ChzzkChat {
    private ws: WebSocket
    private connected: boolean = false
    private readonly chatChannelId: string
    private accessToken: string
    private sid: string
    private handlers: [string, (data: Event) => void][] = []
    private readonly defaults = {}

    constructor(chatChannelId: string) {
        this.chatChannelId = chatChannelId
        this.defaults = {
            cid: chatChannelId,
            svcid: "game",
            ver: "2"
        }
    }

    async connect() {
        const url = `https://comm-api.game.naver.com/nng_main/v1/chats/access-token?channelId=${this.chatChannelId}&chatType=STREAMING`
        const json = await fetch(url).then(r => r.json())

        this.accessToken = json['content']['accessToken']

        this.ws = new WebSocket("wss://kr-ss1.chat.naver.com/chat")

        this.ws.on("open", () => {
            this.ws.send(JSON.stringify({
                bdy: {
                    accTkn: this.accessToken,
                    auth: "READ",
                    devType: 2001,
                    uid: null
                },
                cmd: ChatCmd.CONNECT,
                tid: 1,
                ...this.defaults
            }))
        })

        this.ws.on("message", this.handleMessage.bind(this))

        this.ws.on('close', () => {
            this.ws = null
            this.connected = false
            this.sid = null
            this.emit('disconnect', null)
        })
    }

    requestRecentChat(count: number = 50) {
        if (!this.connected) {
            throw new Error('Not connected')
        }

        this.ws.send(JSON.stringify({
            bdy: {recentMessageCount: count},
            cmd: ChatCmd.REQUEST_RECENT_CHAT,
            sid: this.sid,
            tid: 2,
            ...this.defaults
        }))
    }

    emit(event: string, data: any) {
        if (this.handlers[event]) {
            for (const handler of this.handlers[event]) {
                handler(data)
            }
        }
    }

    private async handleMessage(data: Buffer) {
        const json = JSON.parse(data.toString("utf8"))

        switch (json.cmd) {
            case ChatCmd.CONNECTED:
                this.connected = true
                this.sid = json['bdy']['sid']
                this.emit('connect', null)
                break
            case ChatCmd.PING:
                this.ws.send(JSON.stringify({
                    cmd: ChatCmd.PONG,
                    ver: "2"
                }))
                break
            case ChatCmd.CHAT:
            case ChatCmd.RECENT_CHAT:
                const chats = json.cmd == ChatCmd.CHAT ? json['bdy'] : json['bdy']['messageList']

                for (const chat of chats) {
                    const profile = JSON.parse(chat['profile'])
                    const extras = JSON.parse(chat['extras'])
                    const message = json.cmd == ChatCmd.CHAT ? chat['msg'] : chat['content']

                    this.emit('chat', {
                        profile,
                        extras,
                        message,
                        memberCount: chat['mbrCount'] || chat['memberCount'],
                        time: chat['msgTime'] || chat['createTime']
                    })
                }

                break
        }
    }

    on<T extends keyof Event>(event: T, handler: (data: Event[typeof event]) => void) {
        const e = event as string
        this.handlers[e] = this.handlers[e] || []
        this.handlers[e].push(handler)
    }
}