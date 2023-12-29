import WebSocket, {MessageEvent} from "isomorphic-ws"
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
    private handlers: [string, (data: any) => void][] = []
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

    private async handleMessage(data: MessageEvent) {
        const json = JSON.parse(data.data as string)

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
            case ChatCmd.DONATION:
            case ChatCmd.NOTICE: // not sure
            case ChatCmd.BLIND: // not sure
            case ChatCmd.PENALTY: // not sure
            case ChatCmd.EVENT: // not sure
                const chats = json['bdy']['messageList'] || json['bdy']

                if (typeof chats[Symbol.iterator] !== 'function') {
                    console.error(`Chat list is not iterable. (${json.cmd})`)
                    return
                }

                for (const chat of chats) {
                    const profile = JSON.parse(chat['profile'])
                    const extras = chat['extras'] ? JSON.parse(chat['extras']) : null

                    const message = chat['msg'] || chat['content']

                    const type = chat['msgTypeCode'] || chat['messageTypeCode'] || ''

                    if (type == ChatType.SYSTEM_MESSAGE) {
                        const registerChatProfileJson = extras.params?.['registerChatProfileJson']

                        if (registerChatProfileJson) {
                            extras.params['registerChatProfile'] = JSON.parse(registerChatProfileJson)
                            delete extras.params['registerChatProfileJson']
                        }

                        const targetChatProfileJson = extras.params?.['targetChatProfileJson']

                        if (targetChatProfileJson) {
                            extras.params['targetChatProfile'] = JSON.parse(targetChatProfileJson)
                            delete extras.params['targetChatProfileJson']
                        }
                    }

                    const memberCount = chat['mbrCnt'] || chat['memberCount']
                    const time = chat['msgTime'] || chat['messageTime']

                    const hidden = (chat['msgStatusType'] || chat['messageStatusType']) == "HIDDEN"

                    const payload = {
                        profile,
                        extras,
                        hidden,
                        message,
                        memberCount,
                        time
                    }

                    switch (type) {
                        case ChatType.TEXT:
                            this.emit('chat', payload)
                            break
                        case ChatType.DONATION:
                            this.emit('donation', payload)
                            break
                        case ChatType.SYSTEM_MESSAGE:
                            this.emit('systemMessage', payload)
                            break
                    }
                }

                break
        }

        this.emit('raw', json)
    }

    on<T extends keyof Events>(event: T, handler: (data: Events[typeof event]) => void) {
        const e = event as string
        this.handlers[e] = this.handlers[e] || []
        this.handlers[e].push(handler)
    }
}