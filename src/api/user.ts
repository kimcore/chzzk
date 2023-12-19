export interface User {
    hasProfile: boolean
    loggedIn: boolean
    nickname: string
    officialNotiAgree: boolean
    officialNotiAgreeUpdateDate?: string
    penalties: [] // unknown
    profileImageUrl: string
    userIdHash: string
    verifiedMark: boolean
}