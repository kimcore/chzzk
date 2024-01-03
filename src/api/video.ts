import {PartialChannel} from "./channel"

export interface BaseVideo {
    videoNo: number
    videoId: string
    videoTitle: string
    videoType: string
    publishDate: string
    thumbnailImageUrl: string
    duration: number
    readCount: number
    publishDateAt: number
    categoryType: string
    videoCategory: string
    videoCategoryValue: string
    channel: PartialChannel
}

export interface SearchResultVideo extends BaseVideo {
    channelId: string
}

export interface Video extends BaseVideo {
    trailerUrl?: string
    exposure: boolean
    paidPromotion: boolean
    inKey: string
    liveOpenDate?: string
    vodStatus: string
    prevVideo?: BaseVideo
    nextVideo?: BaseVideo
}