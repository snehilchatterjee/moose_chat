import React, { useEffect, useState, useRef } from "react";
import { getMessages,send_message } from "../api/user";
import { useLocation } from "react-router-dom";
import "../styles/Messages.css";

export default function Messages() {
    const [messages, setMessages] = useState([]);
    const token = localStorage.getItem("token");
    const location = useLocation();
    const roomId = location.state?.roomId;
    const currentUser = localStorage.getItem("userId");
    const bottomRef = useRef(null);

    const ws = useRef(null); // Create a ref to hold the WebSocket

    useEffect(() => {
        if (!token || !roomId) return;

        // Only create a new WebSocket if one doesn't already exist
        if (!ws.current) {
            ws.current = new WebSocket(`ws://localhost:8000/api/v1/ws?token=${token}&room_id=${roomId}`);

            ws.current.onopen = () => {
                console.log("WebSocket connection established");
            };

            ws.current.onclose = () => {
                console.log("WebSocket connection closed");
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log("WebSocket message received:", data);
                if (data.room_id === parseInt(roomId)) {
                    setMessages((prevMessages) => [...prevMessages, data]);
                }
            };
        }

        // The cleanup function will be called when the component unmounts
        return () => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                console.log("Closing WebSocket connection");
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
            console.log(response);
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


    const sendMessage = () => {
        const input = document.querySelector(".input-container input");
        const messageContent = input.value.trim();
        if (!messageContent) return;

        const message = {
            content: messageContent,
            room_id: parseInt(roomId)
        };

        send_message(token, message)
            .then((data) => {
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                ...message,
                user_id: currentUser, // For local rendering only
                id: data.message_id   // Use the real ID returned by backend
                }
            ]);
            input.value = "";
            })
            .catch((error) => {
            console.error("Error sending message:", error);
            });
        };


    return (
        <div className="messages-container">
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
                <button className="send-button" onClick={() => sendMessage()}>Send</button>
            </div>
        </div>
    );
}