import { Server, Socket } from "socket.io";
import { RoomchatService } from "../services/roomchat-service";
import { MessageService } from "../services/message-service";
import { Error } from "../types/error";
import { JoinRoomPayload, SendMessagePayload } from "../types/socket";

let waitingQueue: { socket: Socket, userId: string }[] = [];

export const socketController = (io: Server, socket: Socket) => {
  const messageService = new MessageService();
  const roomchatService = new RoomchatService();

  socket.on("joinQueue", async ({ userId }: { userId: string }) => {
    console.log("Client joined the queue:", socket.id);

    waitingQueue.push({ socket, userId });

    if (waitingQueue.length >= 2) {
      const [client1, client2] = waitingQueue.splice(0, 2);

      const room = await roomchatService.createRoomchat(client1.userId, client2.userId);
      if (room !== Error.INTERNAL_ERROR) {
        const roomId = room.id;
        client1.socket.join(roomId.toString());
        client2.socket.join(roomId.toString());

        client1.socket.emit("matched", { roomId, receiverId: client2.userId });
        client2.socket.emit("matched", { roomId, receiverId: client1.userId });

        console.log("Ciee match <3");
        console.log(`Room ${roomId} created and clients added:`, client1.socket.id, client2.socket.id);
      }
    }
  });

  socket.on("joinRoom", async (payload: JoinRoomPayload) => {
    const { roomId } = payload;

    if (isNaN(Number(roomId))) {
      console.error('Invalid room ID:', roomId);
      socket.emit('error', 'Invalid room ID');
      return;
    }

    const roomIntId = Number(roomId);
    socket.join(roomIntId.toString());
    console.log(`User joined room: ${roomIntId}`);

    const room = await roomchatService.getRoomchatById(roomIntId);
    if (room === Error.INTERNAL_ERROR) {
      socket.emit('error', 'Error fetching room messages');
      return;
    }

    if (!room) {
      console.error('Room not found:', roomIntId);
      socket.emit('error', 'Room not found');
      return;
    }

    socket.emit('roomMessages', room.messages);
  });

  socket.on("sendMessage", async (payload: SendMessagePayload) => {
    const { roomId, senderId, receiverId, message } = payload;
    console.log("Received message:", message);
    
    if (isNaN(Number(roomId))) {
      console.error('Invalid room ID:', roomId);
      socket.emit('error', 'Invalid room ID');
      return;
    }

    const response = await messageService.addMessage(senderId, receiverId, Number(roomId), message);

    if (response !== Error.INTERNAL_ERROR) {
      io.to(roomId.toString()).emit("receiveMessage", response);
    } else {
      console.error("Error sending message:", response);
      socket.emit('error', 'Error sending message');
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    waitingQueue = waitingQueue.filter(s => s.socket.id !== socket.id);
  });
};
