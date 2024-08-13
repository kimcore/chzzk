import {ChzzkClient} from "../client"

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

export async function recommendations(client: ChzzkClient): Promise<RecommendationChannel[]> {
    const r = await client.fetch("/service/v1/home/recommendation-channels")
    const data = await r.json()

    const content = data['content']

    if (!content) return null

    return content['recommendationChannels'].map((channel: Record<string, any>) => {
        const contentLineage = JSON.parse(channel['contentLineage'])
        const contentTag = JSON.parse(contentLineage['contentTag'])

        return {
            ...channel,
            contentLineage: {
                ...contentLineage,
                contentTag
            }
        }
    })
}