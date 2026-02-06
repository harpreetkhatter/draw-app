import { WebSocketServer, WebSocket } from "ws"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket,
  rooms: string[],
  userId: string
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    if (typeof decoded === 'string') {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId as string;
  } catch (error) {
    return null;
  }
}

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return
  }
  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get("token") || "";
  const userId = checkUser(token)

  if (userId == null) {
    ws.close()
    return null;
  }

  users.push({
    userId,
    rooms: [],
    ws
  })

  ws.on("close", async function close() {
    const index = users.findIndex(x => x.ws === ws);
    if (index !== -1) {
      users.splice(index, 1);
    }
  })

  ws.on("message", async function message(data) {
    try {
      const parsedData = JSON.parse(data.toString()) //{type:"join_room",roomId:1}
      

      if (parsedData.type === "join_room") {
        const user = users.find(x => x.ws === ws)
        if (user && parsedData.roomId) {
          user.rooms.push(parsedData.roomId)
         
          // Send confirmation
          ws.send(JSON.stringify({
            type: "join_room",
            roomId: parsedData.roomId,
            message: "Successfully joined room"
          }));
        }
      }

      if (parsedData.type === "leave_room") {
        const user = users.find(x => x.ws === ws);
        if (!user) {
          return;
        }
        user.rooms = user.rooms.filter(
          x => x !== parsedData.roomId
        )
      
      }

      if (parsedData.type === "chat") {
        const roomId = parsedData.roomId; // This should be a number
        const message = parsedData.message;
        const sender = users.find(x => x.ws === ws);

        if (!sender) {
          console.log("Sender not found!");
          return;
        }

        // Check if sender is in the room
        if (!sender.rooms.includes(roomId)) {
          console.log(`Sender not in room ${roomId}. Sender rooms:`, sender.rooms);
          ws.send(JSON.stringify({
            type: "error",
            message: "You are not in this room"
          }));
          return;
        }

        // Save chat message to database
        await prismaClient.chat.create({
          data: {
            userId: userId,
            roomId: parseInt(roomId), // Convert to number if it's a string
            message
          }
        })

        // Broadcast to all users in the room (including sender)
        users.forEach(user => {
          if (user.rooms.includes(roomId)) {
            console.log(`Sending to user ${user.userId}`);
            user.ws.send(JSON.stringify({
              type: "chat",
              message: message,
              roomId,
              userId: sender.userId,
              timestamp: Date.now()
            }))
          }
        })
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  }
  )

});

