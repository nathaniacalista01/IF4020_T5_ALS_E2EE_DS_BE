export interface JoinRoomPayload {
    roomId: string;
}

export interface SendMessagePayload {
    roomId: string;
    senderId: string;
    receiverId: string;
    message: string;
}
  

export interface DeleteRoomChatPayload {
    chatroomId: string;
}
