import {ChatAccessToken, ChzzkChat, ChzzkChatOptions, Profile} from "./chat"
import {NoticeOptions} from "./api/chat"

export interface ChzzkAPIBaseUrls {
    chzzkBaseUrl?: string
    gameBaseUrl?: string
}

export interface ChzzkClientOptions {
    nidAuth?: string
    nidSession?: string
    baseUrls?: ChzzkAPIBaseUrls
    userAgent?: string
}

export type ChzzkChatFunc = {
    (options: string | ChzzkChatOptions): ChzzkChat
    accessToken: (chatChannelId: string) => Promise<ChatAccessToken>
    profileCard: (chatChannelId: string, uid: string) => Promise<Profile>
    notice: (chatChannelId: string, notice?: NoticeOptions) => Promise<Response>
}