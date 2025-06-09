import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../api/user';

export default function AuthForm() {
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = isRegistering
        ? await registerUser(formData)
        : await loginUser(formData);
      if (res.success) {
        alert(res.message);
        if (isRegistering) setIsRegistering(false);
        navigate("/home");
      } else {
        setError(res.message);
      }
    } catch {
      setError("Something went wrong.");
    }
  };

  return (
    <section id="login-section">
      <h2 style={{ color: "aliceblue" }}>{isRegistering ? "Register" : "Login"}</h2>
      <form onSubmit={handleSubmit} id="login-form">
        {isRegistering && (
          <>
            <label htmlFor="name">Name:</label>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </>
        )}
        <label htmlFor="username">Username:</label>
        <input name="username" value={formData.username} onChange={handleChange} required />
        <label htmlFor="password">Password:</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        <button style={{ margin: "10px 0" }} type="submit">{isRegistering ? "Create Account" : "Login"}</button>
        {error && <span style={{ color: "red", alignSelf: "center", margin: "10px 0" }}>{error}</span>}
        {!isRegistering && (
          <button type="button" onClick={() => setIsRegistering(true)}>Create an account</button>
        )}
      </form>
    </section>
  );
}
