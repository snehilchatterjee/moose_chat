import React, { useEffect, useState, useRef } from "react";
import { getMessages,send_message, WS_URL } from "../api/user";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Messages.css";

export default function Messages() {
    const [messages, setMessages] = useState([]);
    const [otherUserName, setOtherUserName] = useState("Chat");
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [showLoadButton, setShowLoadButton] = useState(false);
    const token = localStorage.getItem("token");
    const location = useLocation();
    const navigate = useNavigate();
    const roomId = location.state?.roomId;
    const currentUser = localStorage.getItem("userId");
    const bottomRef = useRef(null);
    const messageListRef = useRef(null);

    const ws = useRef(null); // Create a ref to hold the WebSocket
    const earliestMessageTime = messages.length > 0 ? messages[0].timestamp : null;


    useEffect(() => {
        if (!token || !roomId) return;

        // Only create a new WebSocket if one doesn't already exist
        if (!ws.current) {
            ws.current = new WebSocket(`${WS_URL}?token=${token}&room_id=${roomId}`);

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

    // Handle scroll to show/hide load button
    useEffect(() => {
        const messageList = messageListRef.current;
        if (!messageList) return;

        const handleScroll = () => {
            const scrollTop = messageList.scrollTop;
            const threshold = 100; // Show button when scrolled up more than 100px from top
            
            // Only show button if there are more messages to load and user scrolled up
            setShowLoadButton(hasMore && scrollTop < threshold && messages.length > 0);
        };

        messageList.addEventListener('scroll', handleScroll);
        return () => messageList.removeEventListener('scroll', handleScroll);
    }, [hasMore, messages.length]);

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

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    const goBack = () => {
        navigate('/home');
    };

    return (
        <div className="messages-page-container">
            <div className="messages-container page-transition">
                <div className="messages-header">
                    <button className="back-button" onClick={goBack}>
                        ← Back
                    </button>
                    <h2>💬 {otherUserName}</h2>
                </div>
                
                {showLoadButton && (
                    <button
                        onClick={handleLoadOlderMessages}
                        className="load-older-btn"
                        disabled={loadingOlder}
                    >
                        {loadingOlder ? "Loading..." : "Load Older Messages"}
                    </button>
                )}

                <ul className="message-list" ref={messageListRef}>
                    {messages.map((message) => (
                        <li
                        key={message.id}
                        className={`message-item ${message.user_id == currentUser ? "self" : ""}`}
                        >
                        <strong>{message.user_id == currentUser ? "" : `User ${message.user_id}`}</strong>
                        {message.content}
                        </li>
                    ))}
                    <div ref={bottomRef} />
                </ul>

                <div className="input-container">
                    <input 
                        type="text" 
                        placeholder="Type your message..." 
                        onKeyPress={handleKeyPress}
                    />
                    <button className="send-button" onClick={() => sendMessage()}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}