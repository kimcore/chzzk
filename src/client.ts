import {ChzzkChat, ChzzkChatOptions} from "./chat"
import {Channel, ChzzkLive, ChzzkManage, ChzzkSearch, Video} from "./api"
import {ChzzkChatFunc, ChzzkClientOptions} from "./types"
import {User} from "./api/user"
import {DEFAULT_BASE_URLS} from "./const"
import {accessToken, notice, NoticeOptions, profileCard} from "./api/chat"

export class ChzzkClient {
    readonly options: ChzzkClientOptions
    live = new ChzzkLive(this)
    search = new ChzzkSearch(this)
    manage = new ChzzkManage(this)

    constructor(options: ChzzkClientOptions = {}) {
        options.baseUrls = options.baseUrls || DEFAULT_BASE_URLS
        options.userAgent = options.userAgent || "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36"

        this.options = options
    }

    get hasAuth() {
        return !!(this.options.nidAuth && this.options.nidSession)
    }

    get chat(): ChzzkChatFunc {
        const func = (options: string | ChzzkChatOptions) => {
            if (typeof options == "string") {
                if (options.length != 6) {
                    throw new Error("Invalid chat channel ID")
                }

                return ChzzkChat.fromClient(options, this)
            }

            return new ChzzkChat({
                client: this,
                baseUrls: this.options.baseUrls,
                pollInterval: 30 * 1000,
                ...options
            })
        }

        func.accessToken = async (chatChannelId: string) => accessToken(this, chatChannelId)
        func.profileCard = async (chatChannelId: string, userIdHash: string) => profileCard(this, chatChannelId, userIdHash)
        func.notice = async (chatChannelId: string, options?: NoticeOptions) => notice(this, chatChannelId, options)

        return func
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

    fetch(pathOrUrl: string, options?: RequestInit): Promise<Response> {
        const headers = {
            "User-Agent": this.options.userAgent,
            ...(options?.headers || {})
        }

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