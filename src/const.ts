import {ChzzkAPIBaseUrls} from "./types"

export const DEFAULT_BASE_URLS: ChzzkAPIBaseUrls = {
    chzzkBaseUrl: "https://api.chzzk.naver.com",
    gameBaseUrl: "https://comm-api.game.naver.com/nng_main"
}

export const IS_BROWSER = typeof window !== "undefined"

export const DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36"