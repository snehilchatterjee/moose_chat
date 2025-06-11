import { useState, useEffect } from "react";
import { getUsers, getRoom } from "../api/user";
import "../styles/HomePage.css";

function HomePage() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");
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

  return (
    <div className="home-container">
      <h1 className="title">Moose!</h1>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>

      <ul className="user-list">
        {users.map((user) => (
          <li key={user.id}>
            <button className="user-button" onClick={() => getRoom(token, user.id)}>{user.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
