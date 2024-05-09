import {Profile} from "./chat"

export function isStreamer(profile: Profile) {
    return profile.userRoleCode == "streamer"
}

export function isChatManager(profile: Profile) {
    return profile.userRoleCode == "streaming_chat_manager"
}

export function isChannelManager(profile: Profile) {
    return profile.userRoleCode == "streaming_channel_manager"
}

export function isManager(profile: Profile) {
    return profile.userRoleCode == "manager"
}

export function isModerator(profile: Profile) {
    return isStreamer(profile) || isChatManager(profile) || isChannelManager(profile) || isManager(profile)
}

export function userRoleName(userRoleCode: string) {
    switch (userRoleCode) {
        case "streamer":
            return "스트리머"
        case "streaming_chat_manager":
            return "채팅 운영자"
        case "streaming_channel_manager":
            return "채널 관리자"
        case "manager":
            return "운영자"
        case "common_user":
            return "일반 사용자"
        default:
            return "알 수 없음"
    }
}

export function donationTypeName(donationType: string) {
    switch (donationType) {
        case "CHAT":
            return "채팅 후원"
        case "VIDEO":
            return "영상 후원"
        case "MISSION":
            return "미션 후원"
        default:
            return "알 수 없음"
    }
}