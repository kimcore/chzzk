import {PartialChannel} from "./channel"
import {ChzzkClient} from "../client"

export interface BaseLive {
    liveTitle: string
    liveImageUrl: string
    defaultThumbnailImageUrl?: string
    concurrentUserCount: number
    accumulateCount: number
    openDate: string
    liveId: number
    adult: boolean
    tags: string[]
    chatChannelId: string
    categoryType?: string
    liveCategory?: string
    liveCategoryValue?: string
    livePlayback: LivePlayback
    channel: PartialChannel
}

// used in search.ts
export interface Live extends BaseLive {
    channelId: string
}

export interface LivePlayback {
    meta: {
        videoId: string
        streamSeq: number
        liveId: string
        paidLive: boolean
        cdnInfo: {
            cdnType: string
            zeroRating: boolean
        }
        p2p: boolean
    }
    serviceMeta: {
        contentType: string
    }
    live: {
        start: string
        open: string
        timeMachine: boolean
        status: string
    }
    api: { name: string, path: string }[]
    media: Media[]
    thumbnail: {
        snapshotThumbnailTemplate: string
        types: string[]
    }
    multiview: [] // unknown
}

export interface Media {
    mediaId: string
    protocol: string
    path: string
    encodingTrack: (VideoEncodingTrack | AudioEncodingTrack)[]
}

export interface EncodingTrack {
    encodingTrackId: string
    audioBitRate: number
    audioSamplingRate: number
    audioChannel: number
    avoidReencoding: boolean
    audioOnly: boolean
}

export interface VideoEncodingTrack extends EncodingTrack {
    videoProfile: string
    audioProfile: string
    videoCodec: string
    videoBitRate: number
    videoFrameRate: string
    videoWidth: number
    videoHeight: number
    videoDynamicRange: string
    audioOnly: false | undefined
}

export interface AudioEncodingTrack extends EncodingTrack {
    encodingTrackId: "alow.stream"
    path: string
    audioCodec: string
    audioOnly: true
}

export interface LiveStatus {
    liveTitle: string
    status: "OPEN" | "CLOSE"
    concurrentUserCount: number
    accumulateCount: number
    paidPromotion: boolean
    adult: boolean
    krOnlyViewing: boolean
    chatChannelId: string
    tags: string[]
    categoryType: string
    liveCategory?: string
    liveCategoryValue?: string
    livePollingStatus: LivePollingStatus
    faultStatus?: string // unknown
    userAdultStatus?: string
    blindType?: string // unknown
    chatActive: boolean
    chatAvailableGroup: string
    chatAvailableCondition: string
    minFollowerMinute: number
    chatDonationRankingExposure: boolean
    dropsCampaignNo?: string // unknown
    liveTokenList: string[] // unknown
}

export interface LivePollingStatus {
    status: string
    isPublishing: boolean
    playableStatus: string
    trafficThrottling: number
    callPeriodMilliSecond: number
}

export interface LiveDetail extends BaseLive {
    status: "OPEN" | "CLOSE"
    closeDate?: string
    clipActive: boolean
    chatActive: boolean
    chatAvailableGroup: string
    paidPromotion: boolean
    chatAvailableCondition: string
    minFollowerMinute: number
    p2pQuality: string[]
    livePollingStatus: LivePollingStatus
    userAdultStatus?: string
    chatDonationRankingExposure: boolean
    adParameter: {
        tag: string // unknown
    }
    dropsCampaignNo?: string // unknown
}

export class ChzzkLive {
    private client: ChzzkClient

    constructor(client: ChzzkClient) {
        this.client = client
    }

    async status(channelId: string): Promise<LiveStatus> {
        return this.client.fetch(`/polling/v2/channels/${channelId}/live-status`)
            .then(r => r.json())
            .then(data => {
                const content = data['content']

                if (!content) return null

                const livePollingStatusJson = content['livePollingStatusJson']
                const livePollingStatus = JSON.parse(livePollingStatusJson)

                delete content['livePollingStatusJson']

                return {
                    ...content,
                    livePollingStatus
                }
            })
    }

    async detail(channelId: string): Promise<LiveDetail> {
        return this.client.fetch(`/service/v2/channels/${channelId}/live-detail`)
            .then(r => r.json())
            .then(data => {
                const content = data['content']

                if (!content) return null

                const livePollingStatusJson = content['livePollingStatusJson']
                const livePollingStatus = JSON.parse(livePollingStatusJson)

                delete content['livePollingStatusJson']

                const livePlaybackJson = content['livePlaybackJson']
                const livePlayback = livePlaybackJson ? JSON.parse(livePlaybackJson) : null

                delete content['livePlaybackJson']

                return {
                    ...content,
                    livePollingStatus,
                    livePlayback
                }
            })
    }
}