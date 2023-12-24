export enum ChatCmd {
    PING = 0,
    PONG = 10000,
    CONNECT = 100,
    CONNECTED = 10100,
    REQUEST_RECENT_CHAT = 5101,
    RECENT_CHAT = 15101,
    CHAT = 93101,
    SEND_CHAT = 3101
}

export enum ChatType {
    TEXT = 1,
    IMAGE = 2,
    STICKER = 3,
    VIDEO = 4,
    RICH = 5,
    DONATION = 10,
    SYSTEM_MESSAGE = 30
}

export interface Events {
    chat: ChatEvent
    donation: DonationEvent
    systemMessage: SystemMessageEvent
    connect: null
    disconnect: null
}

interface Event {
    message: string,
    hidden: boolean,
    memberCount: number,
    time: number
}

export interface ChatEvent extends Event {
    profile: Profile
    extras?: ChatExtras
}

export interface DonationEvent extends Event {
    profile: Profile
    extras: DonationExtras
}

export interface SystemMessageEvent extends Event {
    extras: SystemMessageExtras
}

export interface DonationRank {
    userIdHash: string
    nickName: string
    verifiedMark: boolean
    donationAmount: number
    ranking: number
}

export interface Profile {
    userIdHash: string
    nickname: string
    profileImageUrl?: string
    userRoleCode: string
    badge?: {
        imageUrl: string
    }
    title?: {
        name: string
        color: string
    }
    verifiedMark: boolean
    activityBadges: ActivityBadge[]
    streamingProperty: StreamingProperty
}

export interface StreamingProperty {
    realTimeDonationRanking?: {
        badge?: {
            title: string
            imageUrl: string
        }
    }
}

export interface ActivityBadge {
    badgeNo: number
    badgeId: string
    imageUrl: string
    title: string
    description: string
    activated: boolean
}

interface Extras {
    chatType: "STREAMING"
    emojis: Record<string, string> | string
    osType: "PC" | "AOS" | "IOS"
    streamingChannelId: string
}

export interface ChatExtras extends Extras {
    extraToken: string
}

export interface DonationExtras extends Extras {
    payType: string
    payAmount: number
    weeklyRankList: DonationRank[],
    donationUserWeeklyRank: number
}

export interface SystemMessageExtras {
    description: string
    styleType: number
    visibleRoles: string[]
    params: {
        registerNickname: string
        targetNickname: string
        registerChatProfile: Profile
        targetProfile: Profile
    }
}