import {ChzzkChat} from "./chat"
import {Channel, ChzzkLive, ChzzkSearch, Video} from "./api"
import {ChzzkClientOptions, DEFAULT_BASE_URLS} from "./types"
import {User} from "./api/user"

export class ChzzkClient {
    readonly options: ChzzkClientOptions
    readonly hasAuth: boolean
    live = new ChzzkLive(this)
    search = new ChzzkSearch(this)

    constructor(options: ChzzkClientOptions = {}) {
        if (!options.baseUrls) {
            options.baseUrls = DEFAULT_BASE_URLS
        }

        this.options = options
        this.hasAuth = !!(this.options.nidAuth && this.options.nidSession)
    }

    async user(): Promise<User> {
        return this.fetch(`${this.options.baseUrls.gameBaseUrl}/v1/user/getUserStatus`)
            .then(r => r.json())
            .then(data => data['content'] ?? null)
    }

    async channel(channelId: string): Promise<Channel> {
        return this.fetch(`/service/v1/channels/${channelId}`)
            .then(r => r.json())
            .then(data => data['content'])
            .then(content => content?.channelId ? content : null)
    }

    async video(videoNo: string | number): Promise<Video> {
        return this.fetch(`/service/v1/videos/${videoNo}`)
            .then(r => r.json())
            .then(r => r['content'] ?? null)
    }

    chat(chatChannelId: string): ChzzkChat {
        if (!chatChannelId || chatChannelId.length > 6) {
            throw new Error("Invalid chat channel ID")
        }

        return ChzzkChat.fromClient(chatChannelId, this)
    }

    fetch(pathOrUrl: string, options?: RequestInit): Promise<Response> {
        const headers = options?.headers || {}

        if (this.hasAuth) {
            headers["Cookie"] = `NID_AUT=${this.options.nidAuth}; NID_SES=${this.options.nidSession}`
        }

        if (pathOrUrl.startsWith("/")) {
            pathOrUrl = `${this.options.baseUrls.chzzkBaseUrl}${pathOrUrl}`
        }

        return fetch(pathOrUrl, {
            ...options,
            headers
        })
    }
}