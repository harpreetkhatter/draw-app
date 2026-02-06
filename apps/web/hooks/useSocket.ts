import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";

export function useSocket() {
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState<WebSocket | null>(null)

  useEffect(() => {
    // Get token from localStorage (set during signin)
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    if (!token) {
      console.error("No token found. User needs to sign in.");
      setLoading(false);
      return;
    }

    console.log("Connecting to WebSocket with token...");
    const ws = new WebSocket(`${WS_URL}?token=${token}`)

    ws.onopen = () => {
      console.log("WebSocket connected!");
      setSocket(ws)
      setLoading(false)
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setLoading(false);
    }

    ws.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      setLoading(false);
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    }
  }, [])

  return {
    socket, loading
  }
}
