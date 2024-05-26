export interface SendMessagePayload {
    roomId: string;
    senderId: string;
    receiverId: string;
    message: string;
    isSigned: boolean;
    signature?: string;
    ecegVal: string;
}

export interface DeleteRoomChatPayload {
    chatroomId: string;
}
