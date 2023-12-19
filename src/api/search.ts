import {DEFAULT_SEARCH_OPTIONS, SearchOptions} from "./options"
import {API_URL, GAME_API_URL} from "../consts"
import {Channel} from "./channel"
import {SearchResultVideo} from "./video"
import {Live} from "./live"

interface SearchResult {
    size: number
    nextOffset: number
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

async function search(type: string, keyword: string, options: SearchOptions = DEFAULT_SEARCH_OPTIONS) {
    const params = new URLSearchParams({
        keyword,
        size: options.size.toString(),
        offset: options.offset.toString()
    }).toString()

    return fetch(`${API_URL}/service/v1/search/${type}?${params}`).then(r => r.json())
}

export async function searchVideos(
    keyword: string,
    options: SearchOptions = DEFAULT_SEARCH_OPTIONS
): Promise<VideoSearchResult> {
    return search("videos", keyword, options).then(r => {
        const content = r['content']
        return {
            size: content['size'],
            nextOffset: content['page']['next']['offset'],
            videos: content['data'].map((data: Record<string, any>) => {
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

export async function searchLives(
    keyword: string,
    options: SearchOptions = DEFAULT_SEARCH_OPTIONS
): Promise<LiveSearchResult> {
    return search("lives", keyword, options).then(r => {
        const content = r['content']
        return {
            size: content['size'],
            nextOffset: content['page']['next']['offset'],
            lives: content['data'].map((data: Record<string, any>) => {
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

export async function searchChannels(
    keyword: string,
    options: SearchOptions = DEFAULT_SEARCH_OPTIONS
): Promise<ChannelSearchResult> {
    return search("channels", keyword, options).then(r => {
        const content = r['content']
        return {
            size: content['size'],
            nextOffset: content['page']['next']['offset'],
            channels: content['data'].map((data: Record<string, any>) => data['channel'])
        }
    })
}

export async function searchAutoComplete(
    keyword: string,
    options: SearchOptions = DEFAULT_SEARCH_OPTIONS
): Promise<string[]> {
    const params = new URLSearchParams({
        keyword,
        size: options.size.toString(),
        offset: options.offset.toString()
    }).toString()

    return fetch(`${GAME_API_URL}/v2/search/lounges/auto-complete?${params}`)
        .then(r => r.json())
        .then(data => data['content']['data'])
}