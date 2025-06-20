
import RoomList from "../components/RoomList";
import PasswordChangeButton from "../components/PasswordChangeButton";
import "../styles/HomePage.css";

function HomePage() {
  const currentUser = localStorage.getItem("username") || "User";
  
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
        </div>
      </div>
    </div>
  );
}

export default HomePage;
