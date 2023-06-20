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
    is_chatOpen: boolean
    chatOpenedBy: string
    chatOpenedAt: Date & Timestamp,

    chatPic?: string,
    chatName: string | undefined
    chatUser: string
}

export interface Message {
    text: string,
    senderId: string,
    sentDate: Date & Timestamp,
    fileURL: string,
    is_seen: boolean
    docType: string
    about: {
        name: string
    }

}