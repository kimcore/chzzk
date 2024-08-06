import {ChzzkClient} from "../client"

export interface PartialUser {
    nickname: string
    profileImageUrl: string
    userIdHash: string
}

export interface ChatActivtyCount {
    chatMessageCount: number
    restrict: boolean
    restrictCount: number
    temporaryRestrict: boolean
    temporaryRestrictCount: number
}

export interface LiveSettingParams {
    adult: boolean
    categoryType?: string
    chatActive: boolean
    chatAvailableGroup: string
    chatAvailableCondition: string
    defaultLiveTitle: string
    defaultThumbnailImageUrl?: string
    dropsCampaignNo?: string
    krOnlyViewing: boolean
    liveCategory?: string
    paidPromotion: boolean
    minFollowerMinute: number
    chatDonationRankingExposure: boolean
    tags: string[]
    clipActive: boolean
    replayPublishType: string
}

export interface LiveSetting {
    defaultLiveTitle: string
    category: {
        categoryType?: string
        categoryId?: string
        categoryValue?: string
        posterImageUrl?: string
        tags?: string[]
        dropsCampaignNos?: string[]
    }
    defaultThumbnailImageUrl?: string
    chatActive: boolean
    chatAvailableGroup: string
    paidPromotion: boolean
    adult: boolean
    krOnlyViewing: boolean
    chatAvailableCondition: string
    minFollowerMinute: number
    chatDonationRankingExposure: boolean
    tags: string[]
    clipActive: boolean
    replayPublishType: string
    dropsCampaignNo?: string
}

export interface ChatRule {
    channelId: string
    rule: string
}

export interface ProhibitWord {
    createdDate: string
    nickname: string
    prohibitWord: string
    prohibitWordNo: number
}

export interface Stream {
    streamKey: string
    streamSeq: number
    streamUrl: string // rtmp://global-rtmp.lip2.navercorp.com:8080/relay
}

export interface ManageSearchResult {
    page: number
    size: number
    totalCount: number
    totalPages: number
}

export interface SubscriberSearchOptions {
    page: number
    size: number
    sortType: "RECENT" | "LONGER"
    publishPeriod?: 1 | 3 | 6
    tier?: "TIER_1" | "TIER_2"
    userNickname?: string
}

const DEFAULT_SUBSCRIBER_SEARCH_OPTIONS: SubscriberSearchOptions = {
    page: 0,
    size: 50,
    sortType: "RECENT"
}

export interface FollowerSearchOptions {
    page: number
    size: number
    userNickname?: string
}

const DEFAULT_FOLLOWER_SEARCH_OPTIONS: FollowerSearchOptions = {
    page: 0,
    size: 50
}

export interface ManageVideoSearchOptions {
    videoType: "REPLAY" | "UPLOAD"
    page: number
    size: number
}

const DEFAULT_MANAGE_VIDEO_SEARCH_OPTIONS: ManageVideoSearchOptions = {
    videoType: "REPLAY",
    page: 0,
    size: 50
}

export interface Following {
    following: boolean
    notification: boolean
    followDate: string
}

export interface Subscribers extends ManageSearchResult {
    data: Subscriber[]
}

export interface Subscriber { // TODO: this is incomplete
    user: PartialUser,
    following?: Following
    channelFollowing?: Following
}

export interface Followers extends ManageSearchResult {
    data: Follower[]
}

export interface Follower {
    user: PartialUser,
    following?: Following
    channelFollowing?: Following
}

export interface ManageVideos extends ManageSearchResult {
    data: ManageVideo[]
}

export interface ManageVideo {
    commentCount: number
    deleted: boolean
    deletedBy: null
    download?: {
        downloadable: boolean
    }
    duration: number
    exposure: boolean
    likeCount: number
    liveAccumulateCount: number
    liveId?: number
    liveOpenDate?: string
    liveUniqueViewCount: number
    publishDate: string
    readCount: number
    thumbnailImageUrl: string
    videoId: string
    videoNo: number
    videoTitle: string
    videoType: "REPLAY" | "UPLOAD"
    vodStatus: string
}

export class ChzzkManage {
    private client: ChzzkClient

    constructor(client: ChzzkClient) {
        this.client = client
    }

