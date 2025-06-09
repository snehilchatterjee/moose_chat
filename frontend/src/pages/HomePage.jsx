function HomePage() {
    // get token from localStorage
    const token = localStorage.getItem("token");
    // if token is not present, redirect to login page
    if (!token) {
        window.location.href = "/";
    }
    // if token is present, display home page content
    console.log("Token:", token);
    // You can add more functionality here, like fetching user data or displaying personalized content
    // For now, we'll just display a welcome message        
  return (
    <>
      <h1>Welcome to the Home Page!</h1>
    </>
  );
}

export default HomePage;