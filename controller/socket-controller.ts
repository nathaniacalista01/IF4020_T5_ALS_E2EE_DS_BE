import { Server, Socket } from "socket.io";
import { RoomchatService } from "../services/roomchat-service";
import { MessageService } from "../services/message-service";
import { Error } from "../types/error";
import { DeleteRoomChatPayload, SendMessagePayload } from "../types/socket";

let waitingQueueRealtime: { socket: Socket, userId: string }[] = [];
let roomParticipants: { [key: number]: Set<string> } = {};

export const socketController = (io: Server, socket: Socket) => {
  const messageService = new MessageService();
  const roomchatService = new RoomchatService();

  socket.on("joinRealTimeQueue", async ({ userId }: { userId: string }) => {
    console.log("Client joined the real-time queue:", socket.id);

    waitingQueueRealtime.push({ socket, userId });

    if (waitingQueueRealtime.length >= 2) {
      const [client1, client2] = waitingQueueRealtime.splice(0, 2);

      const room = await roomchatService.createRoomchat(client1.userId, client2.userId);
      if (room !== Error.INTERNAL_ERROR) {
        const roomId = room.id;
        client1.socket.join(roomId.toString());
        client2.socket.join(roomId.toString());

        client1.socket.emit("matchedRealTime", { roomId, receiverId: client2.userId });
        client2.socket.emit("matchedRealTime", { roomId, receiverId: client1.userId });

        roomParticipants[roomId] = new Set([client1.userId, client2.userId]);
        console.log(`Real-time room ${roomId} created and clients added:`, client1.socket.id, client2.socket.id);
      }
    }
  });

  socket.on("sendRealTimeMessage", async (payload: SendMessagePayload) => {
    const { roomId, senderId, receiverId, message, isSigned, signature } = payload;
    console.log("Received real-time message to send:", payload);

    if (isNaN(Number(roomId))) {
      console.error('Invalid room ID:', roomId);
      socket.emit('error', 'Invalid room ID');
      return;
    }

    const response = await messageService.addMessage(senderId, receiverId, Number(roomId), message, isSigned, signature);

    if (response !== Error.INTERNAL_ERROR) {
      io.to(roomId.toString()).emit("receiveMessage", response);
    } else {
      console.error("Error sending message:", response);
      socket.emit('error', 'Error sending message');
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    waitingQueueRealtime = waitingQueueRealtime.filter(s => s.socket.id !== socket.id)

    for (const roomId in roomParticipants) {
      roomParticipants[roomId].delete(socket.id);
      if (roomParticipants[roomId].size === 0) {
        delete roomParticipants[roomId];
      }
    }

    console.log("Updated waiting queue and room participants after disconnect");
  });

  socket.on("deleteChatroom", async ( payload: DeleteRoomChatPayload ) => {
    const { chatroomId } = payload
    const roomId = Number(chatroomId)
    const room = await roomchatService.getRoomchatById(roomId);
    if (room === Error.INTERNAL_ERROR || !room) {
      socket.emit('error', 'Error fetching room or room not found');
      return;
    }

    const participants = roomParticipants[roomId];
    if (participants) {
      participants.forEach(participantId => {
        const participantSocket = io.sockets.sockets.get(participantId);
        if (participantSocket) {
          participantSocket.leave(chatroomId.toString());
          participantSocket.emit('kicked', `Room ${chatroomId} has been deleted`);
        }
      });
      delete roomParticipants[roomId];
    }

    const result = await roomchatService.deleteRoomchat(roomId);
    if (result === Error.INTERNAL_ERROR) {
      socket.emit('error', 'Error deleting room');
      return;
    }

    console.log(`Room ${chatroomId} deleted successfully`);
    io.emit('chatroomDeleted', chatroomId);
  });
};
