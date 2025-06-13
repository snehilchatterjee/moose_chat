import React, { useEffect, useState } from "react";
import { getMessages } from "../api/user";
import { useLocation } from "react-router-dom";
import "../styles/Messages.css";

export default function Messages() {
    const [messages, setMessages] = useState([]);
    const token = localStorage.getItem("token");
    const location = useLocation();
    const roomId = location.state?.roomId;

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
    
    return (
        <div className="messages-container">
        <ul className="message-list">
            {messages.map((message) => (
            <li key={message.id} className="message-item">
                {message.content}
            </li>
            ))}
        </ul>
        </div>
    );
}