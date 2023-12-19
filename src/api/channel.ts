import {API_URL} from "../consts"

export interface PartialChannel {
    channelId: string
    channelName: string
    channelImageUrl?: string
    verifiedMark: boolean
    personalData?: {
        privateUserBlock: boolean
    }
}

export interface Channel extends PartialChannel {
    channelDescription: string
    followerCount: number
    openLive: boolean
}

export async function getChannel(channelId: string): Promise<Channel> {
    return fetch(`${API_URL}/service/v1/channels/${channelId}`)
        .then(r => r.json())
        .then(data => data['content'])
}