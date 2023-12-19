import {API_URL} from "./consts"

export interface Channel {
    channelId: string
    channelName: string
    channelImageUrl?: string
    verifiedMark: boolean
    channelDescription: string
    followerCount: number
    openLive: boolean
}

export interface ChannelLiveStatus {
    accumulateCount: number
    adult: boolean
    categoryType: string
    chatChannelId: string
    concurrentUserCount: number
    faultStatus?: string // unknown
    liveCategory: string
    liveCategoryValue: string
    livePollingStatus: ChannelLivePollingStatus
    liveTitle: string
    paidPromotion: boolean
    status: string
}

export interface ChannelLivePollingStatus {
    status: string
    isPublishing: boolean
    playableStatus: string
    trafficThrottling: number
    callPeriodMilliSecond: number
}

export async function getChannel(channelId: string): Promise<Channel> {
    return fetch(`${API_URL}/service/v1/channels/${channelId}`)
        .then(r => r.json())
        .then(data => data['content'])
}

export async function getLiveStatus(channelId: string): Promise<ChannelLiveStatus> {
    return fetch(`${API_URL}/polling/v1/channels/${channelId}/live-status`)
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