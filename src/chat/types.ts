import {ChzzkAPIBaseUrls} from "../types"
import {ChzzkClient} from "../client"

export interface ChzzkChatOptions {
    chatChannelId?: string
    accessToken?: string
    channelId?: string
    pollInterval?: number
    baseUrls?: ChzzkAPIBaseUrls
}

export interface ChzzkChatOptionsWithClient extends ChzzkChatOptions {
    client?: ChzzkClient
}

export enum ChatCmd {
    PING = 0,
    PONG = 10000,
    CONNECT = 100,
    CONNECTED = 10100,
    REQUEST_RECENT_CHAT = 5101,
    RECENT_CHAT = 15101,
    EVENT = 93006,
    CHAT = 93101,
    DONATION = 93102,
    KICK = 94005,
    BLOCK = 94006,
    BLIND = 94008,
    NOTICE = 94010,
    PENALTY = 94015,
    SEND_CHAT = 3101
}

export enum ChatType {
    TEXT = 1,
    IMAGE = 2,
    STICKER = 3,
    VIDEO = 4,
    RICH = 5,
    DONATION = 10,
    SUBSCRIPTION = 11,
    SYSTEM_MESSAGE = 30
}

export interface Events {
    chat: ChatEvent
    donation: DonationEvent
    subscription: SubscriptionEvent
    systemMessage: SystemMessageEvent
    notice: NoticeEvent
    blind: BlindEvent
    connect: string
    disconnect: string
    reconnect: string
    raw: any
}

interface EventWithProfile {
    profile: Profile
}

interface EventWithMessage {
    message: string,
    hidden: boolean,
    time: number
}

interface EventWithMemberCount {
    memberCount: number
}

interface EventWithIsRecent {
    isRecent: boolean
}

export interface ChatEvent extends EventWithProfile, EventWithMessage, EventWithMemberCount, EventWithIsRecent {
    extras?: ChatExtras
}

export interface DonationEvent extends EventWithMessage, EventWithMemberCount, EventWithIsRecent {
    profile?: Profile
    extras: DonationExtras
}

export interface SubscriptionEvent extends EventWithMessage, EventWithMemberCount, EventWithIsRecent {
    profile: Profile,
    extras: SubscriptionExtras
}

export interface SystemMessageEvent extends EventWithMessage, EventWithIsRecent {
    extras: SystemMessageExtras
}

export interface NoticeEvent extends EventWithProfile, EventWithMessage, EventWithIsRecent {
    extras: NoticeExtras
}

export interface BlindEvent {
    messageTime: number
    blindType: string
    blindUserId?: string
    serviceId: string
    message?: string
    userId: string
    channelId: string
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
    userRoleCode: "common_user" | "streamer" | "streaming_chat_manager" | "streaming_channel_manager" | "manager"
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
    },
    subscription?: {
        accumulativeMonth: number
        tier: number
        badge: {
            imageUrl: string
        }
    },
    following?: {
        followDate: string
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
    emojis: Record<string, string> | ''
    osType: "PC" | "AOS" | "IOS"
    streamingChannelId: string
}

export interface ChatExtras extends Extras {
    extraToken: string
}

export interface BaseDonationExtras extends Extras {
    isAnonymous: boolean
    nickname?: string
    payType: string
    payAmount: number
    weeklyRankList: DonationRank[]
    donationUserWeeklyRank?: DonationRank
}

export interface ChatDonationExtras extends BaseDonationExtras {
    donationType: "CHAT"
}

export interface VideoDonationExtras extends BaseDonationExtras {
    donationType: "VIDEO"
}

export interface MissionDonationExtras extends BaseDonationExtras {
    donationType: "MISSION"
    durationTime?: number
    missionDonationId?: string
    missionCreatedTime?: string
    missionEndTime?: string
    missionText?: string
    status?: string
    success?: boolean
}

export type DonationExtras = ChatDonationExtras | VideoDonationExtras | MissionDonationExtras

export interface SubscriptionExtras {
    month: number
    tierName: string
    nickname: string
    tierNo: number
}

export interface SystemMessageExtras {
    description: string
    styleType: number
    visibleRoles: string[]
    params?: {
        registerNickname: string
        targetNickname: string
        registerChatProfile: Profile
        targetProfile: Profile
    }
}

export interface NoticeExtras extends ChatExtras {
    registerProfile: Profile
}

export interface ChatAccessToken {
    accessToken: string
    extraToken: string
    realNameAuth: boolean
    temporaryRestrict: {
        createdTime?: number
        duration?: number
        temporaryRestrict: boolean
        times: number
    }
}