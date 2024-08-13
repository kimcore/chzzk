import {Channel, RecommendationChannel} from "./channel"
import {SearchResultVideo} from "./video"
import {ChzzkClient} from "../client"
import {Live} from "./live"

export interface SearchOptions {
    size: number
    offset: number
}

export const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
    size: 13,
    offset: 0
}

export interface LoungeSearchOptions {
    limit: number
    offset: number
}

export const DEFAULT_LOUNGE_SEARCH_OPTIONS: LoungeSearchOptions = {
    limit: 50,
    offset: 0
}

interface SearchResult {
    size: number
    nextOffset: number
}

interface SearchResultWithData extends SearchResult {
    data: Record<string, any>[]
}

export interface ChannelSearchResult extends SearchResult {
    channels: Channel[]
}

export interface VideoSearchResult extends SearchResult {
    videos: SearchResultVideo[]
}

export interface LiveSearchResult extends SearchResult {
    lives: Live[]
}

export interface LoungeSearchResult {
    totalCount: number
    offset: number
    limit: number
    lounges: Lounge[]
}

export interface Lounge {
    originalLoungeId: string
    loungeId: string
    loungeName: string
    titleImageUrl: string
    logoImageSquareUrl: string
    exposureGenre: string
    repPlatform: string
    pcLandingUrl: string
    mobileLandingUrl: string
    bgColor: string
    pcBgColor: string
    mobileBgColor: string
    createdDate: string
    updatedDate: string
    officialLounge: boolean
}

export interface CategorySearchResult {
    results: Category[]
}

export interface Category {
    categoryType: string
    categoryId: string
    categoryValue: string
    posterImageUrl: string
    tags: string[]
    dropsCampaignNos: string[]
}

export class ChzzkSearch {
    private client: ChzzkClient

    constructor(client: ChzzkClient) {
        this.client = client
    }

    async videos(
        keyword: string,
        options: SearchOptions = DEFAULT_SEARCH_OPTIONS
    ): Promise<VideoSearchResult> {
        return this.search("videos", keyword, options).then(r => {
            return {
                size: r.size,
                nextOffset: r.nextOffset,
                videos: r.data.map((data: Record<string, any>) => {
                    const video = data['video']
                    const channel = data['channel']

                    return {
                        ...video,
                        channel
                    }
                })
            }
        })
    }

    async lives(
        keyword: string,
        options: SearchOptions = DEFAULT_SEARCH_OPTIONS
    ): Promise<LiveSearchResult> {
        return this.search("lives", keyword, options).then(r => {
            return {
                size: r.size,
                nextOffset: r.nextOffset,
                lives: r.data.map((data: Record<string, any>) => {
                    const live = data['live']
                    const channel = data['channel']

                    const livePlaybackJson = live['livePlaybackJson']
                    const livePlayback = livePlaybackJson ? JSON.parse(livePlaybackJson) : null

                    delete live['livePlaybackJson']

                    return {
                        ...live,
                        livePlayback,
                        channel
                    }
                })
            }
        })
    }

    async channels(
        keyword: string,
        options: SearchOptions = DEFAULT_SEARCH_OPTIONS
    ): Promise<ChannelSearchResult> {
        return this.search("channels", keyword, options).then(r => {
            return {
                size: r.size,
                nextOffset: r.nextOffset,
                channels: r.data.map((data: Record<string, any>) => data['channel'])
            }
        })
    }

    async autoComplete(
        keyword: string,
        options: SearchOptions = DEFAULT_SEARCH_OPTIONS
    ): Promise<string[]> {
        const params = new URLSearchParams({
            keyword,
            size: options.size.toString(),
            offset: options.offset.toString()
        }).toString()

        return this.client.fetch(`${this.client.options.baseUrls.gameBaseUrl}/v2/search/lounges/auto-complete?${params}`)
            .then(r => r.json())
            .then(data => data['content']['data'])
    }

    async lounges(
        keyword: string,
        options: LoungeSearchOptions = DEFAULT_LOUNGE_SEARCH_OPTIONS
    ): Promise<LoungeSearchResult> {
        const params = new URLSearchParams({
            keyword,
            limit: options.limit.toString(),
            offset: options.offset.toString()
        }).toString()

        return this.client.fetch(`${this.client.options.baseUrls.gameBaseUrl}/v2/search/lounges?${params}`)
            .then(r => r.json())
            .then(data => data['content'])
    }

    async categories(
        keyword: string,
        options: SearchOptions = DEFAULT_SEARCH_OPTIONS
    ): Promise<CategorySearchResult> {
        const params = new URLSearchParams({
            keyword,
            size: options.size.toString(),
            offset: options.offset.toString()
        }).toString()

        return this.client.fetch(`/manage/v1/auto-complete/categories?${params}`)
            .then(r => r.json())
            .then(data => data['content'])
    }

    private async search(type: string, keyword: string, options: SearchOptions = DEFAULT_SEARCH_OPTIONS): Promise<SearchResultWithData> {
        const params = new URLSearchParams({
            keyword,
            size: options.size.toString(),
            offset: options.offset.toString()
        }).toString()

        return this.client.fetch(`/service/v1/search/${type}?${params}`)
            .then(r => r.json())
            .then(data => {
                const content = data['content']

                if (!content) return null

                return {
                    size: content['size'],
                    nextOffset: content['page']?.['next']?.['offset'] ?? 0,
                    data: content['data']
                }
            })
    }
}