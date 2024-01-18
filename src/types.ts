import {ChatAccessToken, ChzzkChat, ChzzkChatOptions, Profile} from "./chat"

export interface ChzzkAPIBaseUrls {
    chzzkBaseUrl?: string
    gameBaseUrl?: string
}

export interface ChzzkClientOptions {
    nidAuth?: string
    nidSession?: string
    baseUrls?: ChzzkAPIBaseUrls
}

export type ChzzkChatFunc = {
    (options: string | ChzzkChatOptions): ChzzkChat
    accessToken: (chatChannelId: string) => Promise<ChatAccessToken>
    profileCard: (chatChannelId: string, uid: string) => Promise<Profile>
}