"use client"

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket"

export function ChatRoomClient({ messages, id }: {
  messages: { message: string }[],
  id: string
}) {
  const [chats, setChats] = useState(messages)
  const { socket, loading } = useSocket();
  const [currentMessage, setCurrentMessage] = useState("")

  useEffect(() => {
    if (!socket || loading) return;

    console.log("Joining room:", id);
    socket.send(JSON.stringify({
      type: "join_room",
      roomId: id
    }))

    const handleMessage = (event: MessageEvent) => {
      const parsedData = JSON.parse(event.data);
      console.log("Received message:", parsedData);
      if (parsedData.type === "chat") {
        setChats(c => [...c, { message: parsedData.message }])
      }
    }

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    }
  }, [socket, loading, id])
  return <div>
    {chats.map((m, i) => <div key={i}>{m.message}</div>)}
    <input type="text" value={currentMessage} onChange={e => { setCurrentMessage(e.target.value) }} />
    <button onClick={() => {

      socket?.send(JSON.stringify({
        type: "chat",
        roomId: id,
        message: currentMessage
      })
      )
      setCurrentMessage("")
    }}>Send</button>
  </div>
}