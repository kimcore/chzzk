import {ChzzkChat, ChzzkChatOptions} from "./chat"
import {Channel, ChzzkLive, ChzzkManage, ChzzkSearch, recommendations, Video} from "./api"
import {ChzzkChannelFunc, ChzzkChatFunc, ChzzkClientOptions} from "./types"
import {accessToken, blind, BlindOptions, notice, NoticeOptions, profileCard} from "./api/chat"
import {User} from "./api/user"
import {DEFAULT_BASE_URLS, DEFAULT_USER_AGENT} from "./const"

export class ChzzkClient {
    readonly options: ChzzkClientOptions
    live = new ChzzkLive(this)
    search = new ChzzkSearch(this)
    manage = new ChzzkManage(this)

    constructor(options: ChzzkClientOptions = {}) {
        options.baseUrls = options.baseUrls || DEFAULT_BASE_URLS
        options.userAgent = options.userAgent || DEFAULT_USER_AGENT

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
        func.blind = async (chatChannelId: string, options: BlindOptions) => blind(this, chatChannelId, options)

        return func
    }

    get channel(): ChzzkChannelFunc {
        const func = async (channelId: string): Promise<Channel> => {
            const r = await this.fetch(`/service/v1/channels/${channelId}`)
            const data = await r.json()
            const content = data['content']
            return content?.channelId ? content : null
        }

        func.recommendations = async () => recommendations(this)

        return func
    }

    async user(): Promise<User> {
        return this.fetch(`${this.options.baseUrls.gameBaseUrl}/v1/user/getUserStatus`)
            .then(r => r.json())
            .then(data => data['content'] ?? null)
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

        if (pathOrUrl.startsWith("/") && !pathOrUrl.startsWith(this.options.baseUrls.gameBaseUrl)) {
            pathOrUrl = `${this.options.baseUrls.chzzkBaseUrl}${pathOrUrl}`
        }

        return fetch(pathOrUrl, {
            ...options,
            headers
        })
    }
}