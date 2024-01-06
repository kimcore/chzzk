import {Channel} from "./channel"
import {SearchResultVideo} from "./video"
import {ChzzkClient} from "../client"
import {Live} from "./live"

export interface SearchOptions {
    size: number
    offset: number
}

export const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
    size: 12,
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