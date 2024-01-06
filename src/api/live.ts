import {PartialChannel} from "./channel"
import {ChzzkClient} from "../client"

export interface Live {
    liveTitle: string
    liveImageUrl: string
    defaultThumbnailImageUrl?: string
    concurrentUserCount: number
    accumulateCount: number
    openDate: string
    liveId: number
    adult: boolean
    chatChannelId: string
    categoryType: string
    liveCategory: string
    liveCategoryValue: string
    channelId: string
    livePlayback: LivePlayback
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
    adult: boolean
    chatChannelId: string
    categoryType: string
    liveCategory: string
    liveCategoryValue: string
    livePollingStatus: LivePollingStatus
    faultStatus?: string // unknown
    userAdultStatus: string
}

export interface LivePollingStatus {
    status: string
    isPublishing: boolean
    playableStatus: string
    trafficThrottling: number
    callPeriodMilliSecond: number
}

export interface LiveDetail extends Live {
    status: "OPEN" | "CLOSE"
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

                const channel = content['channel']
                const channelLivePollingStatusJson = channel['livePollingStatusJson']
                const channelLivePollingStatus = JSON.parse(channelLivePollingStatusJson)

                delete channel['livePollingStatusJson']

                return {
                    ...content,
                    livePollingStatus,
                    livePlayback,
                    channel: {
                        ...channel,
                        livePollingStatus: channelLivePollingStatus
                    }
                }
            })
    }
}