export interface ChzzkAPIBaseUrls {
    chzzkBaseUrl?: string
    gameBaseUrl?: string
}

export interface ChzzkClientOptions {
    nidAuth?: string
    nidSession?: string
    baseUrls?: ChzzkAPIBaseUrls
}

export const DEFAULT_BASE_URLS = {
    chzzkBaseUrl: "https://api.chzzk.naver.com",
    gameBaseUrl: "https://comm-api.game.naver.com/nng_main"
}