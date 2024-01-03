import WebSocket, {MessageEvent} from "isomorphic-ws"
import {ChatCmd, ChatType, Events} from "./types"
import {ChzzkClient} from "../client"
import {ChzzkAPIBaseUrls} from "../types"

export class ChzzkChat {
    connected: boolean = false

    private readonly client: ChzzkClient
    private readonly baseUrls: ChzzkAPIBaseUrls
    private ws: WebSocket
    private readonly chatChannelId: string
    private accessToken?: string
    private sid: string
    private uid?: string
    private handlers: [string, (data: any) => void][] = []
    private readonly defaults = {}
    private pingTimeout = null

    private constructor(
        chatChannelId: string,
        client: ChzzkClient = null,
        accessToken: string = null,
        uid: string = null,
        baseUrls: ChzzkAPIBaseUrls = null
    ) {
        this.client = client
        this.baseUrls = baseUrls
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
        return new ChzzkChat(chatChannelId, client, null, null, client.options.baseUrls)
    }

    static fromAccessToken(chatChannelId: string, accessToken: string, uid?: string, baseUrls?: ChzzkAPIBaseUrls) {
        return new ChzzkChat(chatChannelId, null, accessToken, uid, baseUrls)
    }

    async connect() {
        if (this.connected) {
            throw new Error('Already connected')
        }

        if (this.client) {
            const url = `${this.client.options.baseUrls.gameBaseUrl}/v1/chats/access-token?channelId=${this.chatChannelId}&chatType=STREAMING`
            const json = await this.client.fetch(url).then(r => r.json())

            this.uid = this.client.hasAuth ?
                await this.client.user().then(user => user.userIdHash) :
                null

            this.accessToken = json['content']['accessToken']
        }

        const serverId = Math.abs(
            this.chatChannelId.split("")
                .map(c => c.charCodeAt(0))
                .reduce((a, b) => a + b)
        ) % 9 + 1

        this.ws = new WebSocket(`wss://kr-ss${serverId}.chat.naver.com/chat`)

        this.ws.onopen = () => {
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
        }

        this.ws.onmessage = this.handleMessage.bind(this)

        this.ws.onclose = () => {
            this.emit('disconnect', null)

            this.stopPingTimer()

            this.ws = null
            this.disconnect()
        }
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

    on<T extends keyof Events>(event: T, handler: (data: Events[typeof event]) => void) {
        const e = event as string
        this.handlers[e] = this.handlers[e] || []
        this.handlers[e].push(handler)
    }

    private async handleMessage(data: MessageEvent) {
        const json = JSON.parse(data.data as string)
        const body = json['bdy']

        switch (json.cmd) {
            case ChatCmd.CONNECTED:
                this.connected = true
                this.sid = body['sid']
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
            case ChatCmd.DONATION:
                const isRecent = json.cmd == ChatCmd.RECENT_CHAT
                const chats = body['messageList'] || body
                const notice = body['notice']

                if (notice) {
                    this.emit('notice', this.parseChat(notice, isRecent))
                }

                for (const chat of chats) {
                    const type = chat['msgTypeCode'] || chat['messageTypeCode'] || ''
                    const parsed = this.parseChat(chat, isRecent)

                    switch (type) {
                        case ChatType.TEXT:
                            this.emit('chat', parsed)
                            break
                        case ChatType.DONATION:
                            this.emit('donation', parsed)
                            break
                        case ChatType.SYSTEM_MESSAGE:
                            this.emit('systemMessage', parsed)
                            break
                    }
                }

                break

            case ChatCmd.NOTICE:
                this.emit('notice', this.parseChat(body))
                break

            case ChatCmd.BLIND:
                this.emit('blind', body)

            // case ChatCmd.PENALTY:
            // case ChatCmd.EVENT:
        }

        this.emit('raw', json)

        if (json.cmd != ChatCmd.PONG) {
            this.startPingTimer()
        }
    }

    private parseChat(chat: any, isRecent: boolean = false) {
        const profile = JSON.parse(chat['profile'])
        const extras = chat['extras'] ? JSON.parse(chat['extras']) : null

        const message = chat['msg'] || chat['content']
        const memberCount = chat['mbrCnt'] || chat['memberCount']
        const time = chat['msgTime'] || chat['messageTime']

        const hidden = (chat['msgStatusType'] || chat['messageStatusType']) == "HIDDEN"

        const parsed = {
            profile,
            extras,
            hidden,
            message,
            time,
            isRecent
        }

        if (memberCount) {
            parsed['memberCount'] = memberCount
        }

        return parsed
    }

    private startPingTimer() {
        if (this.pingTimeout) {
            clearTimeout(this.pingTimeout)
        }

        this.pingTimeout = setTimeout(() => this.sendPing(), 20000)
    }

    private stopPingTimer() {
        if (this.pingTimeout) {
            clearTimeout(this.pingTimeout)
        }
    }

    private sendPing() {
        this.ws.send(JSON.stringify({
            cmd: ChatCmd.PING,
            ver: "2"
        }))

        this.pingTimeout = setTimeout(() => this.sendPing(), 20000)
    }
}