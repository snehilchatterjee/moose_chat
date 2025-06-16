import React, { useEffect, useState, useRef } from "react";
import { getMessages, send_message, WS_URL } from "../api/user";
import { useLocation } from "react-router-dom";
import "../styles/Messages.css";

export default function Messages() {
    const [messages, setMessages] = useState([]);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [hasMore, setHasMore] = useState(true); // Optional: for infinite scroll
    const token = localStorage.getItem("token");
    const location = useLocation();
    const roomId = location.state?.roomId;
    const currentUser = localStorage.getItem("userId");
    const bottomRef = useRef(null);
    const ws = useRef(null);

    // Track the earliest message timestamp
    const earliestMessageTime = messages.length > 0 ? messages[0].timestamp : null;

    useEffect(() => {
        if (!token || !roomId) return;

        if (!ws.current) {
            ws.current = new WebSocket(`${WS_URL}?token=${token}&room_id=${roomId}`);
            ws.current.onopen = () => console.log("WebSocket connected");
            ws.current.onclose = () => console.log("WebSocket closed");
            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.room_id === parseInt(roomId)) {
                    setMessages((prev) => [...prev, data]);
                }
            };
        }

        return () => {
            if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.close();
            }
        };
    }, [token, roomId]);

    useEffect(() => {
        if (!token || !roomId) {
            window.location.href = "/home";
            return;
        }

        const fetchMessages = async () => {
            try {
                const response = await getMessages(token, roomId);
                setMessages(response);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();
    }, [token, roomId]);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleLoadOlderMessages = async () => {
        if (!earliestMessageTime || loadingOlder) return;

        setLoadingOlder(true);
        try {
            const response = await getMessages(token, roomId, earliestMessageTime);
            if (response.length === 0) setHasMore(false); // No more messages
            setMessages((prev) => [...response, ...prev]);
        } catch (error) {
            console.error("Error loading older messages:", error);
        }
        setLoadingOlder(false);
    };

    const sendMessage = () => {
        const input = document.querySelector(".input-container input");
        const messageContent = input.value.trim();
        if (!messageContent) return;

        const message = {
            content: messageContent,
            room_id: parseInt(roomId),
        };

        send_message(token, message)
            .then((data) => {
                setMessages((prev) => [
                    ...prev,
                    {
                        ...message,
                        user_id: currentUser,
                        id: data.message_id,
                        timestamp: new Date().toISOString(), // Optional for UI consistency
                    },
                ]);
                input.value = "";
            })
            .catch((error) => console.error("Error sending message:", error));
    };

    return (
        <div className="messages-container">
            <button
                onClick={handleLoadOlderMessages}
                className="load-older-btn"
                disabled={loadingOlder || !hasMore}
            >
                {hasMore ? (loadingOlder ? "Loading..." : "Load Older Messages") : "No more messages"}
            </button>

            <ul className="message-list">
                {messages.map((message) => (
                    <li
                        key={message.id}
                        className={`message-item ${message.user_id == currentUser ? "self" : ""}`}
                    >
                        <strong>{message.user_id == currentUser ? "" : `User ${message.user_id}:`}</strong>
                        {message.content}
                    </li>
                ))}
                <div ref={bottomRef} />
            </ul>

            <div className="input-container">
                <input type="text" placeholder="Type your message..." />
                <button className="send-button" onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}
