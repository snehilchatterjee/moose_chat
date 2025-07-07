import RoomList from "../components/RoomList";
import PasswordChangeButton from "../components/PasswordChangeButton";
import "../styles/HomePage.css";
import { useNavigate } from 'react-router-dom';
import { createBotRoom } from '../api/user';

function HomePage() {
  const currentUser = localStorage.getItem("username") || "User";
  const navigate = useNavigate();

  const goToChatbot = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/');
        return;
      }
      
      const response = await createBotRoom(token);
      if (response.room_id) {
        // Navigate to Messages page with bot room info
        navigate('/messages', {
          state: {
            roomId: response.room_id,
            otherUserName: "🤖 ChatBot",
            isBotChat: true
          }
        });
      } else {
        console.error("Failed to create bot room");
      }
    } catch (error) {
      console.error("Error creating bot room:", error);
    }
  };

  return (
    <div className="home-page page-transition">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="moose-emoji">🫎</span>
            Welcome to Moose Chat
          </h1>
          <p className="hero-subtitle">
            Connect with friends and start conversations
          </p>
          <div className="welcome-message">
            Hello, <span className="username">{currentUser}</span>!
          </div>
        </div>
      </div>
      
      <div className="main-content">
        <div className="chat-section">
          <h2 className="section-title">Start a Conversation</h2>
          <p className="section-description">
            Choose someone to chat with from your contacts below
          </p>
          <RoomList />
          <button onClick={goToChatbot} className="chatbot-button">Chat with Bot</button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
