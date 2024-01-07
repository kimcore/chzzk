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