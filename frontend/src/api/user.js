const BASE_URL = "http://127.0.0.1:8000/api/v1";

export async function loginUser({ username, password }) {
  const res = await fetch(`http://127.0.0.1:8000/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
  });
  const data = await res.json();
  console.log("Login response:", data);
  return { success: !!data.token, message: data.message || "Login successful" };
}

export async function registerUser({ name, username, password }) {
  const res = await fetch(`${BASE_URL}/user/create_user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, username, password }),
  });
  const data = await res.json();
  console.log("Register response:", data);
  return { success: !!data.uid, message: data.message || "User created successfully" };
}
