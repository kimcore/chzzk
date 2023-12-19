import {PartialChannel} from "./channel"
import {API_URL} from "../consts"
import {ChzzkClient} from "../client"

export interface Live {
    liveTitle: string
    liveImageUrl: string
    defaultThumbnailImageUrl: string
    concurrentUserCount: number
    accumulateCount: number
    openDate: string
    liveId: number
    chatChannelId: string
    categoryType?: string
    liveCategory?: string
    liveCategoryValue: string
    channelId: string
    livePlayback: LivePlayback,
    channel: PartialChannel
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
    encodingTrack: EncodingTrack[]
}

export interface EncodingTrack {
    encodingTrackId: string
    videoProfile: string
    audioProfile: string
    videoCodec: string
    videoBitRate: number
    audioBitRate: number
    videoFrameRate: string
    videoWidth: number
    videoHeight: number
    audioSamplingRate: number
    audioChannel: number
    avoidReencoding: boolean
    videoDynamicRange: string
}

export interface LiveStatus {
    accumulateCount: number
    adult: boolean
    categoryType: string
    chatChannelId: string
    concurrentUserCount: number
    faultStatus?: string // unknown
    liveCategory: string
    liveCategoryValue: string
    livePollingStatus: LivePollingStatus
    liveTitle: string
    paidPromotion: boolean
    status: string
}

export interface LivePollingStatus {
    status: string
    isPublishing: boolean
    playableStatus: string
    trafficThrottling: number
    callPeriodMilliSecond: number
}

export interface ChannelLiveDetail extends Live {
    status: string
    closeDate?: string
    chatActive: boolean
    chatAvailableGroup: string
    paidPromotion: boolean
    chatAvailableCondition: string
    minFollowerMinute: number
    livePollingStatus: LivePollingStatus
}

export class ChzzkLive {
    private client: ChzzkClient

    constructor(client: ChzzkClient) {
        this.client = client
    }

    async status(channelId: string): Promise<LiveStatus> {
        return this.client.fetch(`${API_URL}/polling/v1/channels/${channelId}/live-status`)
            .then(r => r.json())
            .then(data => {
                const content = data['content']
                const livePollingStatusJson = content['livePollingStatusJson']
                const livePollingStatus = JSON.parse(livePollingStatusJson)
                delete content['livePollingStatusJson']
                return {
                    ...content,
                    livePollingStatus
                }
            })
    }

    async detail(channelId: string): Promise<ChannelLiveDetail> {
        return this.client.fetch(`${API_URL}/service/v1/channels/${channelId}/live-detail`)
            .then(r => r.json())
            .then(data => {
                const content = data['content']
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