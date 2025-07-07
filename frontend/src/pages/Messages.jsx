import React, { useEffect, useState, useRef } from "react";
import { getMessages, send_message, sendMessage, WS_URL } from "../api/user";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Messages.css";

export default function Messages() {
    const [messages, setMessages] = useState([]);
    const [otherUserName, setOtherUserName] = useState("Chat");
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [showLoadButton, setShowLoadButton] = useState(false);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
    const [isBotChat, setIsBotChat] = useState(false);
    const [botThinking, setBotThinking] = useState(false);
    const token = localStorage.getItem("token");
    const location = useLocation();
    const navigate = useNavigate();
    const roomId = location.state?.roomId;
    const currentUser = localStorage.getItem("userId");
    const bottomRef = useRef(null);
    const messageListRef = useRef(null);

    const otherUserFromState = location.state?.otherUserName;
    const isBotChatFromState = location.state?.isBotChat;

    const ws = useRef(null); // Create a ref to hold the WebSocket
    const earliestMessageTime = messages.length > 0 ? messages[0].timestamp : null;

    useEffect(() => {
        if (otherUserFromState) {
            setOtherUserName(otherUserFromState);
        }
        if (isBotChatFromState) {
            setIsBotChat(isBotChatFromState);
        }
    }, [otherUserFromState, isBotChatFromState]);


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
                    setShouldScrollToBottom(true); // Scroll to bottom for new messages
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
            setShouldScrollToBottom(true); // Scroll to bottom for initial load
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
        };
    
        fetchMessages();
    }, [token, roomId]);

    useEffect(() => {
        if (shouldScrollToBottom && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
            setShouldScrollToBottom(false); // Reset the flag
        }
    }, [messages, shouldScrollToBottom]);

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
        
        // Store current scroll position and height before loading
        const messageList = messageListRef.current;
        const scrollTop = messageList.scrollTop;
        const scrollHeight = messageList.scrollHeight;
        
        try {
            const response = await getMessages(token, roomId, earliestMessageTime);
            if (response.length === 0) {
                setHasMore(false); // No more messages
            } else {
                setMessages((prev) => [...response, ...prev]);
                
                // Restore scroll position after DOM update
                setTimeout(() => {
                    const newScrollHeight = messageList.scrollHeight;
                    const heightDifference = newScrollHeight - scrollHeight;
                    messageList.scrollTop = scrollTop + heightDifference;
                }, 0);
            }
        } catch (error) {
            console.error("Error loading older messages:", error);
        }
        setLoadingOlder(false);
    };


    const sendMessage_func = () => {
        const input = document.querySelector(".input-container input");
        const messageContent = input.value.trim();
        if (!messageContent) return;

        const message = {
            content: messageContent,
            room_id: parseInt(roomId)
        };

        // Clear input immediately for better UX
        input.value = "";

        if (isBotChat) {
            // For bot chat, show user message immediately
            const userMessage = {
                content: messageContent,
                user_id: currentUser,
                id: Date.now(), // Temporary ID
                timestamp: new Date().toISOString()
            };
            
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            setShouldScrollToBottom(true);
            setBotThinking(true);

            // Send to bot and handle response
            sendMessage(token, parseInt(roomId), messageContent, true)
                .then((data) => {
                    setBotThinking(false);
                    // Refresh messages to get the bot response (this will include both user and bot messages)
                    return getMessages(token, roomId).then(newMessages => {
                        setMessages(newMessages);
                        setShouldScrollToBottom(true);
                    });
                })
                .catch((error) => {
                    console.error("Error sending message:", error);
                    setBotThinking(false);
                    // Remove the optimistic message on error
                    setMessages((prevMessages) => 
                        prevMessages.filter(msg => msg.id !== userMessage.id)
                    );
                });
        } else {
            // For regular chat, use the original logic
            send_message(token, message)
                .then((data) => {
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            ...message,
                            user_id: currentUser,
                            id: data.message_id
                        }
                    ]);
                    setShouldScrollToBottom(true);
                })
                .catch((error) => {
                    console.error("Error sending message:", error);
                });
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage_func();
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
                    {messages.map((message) => {
                        const isCurrentUser = message.user_id == currentUser;
                        const isBotMessage = isBotChat && !isCurrentUser;
                        
                        return (
                            <li
                                key={message.id}
                                className={`message-item ${isCurrentUser ? "self" : ""} ${isBotMessage ? "bot-message" : ""}`}
                            >
                                <strong>
                                    {isCurrentUser ? "" : isBotMessage ? "🤖 " : `${otherUserName}: `}
                                </strong>
                                {message.content}
                            </li>
                        );
                    })}
                    
                    {botThinking && (
                        <li className="message-item bot-message bot-thinking">
                            <strong>🤖 </strong>
                            <span className="thinking-dots">
                                <span>.</span><span>.</span><span>.</span>
                            </span>
                            <span style={{marginLeft: '10px', fontStyle: 'italic', opacity: 0.7}}>thinking...</span>
                        </li>
                    )}
                    
                    <div ref={bottomRef} />
                </ul>

                <div className="input-container">
                    <input 
                        type="text" 
                        placeholder="Type your message..." 
                        onKeyPress={handleKeyPress}
                    />
                    <button className="send-button" onClick={() => sendMessage_func()}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}