import React, { useEffect, useState, useRef } from "react";
import { getMessages } from "../api/user";
import { useLocation } from "react-router-dom";
import "../styles/Messages.css";

export default function Messages() {
    const [messages, setMessages] = useState([]);
    const token = localStorage.getItem("token");
    const location = useLocation();
    const roomId = location.state?.roomId;
    const currentUser = localStorage.getItem("userId");
    const bottomRef = useRef(null);


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


    // websocket connection can be added here for real-time updates
    
    return (
        <div className="messages-container">
        <ul className="message-list">
        {[...messages].reverse().map((message) => (
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
        <button className="send-button">Send</button>
        </div>
        </div>
    );
}