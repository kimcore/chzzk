import {ChzzkChat} from "./chat"
import {Channel, ChzzkLive, ChzzkSearch, Video} from "./api"
import {API_URL, GAME_API_URL} from "./consts"
import {User} from "./api/user"

export interface ChzzkClientOptions {
    nidAuth?: string
    nidSession?: string
}

export class ChzzkClient {
    private readonly options: ChzzkClientOptions
    readonly hasAuth: boolean

    constructor(options: ChzzkClientOptions = {}) {
        this.options = options
        this.hasAuth = !!(this.options.nidAuth && this.options.nidSession)
    }

    async user(): Promise<User> {
        return this.fetch(`${GAME_API_URL}/v1/user/getUserStatus`)
            .then(r => r.json())
            .then(data => data['content'])
    }

    async channel(channelId: string): Promise<Channel> {
        return this.fetch(`${API_URL}/service/v1/channels/${channelId}`)
            .then(r => r.json())
            .then(data => data['content'])
            .then(content => content.channelId ? content : null)
    }

    live = new ChzzkLive(this)

    async video(videoNo: string | number): Promise<Video> {
        return this.fetch(`${API_URL}/service/v1/videos/${videoNo}`)
            .then(r => r.json())
            .then(r => r['content'])
    }

    search = new ChzzkSearch(this)

    chat(chatChannelId: string): ChzzkChat {
        if (!chatChannelId || chatChannelId.length > 6) {
            throw new Error("Invalid chat channel ID")
        }

        return ChzzkChat.fromClient(chatChannelId, this)
    }

    fetch(url: string, options?: RequestInit): Promise<Response> {
        const headers = options?.headers || {}

        if (this.hasAuth) {
            headers["Cookie"] = `NID_AUT=${this.options.nidAuth}; NID_SES=${this.options.nidSession}`
        }

        return fetch(url, {
            ...options,
            headers
        })
    }
}