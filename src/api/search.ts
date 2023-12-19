import {DEFAULT_SEARCH_OPTIONS, SearchOptions} from "./options"
import {API_URL} from "./consts"
import {Channel} from "./channel"

interface SearchResult {
    size: number
    nextOffset: number
}

export interface ChannelSearchResult extends SearchResult {
    channels: Channel[]
}

async function search(type: string, keyword: string, options: SearchOptions = DEFAULT_SEARCH_OPTIONS) {
    const params = new URLSearchParams({
        keyword,
        size: options.size.toString(),
        offset: options.offset.toString()
    }).toString()

    return fetch(`${API_URL}/service/v1/search/${type}?${params}`).then(r => r.json())
}

// export async function searchVideos(keyword: string, options: SearchOptions = DEFAULT_SEARCH_OPTIONS) {
//     return search("videos", keyword, options)
// }
//
// export async function searchLives(keyword: string, options: SearchOptions = DEFAULT_SEARCH_OPTIONS) {
//     return search("lives", keyword, options)
// }

export async function searchChannels(keyword: string, options: SearchOptions = DEFAULT_SEARCH_OPTIONS): Promise<ChannelSearchResult> {
    return search("channels", keyword, options).then(r => {
        const content = r['content']
        return {
            size: content['size'],
            nextOffset: content['page']['next']['offset'],
            channels: content['data'].map(data => data['channel'])
        }
    })
}