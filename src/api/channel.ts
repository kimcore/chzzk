import {LivePollingStatus} from "./live"

export interface PartialChannel {
    channelId: string
    channelName: string
    channelImageUrl?: string
    verifiedMark: boolean
    livePollingStatus?: LivePollingStatus
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