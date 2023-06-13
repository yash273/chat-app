import { Timestamp } from "@angular/fire/firestore";
import { userProfile } from "./user";

export interface Chat {
    id: string,
    userIds: string[],
    users: userProfile[],
    lastMessage?: string,
    lastMessageDate: Date & Timestamp,
    lastMessageUserId: string,
    lastMessageSeenByUserId: string,
    lastMessageSeenAt: Date & Timestamp,
    // is_chatOpen: boolean

    chatPic?: string,
    chatName: string | undefined
}

export interface Message {
    text: string,
    senderId: string,
    sentDate: Date & Timestamp,
    imgURL: string,
    is_seen: boolean
}