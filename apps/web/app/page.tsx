"use client"
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function Home() {
  const [roomId, setRoomId] = useState("")
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/signin");
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "40px"
      }}>
        <h1 style={{ color: "white", margin: 0 }}>Chat Rooms</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 20px",
            background: "rgba(255, 255, 255, 0.2)",
            border: "1px solid white",
            borderRadius: "8px",
            color: "white",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Logout
        </button>
      </div>

      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        gap: "20px"
      }}>
        <div style={{
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          maxWidth: "500px",
          width: "100%"
        }}>
          <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#333" }}>
            Join a Room
          </h2>
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            type="text"
            placeholder="Enter room ID"
            style={{
              width: "100%",
              padding: "15px",
              fontSize: "16px",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              marginBottom: "15px",
              boxSizing: "border-box",
              outline: "none",
              transition: "border-color 0.3s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#667eea"}
            onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
          />
          <button
            onClick={() => {
              if (roomId.trim()) {
                router.push(`/room/${roomId}`)
              }
            }}
            style={{
              width: "100%",
              padding: "15px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 5px 20px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}
