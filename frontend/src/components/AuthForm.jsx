import React, { use, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../api/user';

export default function AuthForm() {
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/home");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = isRegistering
        ? await registerUser(formData)
        : await loginUser(formData);
      // console.log("Response:", res);
      if (res.success) {
        const token = res.response.access_token;
        // store the token in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("userId", res.response.uid);
        localStorage.setItem("username", res.response.username);
        navigate("/home");
        if (isRegistering) setIsRegistering(false);
      } else {
        setError(res.message);
      }
    } catch {
      setError("Something went wrong.");
    }
  };

  return (
    <section id="login-section">
      <h2>{isRegistering ? "Create Account" : "Welcome Back"}</h2>
      <form onSubmit={handleSubmit} id="login-form">
        {isRegistering && (
          <>
            <label htmlFor="name">Full Name</label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Enter your full name"
              required 
            />
          </>
        )}
        <label htmlFor="username">Username</label>
        <input 
          name="username" 
          value={formData.username} 
          onChange={handleChange} 
          placeholder="Enter your username"
          required 
        />
        <label htmlFor="password">Password</label>
        <input 
          type="password" 
          name="password" 
          value={formData.password} 
          onChange={handleChange} 
          placeholder="Enter your password"
          required 
        />
        <button type="submit">
          {isRegistering ? "Create Account" : "Sign In"}
        </button>
        {error && <div className="error-message">{error}</div>}
        {!isRegistering && (
          <button type="button" className="btn-secondary" onClick={() => setIsRegistering(true)}>
            New here? Create an account
          </button>
        )}
        {isRegistering && (
          <button type="button" className="btn-secondary" onClick={() => setIsRegistering(false)}>
            Already have an account? Sign in
          </button>
        )}
      </form>
    </section>
  );
}
