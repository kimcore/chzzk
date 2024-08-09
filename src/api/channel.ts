export interface PartialChannel {
    channelId: string
    channelName: string
    channelImageUrl?: string
    verifiedMark: boolean
    userAdultStatus?: string
    personalData?: {
        privateUserBlock: boolean
    }
}

export interface Channel extends PartialChannel {
    channelDescription: string
    followerCount: number
    openLive: boolean
}

export interface RecommendationChannel {
    channelId: string
    channel: {
        channelId: string
        channelName: string
        channelImageUrl: string
        verifiedMark: boolean
    }
    streamer: {
        openLive: boolean
    }
    liveInfo: {
        liveTitle: string
        concurrentUserCount: number
        liveCategoryValue: string
    }
    contentLineage: {
        contentSource: string
        contentType: string
        contentTag: {
            internal: string
            external: {
                apiRequestKey: string
            }
        }
    }
}