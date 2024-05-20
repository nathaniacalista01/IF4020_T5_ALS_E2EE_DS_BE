import { Server, Socket } from "socket.io";
import { RoomchatService } from "../services/roomchat-service";
import { MessageService } from "../services/message-service";
import { Error } from "../types/error";
import { DeleteRoomChatPayload, JoinRoomPayload, SendMessagePayload } from "../types/socket";

let waitingQueue: { socket: Socket, userId: string, chatroomId: number }[] = [];
let waitingQueueRealtime: { socket: Socket, userId: string }[] = [];
let roomMessageQueues: { [key: number]: { senderId: string, receiverId: string, message: string }[] } = {};
let roomParticipants: { [key: number]: Set<string> } = {};

export const socketController = (io: Server, socket: Socket) => {
  const messageService = new MessageService();
  const roomchatService = new RoomchatService();

  socket.on("joinQueue", async ({ userId, chatroomId }: { userId: string, chatroomId: number }) => {
    console.log("Client joined the queue:", socket.id);

    waitingQueue.push({ socket, userId, chatroomId });

    const matchedClients = waitingQueue.filter(client => client.chatroomId === chatroomId);
    if (matchedClients.length >= 2) {
      const [client1, client2] = matchedClients.splice(0, 2);

      waitingQueue = waitingQueue.filter(client => client.userId !== client1.userId && client.userId !== client2.userId);

      const room = await roomchatService.getRoomchatById(chatroomId);
      if (room !== Error.INTERNAL_ERROR && room) {
        const roomId = room.id;
        client1.socket.join(roomId.toString());
        client2.socket.join(roomId.toString());

        client1.socket.emit("matched", { roomId, receiverId: client2.userId });
        client2.socket.emit("matched", { roomId, receiverId: client1.userId });

        roomParticipants[roomId] = new Set([client1.userId, client2.userId]);
        console.log("Ciee matched <3");
        console.log(`Room ${roomId} clients added:`, client1.socket.id, client2.socket.id);
      }
    }
  });

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
    const { roomId, senderId, receiverId, message } = payload;
    console.log("Received real-time message to send:", payload);

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

    if (!roomParticipants[roomIntId]) {
      roomParticipants[roomIntId] = new Set();
    }
    roomParticipants[roomIntId].add(socket.id);

    console.log(`Room ${roomIntId} participants:`, Array.from(roomParticipants[roomIntId]));

    socket.emit('roomMessages', room.messages);

    if (roomMessageQueues[roomIntId]) {
      roomMessageQueues[roomIntId].forEach((msg) => {
        socket.emit('receiveMessage', msg);
        console.log(`Queued message sent to client: ${socket.id}, message: ${msg.message}`);
      });
      roomMessageQueues[roomIntId] = [];
    }
  });

  socket.on("fetchMessages", async ({ roomId }) => {
    if (isNaN(Number(roomId))) {
      console.error('Invalid room ID:', roomId);
      socket.emit('error', 'Invalid room ID');
      return;
    }

    const roomIntId = Number(roomId);
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
    console.log(`Fetched messages for room ${roomIntId}`);
  });

  socket.on("sendMessage", async (payload: SendMessagePayload) => {
    const { roomId, senderId, receiverId, message } = payload;
    console.log("Received message to send:", payload);

    if (isNaN(Number(roomId))) {
      console.error('Invalid room ID:', roomId);
      socket.emit('error', 'Invalid room ID');
      return;
    }

    const roomIntId = Number(roomId);
    const response = await messageService.addMessage(senderId, receiverId, roomIntId, message);

    if (response !== Error.INTERNAL_ERROR) {
      if (roomParticipants[roomIntId] && roomParticipants[roomIntId].size === 2) {
        io.to(roomIntId.toString()).emit("receiveMessage", response);
        console.log(`Message sent to room ${roomIntId}:`, response);
      } else {
        if (!roomMessageQueues[roomIntId]) {
          roomMessageQueues[roomIntId] = [];
        }
        roomMessageQueues[roomIntId].push({ senderId, receiverId, message });
        console.log(`Message queued for room ${roomIntId}:`, { senderId, receiverId, message });
      }
    } else {
      console.error("Error sending message:", response);
      socket.emit('error', 'Error sending message');
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    waitingQueue = waitingQueue.filter(s => s.socket.id !== socket.id);
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
