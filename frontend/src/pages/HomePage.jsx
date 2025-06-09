function HomePage() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/";
    }
    console.log("Token:", token);

    const logout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    }
    console.log("Logged out");

  return (
    <>
      <h1>Welcome to the Home Page!</h1>
      <button style={{ margin: "10px 0", alignItems: "center" }} onClick={logout}>Logout</button>
    </>
  );
}

export default HomePage;