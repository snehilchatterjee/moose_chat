export const API_URL = "127.0.0.1:8000";
export const BASE_URL = `http://${API_URL}/api/v1`;
export const WS_URL = `ws://${API_URL}/api/v1/ws`;

export async function loginUser({ username, password }) {
  console.log(`${API_URL}/auth/token`);
  const res = await fetch(`http://${API_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
  });
  const data = await res.json();
  return { success: !!data.access_token, response: data || "Login successful" };
}

export async function registerUser({ name, username, password }) {
  const res = await fetch(`${BASE_URL}/user/create_user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, username, password }),
  });
  const data = await res.json();
  // console.log("Register response:", data);
  return { success: !!data.access_token, response: data || "User created successfully" };
}

export async function getUsers(token) {
  const res = await fetch(`${BASE_URL}/user/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }
  return res.json();
}


export async function getMessages(token, roomId, before = null, limit = 20) {
  const url = new URL(`${BASE_URL}/user/get_messages/${roomId}`);
  if (before) url.searchParams.append("before", before);
  url.searchParams.append("limit", limit);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch messages");
  }
  return res.json();
}



export async function getRoom(token, userId) {
  const res = await fetch(`${BASE_URL}/user/get_room/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch room");
  }
  // res.json().then(data => console.log("Room id:", data.room_id));
  // console.log(getMessages)
  const data= await res.json();
  return data.room_id;
}


export async function send_message(token, message) {
  const res = await fetch(`${BASE_URL}/user/send_message/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      room_id: message.room_id,
      content: message.content
    })
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Send message error:", data?.detail);
    throw new Error("Message sending failed");
  }

  return data;
}

export async function changePassword(token, oldPassword, newPassword) {
  const res = await fetch(`http://${API_URL}/auth/change_password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to change password");
  }

  return res.json();
}