import WebSocket from "isomorphic-ws"
import {ChatCmd, ChatType, Events} from "./types"
import {GAME_API_URL} from "../consts"
import {ChzzkClient} from "../client"

export class ChzzkChat {
    connected: boolean = false

    private readonly client: ChzzkClient
    private ws: WebSocket
    private readonly chatChannelId: string
    private accessToken?: string
    private sid: string
    private uid?: string
    private handlers: [string, (data: Event) => void][] = []
    private readonly defaults = {}

    private constructor(
        chatChannelId: string,
        client: ChzzkClient = null,
        accessToken: string = null,
        uid: string = null
    ) {
        this.client = client
        this.chatChannelId = chatChannelId
        this.defaults = {
            cid: chatChannelId,
            svcid: "game",
            ver: "2"
        }
        this.accessToken = accessToken
        this.uid = uid
    }

    static fromClient(chatChannelId: string, client: ChzzkClient) {
        return new ChzzkChat(chatChannelId, client)
    }

    static fromAccessToken(chatChannelId: string, accessToken: string, uid?: string) {
        return new ChzzkChat(chatChannelId, null, accessToken, uid)
    }

    async connect() {
        if (this.connected) {
            throw new Error('Already connected')
        }

        if (this.client) {
            const url = `${GAME_API_URL}/v1/chats/access-token?channelId=${this.chatChannelId}&chatType=STREAMING`
            const json = await this.client.fetch(url).then(r => r.json())

            this.uid = this.client.hasAuth ?
                await this.client.user().then(user => user.userIdHash) :
                null

            this.accessToken = json['content']['accessToken']
        }

        this.ws = new WebSocket("wss://kr-ss1.chat.naver.com/chat")

        this.ws.on("open", () => {
            this.ws.send(JSON.stringify({
                bdy: {
                    accTkn: this.accessToken,
                    auth: this.uid ? "SEND" : "READ",
                    devType: 2001,
                    uid: this.uid
                },
                cmd: ChatCmd.CONNECT,
                tid: 1,
                ...this.defaults
            }))
        })

        this.ws.on("message", this.handleMessage.bind(this))

        this.ws.on('close', () => {
            this.emit('disconnect', null)

            this.ws = null
            this.disconnect()
        })
    }

    async disconnect() {
        if (!this.connected) {
            throw new Error('Not connected')
        }

        this.ws?.close()

        this.ws = null
        this.sid = null

        if (this.client) {
            this.accessToken = null
            this.uid = null
        }

        this.connected = false
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

    sendChat(message: string) {
        if (!this.connected) {
            throw new Error('Not connected')
        }

        if (!this.uid) {
            throw new Error('Not logged in')
        }

        const extras = {
            chatType: "STREAMING",
            emojis: "",
            osType: "PC",
            streamingChannelId: this.chatChannelId
        }

        this.ws.send(JSON.stringify({
            bdy: {
                extras: JSON.stringify(extras),
                msg: message,
                msgTime: Date.now(),
                msgTypeCode: ChatType.TEXT
            },
            retry: false,
            cmd: ChatCmd.SEND_CHAT,
            sid: this.sid,
            tid: 3,
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

                    const type = chat['msgTypeCode'] || chat['messageTypeCode']

                    const memberCount = chat['mbrCnt'] || chat['memberCount']
                    const time = chat['msgTime'] || chat['createTime']

                    const payload = {
                        profile,
                        extras,
                        message,
                        memberCount,
                        time
                    }

                    if (type == ChatType.DONATION) {
                        this.emit('donation', payload)
                    } else {
                        this.emit('chat', payload)
                    }
                }

                break
        }
    }

    on<T extends keyof Events>(event: T, handler: (data: Events[typeof event]) => void) {
        const e = event as string
        this.handlers[e] = this.handlers[e] || []
        this.handlers[e].push(handler)
    }
}