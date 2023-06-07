import { userProfile } from "./user";

export interface Chat {
    id: string,
    userIds: string[],
    users: userProfile[],
    lastMessage?: string,
    lastMessageDate?: string,

    chatPic?: string,
    chatName: string | undefined
}

export interface Message {
    text: string,
    senderId: string,
    sentDate: string
}