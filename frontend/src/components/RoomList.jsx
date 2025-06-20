import "../styles/HomePage.css";
import { useState, useEffect } from "react";
import { getUsers, getRoom } from "../api/user";
import { useNavigate } from 'react-router-dom';

export default function RoomList() {
    const [users, setUsers] = useState([]);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        if (!token) {
        window.location.href = "/";
        return;
        }

        const fetchUsers = async () => {
        try {
            const userList = await getUsers(token);
            const filteredUsers = userList.filter(user => user.id != userId);
            setUsers(filteredUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
        };

        fetchUsers();
    }, [token]);


    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    const handleRoom = async (userId,name) => {
        try {
          
            const roomId = await getRoom(token, userId);
            console.log("Room ID:", roomId);
            navigate('/messages', { state: { roomId, otherUserName: name } });
        } catch (error) {
        console.error("Error fetching messages:", error);
        }
    }


    return (
     <>   
    <div className="home-container">
      <h1 className="title">Moose!</h1>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>

      <ul className="user-list">
        {users.length === 0 ? (
          <div className="no-users">
            <p>👥 No other users found</p>
            <p>Invite friends to start chatting!</p>
          </div>
        ) : (
          users.map((user) => (
            <li key={user.id}>
              <div className="user-card" onClick={() => handleRoom(user.id,user.name)}>
                <div className="user-avatar">
                  <span className="avatar-text">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="user-info">
                  <h3 className="user-name">{user.name}</h3>
                  <p className="user-status">💬 Start a conversation</p>
                </div>
                <div className="user-action">
                  <span className="action-icon">→</span>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
    </>
    );
}