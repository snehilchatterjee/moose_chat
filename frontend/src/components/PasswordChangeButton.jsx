import { changePassword } from "../api/user"; 

import { useState } from "react";

export default function PasswordChangeButton() {
  const [loading, setLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
    //   toast.error("Please fill in both fields.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await changePassword(token, oldPassword, newPassword);
    //   toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
    //   toast.error("Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="password"
        placeholder="Old Password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        disabled={loading}
      />
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleChangePassword} disabled={loading}>
        {loading ? "Changing..." : "Change Password"}
      </button>
    </div>
  );
}