    async temporaryRestrict(channelId: string, chatChannelId: string, targetId: string): Promise<PartialUser> {
        return this.client.fetch(`/manage/v1/channels/${channelId}/temporary-restrict-users`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({chatChannelId, targetId})
        }).then(r => r.json()).then(data => data['content'] ?? null).catch(() => null)
    }

    async restrict(channelId: string, targetId: string): Promise<PartialUser> {
        return this.client.fetch(`/manage/v1/channels/${channelId}/restrict-users`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({targetId})
        }).then(r => r.json()).then(data => data['content'] ?? null).catch(() => null)
    }

    async removeRestrict(channelId: string, targetId: string) {
        return this.client.fetch(`/manage/v1/channels/${channelId}/restrict-users/${targetId}`, {
            method: "DELETE"
        })
    }

    async chatActivityCount(channelId: string, targetId: string): Promise<ChatActivtyCount> {
        return this.client.fetch(`/manage/v1/channels/${channelId}/users/${targetId}/chat-activity-count`)
            .then(r => r.json()).then(data => data['content'] ?? null).catch(() => null)
    }

    async setRole(channelId: string, targetId: string, userRoleType: "streaming_chat_manager" | "streaming_channel_manager"): Promise<PartialUser> {
        return this.client.fetch(`/manage/v1/channels/${channelId}/streaming-roles`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({targetId, userRoleType})
        }).then(r => r.json()).then(data => data['content'] ?? null).catch(() => null)
    }

    async removeRole(channelId: string, targetId: string) {
        return this.client.fetch(`/manage/v1/channels/${channelId}/streaming-roles/${targetId}`, {
            method: "DELETE"
        })
    }

    async setting(channelId: string, params?: LiveSettingParams): Promise<LiveSetting> {
        const options = params ? {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(params)
        } : null

        return this.client.fetch(`/manage/v1/channels/${channelId}/live-setting`, options)
            .then(r => r.json())
            .then(data => data['content'] ?? null)
    }

    async chatRule(channelId: string): Promise<ChatRule> {
        return this.client.fetch(`/manage/v1/channels/${channelId}/chat-rules`)
            .then(r => r.json())
            .then(data => data['content'] ?? null)
    }

    async setChatRule(channelId: string, rule: string) {
        return this.client.fetch(`/manage/v1/channels/${channelId}/chat-rules`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({rule})
        })
    }

    async prohibitWords(channelId: string): Promise<ProhibitWord[]> {
        return this.client.fetch(`/manage/v1/channels/${channelId}/chats/prohibit-words`)
            .then(r => r.json())
            .then(data => data['content'] ?? null)
            .then(content => content['prohibitWords'] as ProhibitWord[])
            .catch(() => null)
    }

    async addProhibitWord(channelId: string, prohibitWord: string) {
        return this.client.fetch(`/manage/v1/channels/${channelId}/chats/prohibit-words`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({prohibitWord})
        })
    }

    async removeProhibitWord(channelId: string, prohibitWordNo: number) {
        return this.client.fetch(`/manage/v1/channels/${channelId}/chats/prohibit-words/${prohibitWordNo}`, {
            method: "DELETE"
        })
    }

    async removeAllProhibitWords(channelId: string) {
        return this.client.fetch(`/manage/v1/channels/${channelId}/chats/prohibit-words`, {
            method: "DELETE"
        })
    }

    async editProhibitWord(channelId: string, prohibitWordNo: number, prohibitWord: string) {
        return this.client.fetch(`/manage/v1/channels/${channelId}/chats/prohibit-words/${prohibitWordNo}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({prohibitWord})
        })
    }

    async stream(channelId: string): Promise<Stream> {
        return this.client.fetch(`/manage/v1/channels/${channelId}/streams`)
            .then(r => r.json())
            .then(data => data['content'] ?? null)
            .catch(() => null)
    }

    async subscribers(channelId: string, options?: Partial<SubscriberSearchOptions>): Promise<Subscribers> {
        options = {...DEFAULT_SUBSCRIBER_SEARCH_OPTIONS, ...options}

        const params = new URLSearchParams({
            page: options.page.toString(),
            size: options.size.toString(),
            sortType: options.sortType
        })

        if (options?.publishPeriod) {
            params.set("publishPeriod", options.publishPeriod.toString())
        }

        if (options?.tier) {
            params.set("tier", options.tier)
        }

        if (options?.userNickname) {
            params.set("userNickname", options.userNickname)
        }

        return this.client.fetch(`/manage/v1/channels/${channelId}/subscribers?${params.toString()}`)
            .then(r => r.json())
            .then(data => data['content'] ?? null)
            .catch(() => null)
    }

    async followers(channelId: string, options?: Partial<FollowerSearchOptions>): Promise<Followers> {
        options = {...DEFAULT_FOLLOWER_SEARCH_OPTIONS, ...options}

        const params = new URLSearchParams({
            page: options.page.toString(),
            size: options.size.toString(),
            userNickname: options.userNickname ?? ""
        })

        return this.client.fetch(`/manage/v1/channels/${channelId}/followers?${params.toString()}`)
            .then(r => r.json())
            .then(data => data['content'] ?? null)
            .catch(() => null)
    }

    async videos(channelId: string, options?: Partial<ManageVideoSearchOptions>): Promise<ManageVideos> {
        options = {...DEFAULT_MANAGE_VIDEO_SEARCH_OPTIONS, ...options}

        const params = new URLSearchParams({
            page: options.page.toString(),
            size: options.size.toString(),
            videoType: options.videoType
        })

        return this.client.fetch(`/manage/v1/channels/${channelId}/videos?${params.toString()}`)
            .then(r => r.json())
            .then(data => data['content'] ?? null)
            .catch(() => null)
    }
}