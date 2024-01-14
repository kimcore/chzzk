import {ChzzkAPIBaseUrls} from "./types"

export const DEFAULT_BASE_URLS: ChzzkAPIBaseUrls = {
    chzzkBaseUrl: "https://api.chzzk.naver.com",
    gameBaseUrl: "https://comm-api.game.naver.com/nng_main"
}

export const IS_BROWSER = typeof window !== "undefined"